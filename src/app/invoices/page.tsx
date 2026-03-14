"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchJson } from "@/lib/api";
import { formatMoney } from "@/lib/format";

type CO = {
  _id: string;
  coNo: string;
  customerName: string;
  status: string;
  totalAmount: number;
};

type Invoice = {
  _id: string;
  invoiceNo: string;
  customerName: string;
  status: string;
  totalAmount: number;
  paidAmount: number;
};

export default function InvoicesPage() {
  const [orders, setOrders] = useState<CO[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [coId, setCoId] = useState("");
  const [error, setError] = useState("");

  async function load() {
    const [coRes, invoiceRes] = await Promise.all([
      fetchJson<{ data: CO[] }>("/api/co"),
      fetchJson<{ data: Invoice[] }>("/api/invoices"),
    ]);

    const eligible = coRes.data.filter((item) => item.status === "CONFIRMED" || item.status === "INVOICED");
    setOrders(eligible);
    setInvoices(invoiceRes.data);

    if (!coId && eligible.length > 0) {
      setCoId(eligible[0]._id);
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    try {
      await fetchJson("/api/invoices", {
        method: "POST",
        body: JSON.stringify({ coId }),
      });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Create invoice failed");
    }
  }

  return (
    <div className="container">
      <nav>
        <Link href="/">Home</Link>
        <Link href="/dashboard">Dashboard</Link>
        <Link href="/products">Products</Link>
        <Link href="/stock">Stock</Link>
        <Link href="/co">CO</Link>
        <Link href="/payments">Payments</Link>
      </nav>

      <h1>Invoices</h1>

      <div className="card">
        <h2>Create Invoice from CO</h2>
        <form className="grid grid-2" onSubmit={onCreate}>
          <select value={coId} onChange={(e) => setCoId(e.target.value)}>
            {orders.map((item) => (
              <option key={item._id} value={item._id}>
                {item.coNo} - {item.customerName}
              </option>
            ))}
          </select>
          <button type="submit">Generate Invoice</button>
        </form>
        {error ? <p className="small">{error}</p> : null}
      </div>

      <div className="card">
        <h2>Invoice List</h2>
        <table>
          <thead>
            <tr>
              <th>Invoice No</th>
              <th>Customer</th>
              <th>Status</th>
              <th>Total</th>
              <th>Paid</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((row) => (
              <tr key={row._id}>
                <td>{row.invoiceNo}</td>
                <td>{row.customerName}</td>
                <td>{row.status}</td>
                <td>{formatMoney(row.totalAmount)}</td>
                <td>{formatMoney(row.paidAmount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
