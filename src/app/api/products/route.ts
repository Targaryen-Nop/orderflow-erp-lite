import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { createProduct, listProducts } from "@/modules/product/product.service";

export async function GET() {
  try {
    await connectDB();
    const data = await listProducts();
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "Failed to load products" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    const data = await createProduct(body);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "Failed to create product" },
      { status: 400 }
    );
  }
}
