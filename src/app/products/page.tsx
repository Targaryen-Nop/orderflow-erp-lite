"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchJson } from "@/lib/api";
import { formatMoney } from "@/lib/format";

type Product = {
  _id: string;
  sku: string;
  name: string;
  unit: string;
  price: number;
  isActive: boolean;
};

export default function ProductsPage() {
  const [rows, setRows] = useState<Product[]>([]);
  const [form, setForm] = useState({
    sku: "",
    name: "",
    unit: "PCS",
    price: 0,
  });
  const [error, setError] = useState("");

  async function load() {
    const res = await fetchJson<{ data: Product[] }>("/api/products");
    setRows(res.data);
  }

  useEffect(() => {
    const run = async () => {
      await load();
    };
    run();
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    try {
      await fetchJson("/api/products", {
        method: "POST",
        body: JSON.stringify({
          ...form,
          price: Number(form.price),
        }),
      });
      setForm({ sku: "", name: "", unit: "PCS", price: 0 });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Create product failed");
    }
  }

  return (
    <div className="container">
      <nav>
        <Link href="/">Home</Link>
        <Link href="/dashboard">Dashboard</Link>
        <Link href="/stock">Stock</Link>
        <Link href="/co">CO</Link>
        <Link href="/invoices">Invoices</Link>
        <Link href="/payments">Payments</Link>
      </nav>

      <h1>Products</h1>

      <div className="card">
        <h2>Create Product</h2>
        <form className="grid grid-2" onSubmit={onSubmit}>
          <input
            placeholder="SKU"
            value={form.sku}
            onChange={(e) => setForm((prev) => ({ ...prev, sku: e.target.value }))}
          />
          <input
            placeholder="Product Name"
            value={form.name}
            onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
          />
          <input
            placeholder="Unit"
            value={form.unit}
            onChange={(e) => setForm((prev) => ({ ...prev, unit: e.target.value }))}
          />
          <input
            type="number"
            placeholder="Price"
            value={form.price}
            onChange={(e) => setForm((prev) => ({ ...prev, price: Number(e.target.value) }))}
          />
          <button type="submit">Create Product</button>
        </form>
        {error ? <p className="small">{error}</p> : null}
      </div>

      <div className="card">
        <h2>Product List</h2>
        <table>
          <thead>
            <tr>
              <th>SKU</th>
              <th>Name</th>
              <th>Unit</th>
              <th>Price</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((item) => (
              <tr key={item._id}>
                <td>{item.sku}</td>
                <td>{item.name}</td>
                <td>{item.unit}</td>
                <td>{formatMoney(item.price)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
