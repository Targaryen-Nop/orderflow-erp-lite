import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "OrderFlow ERP Lite",
  description: "Interview demo project with Next.js + MongoDB",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
