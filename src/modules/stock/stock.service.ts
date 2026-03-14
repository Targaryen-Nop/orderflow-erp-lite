import { ClientSession, Types } from "mongoose";
import { z } from "zod";
import { Product } from "../product/product.model";
import { StockBalance, StockMovement } from "./stock.model";

export const stockInSchema = z.object({
  productId: z.string().min(1),
  warehouseId: z.string().min(1),
  qty: z.number().int().positive(),
  note: z.string().optional(),
});

type SessionRefParams = {
  session: ClientSession;
  productId: Types.ObjectId;
  warehouseId: string;
  qty: number;
  refType: string;
  refId: string;
  note?: string;
};

export async function listStockBalances() {
  const balances = await StockBalance.aggregate([
    {
      $lookup: {
        from: "products",
        localField: "productId",
        foreignField: "_id",
        as: "product",
      },
    },
    { $unwind: "$product" },
    {
      $project: {
        _id: 1,
        warehouseId: 1,
        qtyOnHand: 1,
        qtyReserved: 1,
        available: { $subtract: ["$qtyOnHand", "$qtyReserved"] },
        productId: "$product._id",
        sku: "$product.sku",
        productName: "$product.name",
        unit: "$product.unit",
      },
    },
    { $sort: { productName: 1, warehouseId: 1 } },
  ]);

  return balances;
}

export async function addStock(input: z.infer<typeof stockInSchema>) {
  const parsed = stockInSchema.parse(input);
  const product = await Product.findById(parsed.productId).lean();

  if (!product) {
    throw new Error("Product not found");
  }

  const balance = await StockBalance.findOneAndUpdate(
    { productId: parsed.productId, warehouseId: parsed.warehouseId },
    { $inc: { qtyOnHand: parsed.qty } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  await StockMovement.create({
    productId: parsed.productId,
    warehouseId: parsed.warehouseId,
    type: "IN",
    qty: parsed.qty,
    refType: "STOCK_IN",
    refId: String(balance._id),
    note: parsed.note ?? "",
  });

  return balance;
}

export async function reserveStock({
  session,
  productId,
  warehouseId,
  qty,
  refType,
  refId,
  note,
}: SessionRefParams) {
  const stock = await StockBalance.findOneAndUpdate(
    {
      productId,
      warehouseId,
      $expr: {
        $gte: [{ $subtract: ["$qtyOnHand", "$qtyReserved"] }, qty],
      },
    },
    {
      $inc: { qtyReserved: qty },
    },
    {
      new: true,
      session,
    }
  );

  if (!stock) {
    throw new Error("Insufficient stock");
  }

  await StockMovement.create(
    [
      {
        productId,
        warehouseId,
        type: "RESERVE",
        qty,
        refType,
        refId,
        note: note ?? "",
      },
    ],
    { session }
  );

  return stock;
}

export async function releaseReservedStock({
  session,
  productId,
  warehouseId,
  qty,
  refType,
  refId,
  note,
}: SessionRefParams) {
  const stock = await StockBalance.findOneAndUpdate(
    {
      productId,
      warehouseId,
      qtyReserved: { $gte: qty },
    },
    {
      $inc: { qtyReserved: -qty },
    },
    {
      new: true,
      session,
    }
  );

  if (!stock) {
    throw new Error("Reserved stock is insufficient");
  }

  await StockMovement.create(
    [
      {
        productId,
        warehouseId,
        type: "RELEASE",
        qty,
        refType,
        refId,
        note: note ?? "",
      },
    ],
    { session }
  );

  return stock;
}

export async function consumeReservedStock({
  session,
  productId,
  warehouseId,
  qty,
  refType,
  refId,
  note,
}: SessionRefParams) {
  const stock = await StockBalance.findOneAndUpdate(
    {
      productId,
      warehouseId,
      qtyOnHand: { $gte: qty },
      qtyReserved: { $gte: qty },
    },
    {
      $inc: { qtyOnHand: -qty, qtyReserved: -qty },
    },
    {
      new: true,
      session,
    }
  );

  if (!stock) {
    throw new Error("Reserved stock cannot be consumed");
  }

  await StockMovement.create(
    [
      {
        productId,
        warehouseId,
        type: "OUT",
        qty,
        refType,
        refId,
        note: note ?? "",
      },
    ],
    { session }
  );

  return stock;
}

export async function listStockMovements(limit = 100) {
  return StockMovement.find({})
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();
}
