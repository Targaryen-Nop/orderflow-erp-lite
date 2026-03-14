import mongoose from "mongoose";
import { z } from "zod";
import { Invoice } from "../invoice/invoice.model";
import { nextRunningNumber } from "../runningNumber/runningNumber.service";
import { Payment } from "./payment.model";

export const registerPaymentSchema = z.object({
  invoiceId: z.string().min(1),
  amount: z.number().positive(),
  paymentDate: z.string().min(1),
  method: z.string().min(1),
  note: z.string().optional(),
});

export async function listPayments() {
  return Payment.find({}).sort({ createdAt: -1 }).lean();
}

export async function registerPayment(input: z.infer<typeof registerPaymentSchema>) {
  const parsed = registerPaymentSchema.parse(input);
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const invoice = await Invoice.findById(parsed.invoiceId).session(session);

    if (!invoice) {
      throw new Error("Invoice not found");
    }

    const remaining = invoice.totalAmount - invoice.paidAmount;

    if (parsed.amount > remaining) {
      throw new Error("Payment exceeds remaining amount");
    }

    const paymentNo = await nextRunningNumber(session, "PAY");

    const [payment] = await Payment.create(
      [
        {
          paymentNo,
          invoiceId: invoice._id,
          amount: parsed.amount,
          paymentDate: new Date(parsed.paymentDate),
          method: parsed.method,
          note: parsed.note ?? "",
        },
      ],
      { session }
    );

    invoice.paidAmount += parsed.amount;
    invoice.status = invoice.paidAmount >= invoice.totalAmount ? "PAID" : "PARTIAL";
    await invoice.save({ session });

    await session.commitTransaction();

    return payment.toObject();
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    await session.endSession();
  }
}
