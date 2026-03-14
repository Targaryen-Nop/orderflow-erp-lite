"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchJson } from "@/lib/api";
import { formatMoney } from "@/lib/format";

type Invoice = {
  _id: string;
  invoiceNo: string;
  customerName: string;
  status: string;
  totalAmount: number;
  paidAmount: number;
};

type Payment = {
  _id: string;
  paymentNo: string;
  amount: number;
  method: string;
  paymentDate: string;
};

export default function PaymentsPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [form, setForm] = useState({
    invoiceId: "",
    amount: 0,
    paymentDate: new Date().toISOString().slice(0, 10),
    method: "BANK_TRANSFER",
    note: "",
  });
  const [error, setError] = useState("");

  async function load() {
    const [invoiceRes, paymentRes] = await Promise.all([
      fetchJson<{ data: Invoice[] }>("/api/invoices"),
      fetchJson<{ data: Payment[] }>("/api/payments"),
    ]);

    const eligible = invoiceRes.data.filter((item) => item.status !== "PAID" && item.status !== "CANCELLED");
    setInvoices(eligible);
    setPayments(paymentRes.data);

    if (!form.invoiceId && eligible.length > 0) {
      const inv = eligible[0];
      setForm((prev) => ({
        ...prev,
        invoiceId: inv._id,
        amount: Math.max(inv.totalAmount - inv.paidAmount, 0),
      }));
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    try {
      await fetchJson("/api/payments", {
        method: "POST",
        body: JSON.stringify({
          ...form,
          amount: Number(form.amount),
        }),
      });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Register payment failed");
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
        <Link href="/invoices">Invoices</Link>
      </nav>

      <h1>Payments</h1>

      <div className="card">
        <h2>Register Payment</h2>
        <form className="grid grid-2" onSubmit={onSubmit}>
          <select
            value={form.invoiceId}
            onChange={(e) => {
              const inv = invoices.find((x) => x._id === e.target.value);
              setForm((prev) => ({
                ...prev,
                invoiceId: e.target.value,
                amount: inv ? Math.max(inv.totalAmount - inv.paidAmount, 0) : prev.amount,
              }));
            }}
          >
            {invoices.map((row) => (
              <option key={row._id} value={row._id}>
                {row.invoiceNo} - {row.customerName}
              </option>
            ))}
          </select>

          <input
            type="number"
            value={form.amount}
            onChange={(e) => setForm((prev) => ({ ...prev, amount: Number(e.target.value) }))}
          />

          <input
            type="date"
            value={form.paymentDate}
            onChange={(e) => setForm((prev) => ({ ...prev, paymentDate: e.target.value }))}
          />

          <input
            value={form.method}
            onChange={(e) => setForm((prev) => ({ ...prev, method: e.target.value }))}
          />

          <input
            value={form.note}
            onChange={(e) => setForm((prev) => ({ ...prev, note: e.target.value }))}
            placeholder="Note"
          />

          <button type="submit">Post Payment</button>
        </form>
        {error ? <p className="small">{error}</p> : null}
      </div>

      <div className="card">
        <h2>Payment List</h2>
        <table>
          <thead>
            <tr>
              <th>Payment No</th>
              <th>Method</th>
              <th>Amount</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((row) => (
              <tr key={row._id}>
                <td>{row.paymentNo}</td>
                <td>{row.method}</td>
                <td>{formatMoney(row.amount)}</td>
                <td>{new Date(row.paymentDate).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
