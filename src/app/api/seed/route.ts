import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Product } from "@/modules/product/product.model";
import { StockBalance } from "@/modules/stock/stock.model";

export async function POST() {
  try {
    await connectDB();

    const seedProducts = [
      { sku: "P001", name: "Premium Coffee", unit: "PCS", price: 120 },
      { sku: "P002", name: "Green Tea", unit: "PCS", price: 95 },
      { sku: "P003", name: "Chocolate Bar", unit: "PCS", price: 60 },
    ];

    for (const item of seedProducts) {
      const product = await Product.findOneAndUpdate(
        { sku: item.sku },
        item,
        { new: true, upsert: true, setDefaultsOnInsert: true }
      );

      await StockBalance.findOneAndUpdate(
        { productId: product._id, warehouseId: "MAIN" },
        { $setOnInsert: { qtyOnHand: 100, qtyReserved: 0 } },
        { upsert: true, new: true }
      );
    }

    return NextResponse.json({ success: true, message: "Seed completed" });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "Seed failed" },
      { status: 500 }
    );
  }
}
