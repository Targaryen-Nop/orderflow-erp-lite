import { Schema, model, models, type InferSchemaType } from "mongoose";

const ProductSchema = new Schema(
  {
    sku: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true },
    unit: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export type ProductDocument = InferSchemaType<typeof ProductSchema> & { _id: string };

export const Product = models.Product || model("Product", ProductSchema);
