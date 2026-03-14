import { Schema, model, models } from "mongoose";

const COItemSchema = new Schema(
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

const CustomerOrderSchema = new Schema(
  {
    coNo: { type: String, required: true, unique: true, index: true },
    customerName: { type: String, required: true },
    status: {
      type: String,
      enum: ["DRAFT", "CONFIRMED", "CANCELLED", "INVOICED"],
      default: "CONFIRMED",
    },
    totalAmount: { type: Number, required: true, min: 0 },
    items: { type: [COItemSchema], default: [] },
  },
  { timestamps: true }
);

export const CustomerOrder =
  models.CustomerOrder || model("CustomerOrder", CustomerOrderSchema);
