import mongoose, { Types } from "mongoose";
import { z } from "zod";
import { Product } from "../product/product.model";
import { nextRunningNumber } from "../runningNumber/runningNumber.service";
import { reserveStock } from "../stock/stock.service";
import { CustomerOrder } from "./co.model";

export const createCOSchema = z.object({
  customerName: z.string().min(1),
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        warehouseId: z.string().min(1),
        qty: z.number().int().positive(),
        unitPrice: z.number().nonnegative().optional(),
      })
    )
    .min(1),
});

export async function listCustomerOrders() {
  return CustomerOrder.find({}).sort({ createdAt: -1 }).lean();
}

export async function createCustomerOrder(input: z.infer<typeof createCOSchema>) {
  const parsed = createCOSchema.parse(input);
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const coNo = await nextRunningNumber(session, "CO");

    const productIds = parsed.items.map((item) => new Types.ObjectId(item.productId));
    const products = await Product.find({ _id: { $in: productIds } }).session(session).lean();

    const productMap = new Map(products.map((p) => [String(p._id), p]));

    const items = parsed.items.map((item) => {
      const product = productMap.get(item.productId);

      if (!product) {
        throw new Error(`Product not found: ${item.productId}`);
      }

      const unitPrice = item.unitPrice ?? product.price;

      return {
        productId: new Types.ObjectId(item.productId),
        warehouseId: item.warehouseId,
        sku: product.sku,
        productName: product.name,
        unit: product.unit,
        qty: item.qty,
        unitPrice,
        lineTotal: unitPrice * item.qty,
      };
    });

    const totalAmount = items.reduce((sum, item) => sum + item.lineTotal, 0);

    const [co] = await CustomerOrder.create(
      [
        {
          coNo,
          customerName: parsed.customerName,
          status: "CONFIRMED",
          totalAmount,
          items,
        },
      ],
      { session }
    );

    for (const item of items) {
      await reserveStock({
        session,
        productId: item.productId,
        warehouseId: item.warehouseId,
        qty: item.qty,
        refType: "CO",
        refId: String(co._id),
        note: coNo,
      });
    }

    await session.commitTransaction();

    return co.toObject();
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    await session.endSession();
  }
}

export async function cancelCustomerOrder(id: string) {
  return CustomerOrder.findByIdAndUpdate(
    id,
    { status: "CANCELLED" },
    { new: true }
  );
}
