import { NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/mongodb";
import { createInvoiceFromCO, listInvoices } from "@/modules/invoice/invoice.service";

const createInvoiceSchema = z.object({
  coId: z.string().min(1),
});

export async function GET() {
  try {
    await connectDB();
    const data = await listInvoices();
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "Failed to load invoices" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    const parsed = createInvoiceSchema.parse(body);
    const data = await createInvoiceFromCO(parsed.coId);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "Failed to create invoice" },
      { status: 400 }
    );
  }
}
