# OrderFlow ERP Lite

Lightweight ERP system focused on order, stock, and operational workflow management.

---

## 🚀 Overview

OrderFlow ERP Lite is a full-stack system designed to simulate real-world ERP operations, focusing on **order processing, stock management, and financial workflows**.

This project emphasizes:
- Data consistency
- System reliability
- Handling real-world edge cases (e.g., concurrent orders, stock validation)
- Scalable architecture design

---

## 🧠 Architecture

- **Frontend**: Next.js (App Router)
- **Backend**: Node.js (Express.js)
- **Database**: MongoDB (with transaction support)

### Design Principles

- Separation of Concerns (Controller → Service → Repository)
- Service Layer handles business logic
- Database transactions for critical operations
- Modular architecture for scalability

---

## 🔥 Key Features

### 1. Order Lifecycle Management
- Create Customer Orders
- Generate Invoices
- Track Payments
- Manage full order → invoice → payment workflow

---

### 2. Stock Reservation System (Critical)

Prevents overselling under concurrent requests.

**Problem:**
Multiple orders at the same time may cause negative stock.

**Solution:**
- Use reservation-based logic
- Use MongoDB transactions
- Ensure atomic updates

```ts
await session.withTransaction(async () => {
  const stock = await Stock.findById(productId).session(session)

  if (stock.available < qty) {
    throw new Error('Insufficient stock')
  }

  await Stock.updateOne(
    { _id: productId },
    { $inc: { reserved: qty } },
    { session }
  )
})
```
---
The system is designed with a layered architecture to ensure separation of concerns, scalability, and maintainability.
Critical business operations such as stock reservation are handled within transaction boundaries to prevent data inconsistency under concurrent requests.

## 🧱 Architecture Diagram
[ Next.js Client ]
        │
        ▼
[ Express API Layer ]
        │
        ▼
[ Service Layer ]
- Business Logic
- Transaction Handling
        │
        ▼
[ Repository Layer ]
        │
        ▼
[ MongoDB ]
(ACID Transactions)
