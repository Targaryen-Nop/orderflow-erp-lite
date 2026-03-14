import Link from "next/link";

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/products", label: "Products" },
  { href: "/stock", label: "Stock" },
  { href: "/co", label: "Customer Orders" },
  { href: "/invoices", label: "Invoices" },
  { href: "/payments", label: "Payments" },
];

export default function HomePage() {
  return (
    <div className="container">
      <h1>OrderFlow ERP Lite</h1>
      <p>
        Full-stack interview demo with Next.js, MongoDB transaction, running number,
        stock reservation, invoice, and payment flow.
      </p>
      <div className="card">
        <h2>Modules</h2>
        <nav>
          {links.map((link) => (
            <Link key={link.href} href={link.href}>
              <span className="badge">{link.label}</span>
            </Link>
          ))}
        </nav>
      </div>
      <div className="card">
        <h2>Quick start</h2>
        <ol>
          <li>Set <code>MONGODB_URI</code> in <code>.env.local</code></li>
          <li>Ensure MongoDB runs in replica set mode</li>
          <li>POST <code>/api/seed</code> once</li>
          <li>Open dashboard and run the CO → Invoice → Payment flow</li>
        </ol>
      </div>
    </div>
  );
}
