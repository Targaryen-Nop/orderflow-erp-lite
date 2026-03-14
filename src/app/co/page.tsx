"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchJson } from "@/lib/api";
import { formatMoney } from "@/lib/format";

type Product = {
  _id: string;
  sku: string;
  name: string;
  price: number;
};

type CO = {
  _id: string;
  coNo: string;
  customerName: string;
  status: string;
  totalAmount: number;
  items: Array<{
    sku: string;
    productName: string;
    qty: number;
    unitPrice: number;
    lineTotal: number;
    warehouseId: string;
  }>;
};

type CreateItem = {
  productId: string;
  warehouseId: string;
  qty: number;
  unitPrice: number;
};

export default function COPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [rows, setRows] = useState<CO[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [items, setItems] = useState<CreateItem[]>([]);
  const [error, setError] = useState("");

  async function load() {
    const [productRes, coRes] = await Promise.all([
      fetchJson<{ data: Product[] }>("/api/products"),
      fetchJson<{ data: CO[] }>("/api/co"),
    ]);

    setProducts(productRes.data);
    setRows(coRes.data);

    if (items.length === 0 && productRes.data.length > 0) {
      setItems([
        {
          productId: productRes.data[0]._id,
          warehouseId: "MAIN",
          qty: 1,
          unitPrice: productRes.data[0].price,
        },
      ]);
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function addRow() {
    if (products.length === 0) return;
    const first = products[0];
    setItems((prev) => [
      ...prev,
      {
        productId: first._id,
        warehouseId: "MAIN",
        qty: 1,
        unitPrice: first.price,
      },
    ]);
  }

  function updateRow(index: number, patch: Partial<CreateItem>) {
    setItems((prev) => prev.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    try {
      await fetchJson("/api/co", {
        method: "POST",
        body: JSON.stringify({
          customerName,
          items: items.map((item) => ({
            ...item,
            qty: Number(item.qty),
            unitPrice: Number(item.unitPrice),
          })),
        }),
      });

      setCustomerName("");
      if (products.length > 0) {
        setItems([
          {
            productId: products[0]._id,
            warehouseId: "MAIN",
            qty: 1,
            unitPrice: products[0].price,
          },
        ]);
      } else {
        setItems([]);
      }
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Create CO failed");
    }
  }

  return (
    <div className="container">
      <nav>
        <Link href="/">Home</Link>
        <Link href="/dashboard">Dashboard</Link>
        <Link href="/products">Products</Link>
        <Link href="/stock">Stock</Link>
        <Link href="/invoices">Invoices</Link>
        <Link href="/payments">Payments</Link>
      </nav>

      <h1>Customer Orders</h1>

      <div className="card">
        <h2>Create CO</h2>
        <form onSubmit={onSubmit}>
          <div className="card">
            <input
              placeholder="Customer Name"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
            />
          </div>

          {items.map((row, index) => (
            <div key={index} className="card grid grid-2">
              <select
                value={row.productId}
                onChange={(e) => {
                  const selected = products.find((p) => p._id === e.target.value);
                  updateRow(index, {
                    productId: e.target.value,
                    unitPrice: selected?.price ?? row.unitPrice,
                  });
                }}
              >
                {products.map((item) => (
                  <option key={item._id} value={item._id}>
                    {item.sku} - {item.name}
                  </option>
                ))}
              </select>

              <input
                placeholder="Warehouse"
                value={row.warehouseId}
                onChange={(e) => updateRow(index, { warehouseId: e.target.value })}
              />

              <input
                type="number"
                placeholder="Qty"
                value={row.qty}
                onChange={(e) => updateRow(index, { qty: Number(e.target.value) })}
              />

              <input
                type="number"
                placeholder="Unit Price"
                value={row.unitPrice}
                onChange={(e) => updateRow(index, { unitPrice: Number(e.target.value) })}
              />
            </div>
          ))}

          <div className="grid grid-2">
            <button type="button" className="secondary" onClick={addRow}>
              Add Item
            </button>
            <button type="submit">Create CO</button>
          </div>
        </form>
        {error ? <p className="small">{error}</p> : null}
      </div>

      <div className="card">
        <h2>CO List</h2>
        <table>
          <thead>
            <tr>
              <th>CO No</th>
              <th>Customer</th>
              <th>Status</th>
              <th>Total</th>
              <th>Items</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((co) => (
              <tr key={co._id}>
                <td>{co.coNo}</td>
                <td>{co.customerName}</td>
                <td>{co.status}</td>
                <td>{formatMoney(co.totalAmount)}</td>
                <td>
                  {co.items.map((item, idx) => (
                    <div key={idx} className="small">
                      {item.sku} / {item.qty} x {formatMoney(item.unitPrice)} / {item.warehouseId}
                    </div>
                  ))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
