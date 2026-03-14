import { Schema, model, models } from "mongoose";

const StockBalanceSchema = new Schema(
  {
    productId: { type: Schema.Types.ObjectId, required: true, ref: "Product", index: true },
    warehouseId: { type: String, required: true, index: true },
    qtyOnHand: { type: Number, required: true, default: 0, min: 0 },
    qtyReserved: { type: Number, required: true, default: 0, min: 0 },
  },
  { timestamps: true }
);

StockBalanceSchema.index({ productId: 1, warehouseId: 1 }, { unique: true });

const StockMovementSchema = new Schema(
  {
    productId: { type: Schema.Types.ObjectId, required: true, ref: "Product", index: true },
    warehouseId: { type: String, required: true, index: true },
    type: {
      type: String,
      enum: ["IN", "OUT", "RESERVE", "RELEASE", "ADJUST"],
      required: true,
    },
    qty: { type: Number, required: true, min: 1 },
    refType: { type: String, required: true },
    refId: { type: String, required: true },
    note: { type: String, default: "" },
  },
  { timestamps: true }
);

export const StockBalance =
  models.StockBalance || model("StockBalance", StockBalanceSchema);

export const StockMovement =
  models.StockMovement || model("StockMovement", StockMovementSchema);
