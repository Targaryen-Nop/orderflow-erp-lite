"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchJson } from "@/lib/api";

type Product = {
  _id: string;
  sku: string;
  name: string;
};

type StockBalance = {
  _id: string;
  warehouseId: string;
  qtyOnHand: number;
  qtyReserved: number;
  available: number;
  productId: string;
  sku: string;
  productName: string;
  unit: string;
};

type StockMovement = {
  _id: string;
  type: string;
  qty: number;
  warehouseId: string;
  refType: string;
  refId: string;
  note: string;
  createdAt: string;
};

export default function StockPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [balances, setBalances] = useState<StockBalance[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [form, setForm] = useState({
    productId: "",
    warehouseId: "MAIN",
    qty: 1,
    note: "",
  });
  const [error, setError] = useState("");

  async function loadAll() {
    const [productsRes, stockRes] = await Promise.all([
      fetchJson<{ data: Product[] }>("/api/products"),
      fetchJson<{ data: StockBalance[]; movements: StockMovement[] }>("/api/stock"),
    ]);

    setProducts(productsRes.data);
    setBalances(stockRes.data);
    setMovements(stockRes.movements);

    if (!form.productId && productsRes.data.length > 0) {
      setForm((prev) => ({ ...prev, productId: productsRes.data[0]._id }));
    }
  }

  useEffect(() => {
    void loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    try {
      await fetchJson("/api/stock", {
        method: "POST",
        body: JSON.stringify({
          ...form,
          qty: Number(form.qty),
        }),
      });
      setForm((prev) => ({ ...prev, qty: 1, note: "" }));
      await loadAll();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Stock in failed");
    }
  }

  return (
    <div className="container">
      <nav>
        <Link href="/">Home</Link>
        <Link href="/dashboard">Dashboard</Link>
        <Link href="/products">Products</Link>
        <Link href="/co">CO</Link>
        <Link href="/invoices">Invoices</Link>
        <Link href="/payments">Payments</Link>
      </nav>

      <h1>Stock</h1>

      <div className="card">
        <h2>Stock In</h2>
        <form className="grid grid-2" onSubmit={onSubmit}>
          <select
            value={form.productId}
            onChange={(e) => setForm((prev) => ({ ...prev, productId: e.target.value }))}
          >
            {products.map((item) => (
              <option key={item._id} value={item._id}>
                {item.sku} - {item.name}
              </option>
            ))}
          </select>
          <input
            value={form.warehouseId}
            onChange={(e) => setForm((prev) => ({ ...prev, warehouseId: e.target.value }))}
            placeholder="Warehouse"
          />
          <input
            type="number"
            value={form.qty}
            onChange={(e) => setForm((prev) => ({ ...prev, qty: Number(e.target.value) }))}
            placeholder="Qty"
          />
          <input
            value={form.note}
            onChange={(e) => setForm((prev) => ({ ...prev, note: e.target.value }))}
            placeholder="Note"
          />
          <button type="submit">Add Stock</button>
        </form>
        {error ? <p className="small">{error}</p> : null}
      </div>

      <div className="card">
        <h2>Stock Balance</h2>
        <table>
          <thead>
            <tr>
              <th>Warehouse</th>
              <th>SKU</th>
              <th>Product</th>
              <th>On Hand</th>
              <th>Reserved</th>
              <th>Available</th>
            </tr>
          </thead>
          <tbody>
            {balances.map((item) => (
              <tr key={item._id}>
                <td>{item.warehouseId}</td>
                <td>{item.sku}</td>
                <td>{item.productName}</td>
                <td>{item.qtyOnHand}</td>
                <td>{item.qtyReserved}</td>
                <td>{item.available}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card">
        <h2>Recent Stock Movements</h2>
        <table>
          <thead>
            <tr>
              <th>Type</th>
              <th>Qty</th>
              <th>Warehouse</th>
              <th>Ref</th>
              <th>Note</th>
            </tr>
          </thead>
          <tbody>
            {movements.map((item) => (
              <tr key={item._id}>
                <td>{item.type}</td>
                <td>{item.qty}</td>
                <td>{item.warehouseId}</td>
                <td>{item.refType}</td>
                <td>{item.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
