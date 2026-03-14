import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { addStock, listStockBalances, listStockMovements } from "@/modules/stock/stock.service";

export async function GET() {
  try {
    await connectDB();
    const [data, movements] = await Promise.all([
      listStockBalances(),
      listStockMovements(),
    ]);
    return NextResponse.json({ success: true, data, movements });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "Failed to load stock" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    const data = await addStock(body);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "Failed to add stock" },
      { status: 400 }
    );
  }
}
