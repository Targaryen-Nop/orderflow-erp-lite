import { Schema, model, models } from "mongoose";

const InvoiceItemSchema = new Schema(
  {
    productId: { type: Schema.Types.ObjectId, required: true, ref: "Product" },
    warehouseId: { type: String, required: true },
    sku: { type: String, required: true },
    productName: { type: String, required: true },
    unit: { type: String, required: true },
    qty: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
    lineTotal: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const InvoiceSchema = new Schema(
  {
    invoiceNo: { type: String, required: true, unique: true, index: true },
    coId: { type: Schema.Types.ObjectId, ref: "CustomerOrder", index: true },
    customerName: { type: String, required: true },
    status: {
      type: String,
      enum: ["CONFIRMED", "PARTIAL", "PAID", "CANCELLED"],
      default: "CONFIRMED",
    },
    totalAmount: { type: Number, required: true, min: 0 },
    paidAmount: { type: Number, required: true, default: 0, min: 0 },
    items: { type: [InvoiceItemSchema], default: [] },
  },
  { timestamps: true }
);

export const Invoice = models.Invoice || model("Invoice", InvoiceSchema);
