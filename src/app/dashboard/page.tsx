import Link from "next/link";
import { connectDB } from "@/lib/mongodb";
import { Product } from "@/modules/product/product.model";
import { StockBalance } from "@/modules/stock/stock.model";
import { CustomerOrder } from "@/modules/co/co.model";
import { Invoice } from "@/modules/invoice/invoice.model";
import { Payment } from "@/modules/payment/payment.model";
import { formatMoney } from "@/lib/format";

export default async function DashboardPage() {
  await connectDB();

  const [products, stockBalances, orders, invoices, payments] = await Promise.all([
    Product.countDocuments(),
    StockBalance.countDocuments(),
    CustomerOrder.find({}).lean(),
    Invoice.find({}).lean(),
    Payment.find({}).lean(),
  ]);

  const totalSales = invoices.reduce((sum, item) => sum + (item.totalAmount ?? 0), 0);
  const totalPaid = invoices.reduce((sum, item) => sum + (item.paidAmount ?? 0), 0);

  return (
    <div className="container">
      <nav>
        <Link href="/">Home</Link>
        <Link href="/products">Products</Link>
        <Link href="/stock">Stock</Link>
        <Link href="/co">CO</Link>
        <Link href="/invoices">Invoices</Link>
        <Link href="/payments">Payments</Link>
      </nav>

      <h1>Dashboard</h1>

      <div className="grid grid-4">
        <div className="card">
          <h3>Products</h3>
          <p>{products}</p>
        </div>
        <div className="card">
          <h3>Stock Balances</h3>
          <p>{stockBalances}</p>
        </div>
        <div className="card">
          <h3>Orders</h3>
          <p>{orders.length}</p>
        </div>
        <div className="card">
          <h3>Payments</h3>
          <p>{payments.length}</p>
        </div>
      </div>

      <div className="grid grid-2">
        <div className="card">
          <h3>Total Invoiced</h3>
          <p>{formatMoney(totalSales)}</p>
        </div>
        <div className="card">
          <h3>Total Paid</h3>
          <p>{formatMoney(totalPaid)}</p>
        </div>
      </div>
    </div>
  );
}
