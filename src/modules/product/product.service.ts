import { z } from "zod";
import { Product } from "./product.model";

export const createProductSchema = z.object({
  sku: z.string().min(1),
  name: z.string().min(1),
  unit: z.string().min(1),
  price: z.number().nonnegative(),
});

export async function listProducts() {
  return Product.find({}).sort({ createdAt: -1 }).lean();
}

export async function createProduct(input: z.infer<typeof createProductSchema>) {
  const parsed = createProductSchema.parse(input);
  const exists = await Product.findOne({ sku: parsed.sku }).lean();

  if (exists) {
    throw new Error("SKU already exists");
  }

  return Product.create(parsed);
}
