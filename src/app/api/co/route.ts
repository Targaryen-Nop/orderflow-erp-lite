import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { createCustomerOrder, listCustomerOrders } from "@/modules/co/co.service";

export async function GET() {
  try {
    await connectDB();
    const data = await listCustomerOrders();
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "Failed to load CO" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    const data = await createCustomerOrder(body);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "Failed to create CO" },
      { status: 400 }
    );
  }
}
