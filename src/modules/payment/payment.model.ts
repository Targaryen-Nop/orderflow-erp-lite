import { Schema, model, models } from "mongoose";

const PaymentSchema = new Schema(
  {
    paymentNo: { type: String, required: true, unique: true, index: true },
    invoiceId: { type: Schema.Types.ObjectId, ref: "Invoice", required: true, index: true },
    amount: { type: Number, required: true, min: 0.01 },
    paymentDate: { type: Date, required: true },
    method: { type: String, required: true },
    note: { type: String, default: "" },
  },
  { timestamps: true }
);

export const Payment = models.Payment || model("Payment", PaymentSchema);
