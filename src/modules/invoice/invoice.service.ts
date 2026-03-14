import mongoose from "mongoose";
import { CustomerOrder } from "../co/co.model";
import { nextRunningNumber } from "../runningNumber/runningNumber.service";
import { consumeReservedStock } from "../stock/stock.service";
import { Invoice } from "./invoice.model";

export async function listInvoices() {
  return Invoice.find({}).sort({ createdAt: -1 }).lean();
}

export async function createInvoiceFromCO(coId: string) {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const co = await CustomerOrder.findById(coId).session(session);

    if (!co) {
      throw new Error("CO not found");
    }

    if (co.status === "CANCELLED") {
      throw new Error("CO is cancelled");
    }

    const existing = await Invoice.findOne({ coId: co._id }).session(session);
    if (existing) {
      throw new Error("Invoice already exists for this CO");
    }

    const invoiceNo = await nextRunningNumber(session, "INV");

    const [invoice] = await Invoice.create(
      [
        {
          invoiceNo,
          coId: co._id,
          customerName: co.customerName,
          status: "CONFIRMED",
          totalAmount: co.totalAmount,
          paidAmount: 0,
          items: co.items,
        },
      ],
      { session }
    );

    for (const item of co.items) {
      await consumeReservedStock({
        session,
        productId: item.productId,
        warehouseId: item.warehouseId,
        qty: item.qty,
        refType: "INV",
        refId: String(invoice._id),
        note: invoiceNo,
      });
    }

    co.status = "INVOICED";
    await co.save({ session });

    await session.commitTransaction();

    return invoice.toObject();
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    await session.endSession();
  }
}
