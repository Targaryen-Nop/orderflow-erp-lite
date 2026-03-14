# OrderFlow ERP Lite

Next.js + MongoDB demo project for interview use.

## Features
- Product master
- Stock balance + stock movement ledger
- CO / Invoice / Payment
- Running number generation
- ACID transaction with MongoDB session
- Negative stock prevention with atomic reservation

## Important
MongoDB transactions require **replica set** mode, even on local.

Example local connection:

```env
MONGODB_URI=mongodb://127.0.0.1:27017/orderflow?replicaSet=rs0
```

## Run

```bash
npm install
cp .env.example .env.local
npm run dev
```

## Seed data
POST `/api/seed`
