import { Schema, model, models } from "mongoose";

const RunningNumberSchema = new Schema(
  {
    docType: { type: String, required: true },
    prefix: { type: String, required: true },
    yearMonth: { type: String, required: true },
    currentValue: { type: Number, required: true, default: 0 },
  },
  { timestamps: true }
);

RunningNumberSchema.index(
  { docType: 1, prefix: 1, yearMonth: 1 },
  { unique: true }
);

export const RunningNumber =
  models.RunningNumber || model("RunningNumber", RunningNumberSchema);
