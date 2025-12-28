-- SQLite schema for baseline
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  status TEXT NOT NULL CHECK(status IN ('ACTIVE', 'INACTIVE', 'PENDING')),
  description TEXT,
  metadata TEXT, -- JSON string
  tags TEXT, -- JSON array string
  payment_method TEXT NOT NULL CHECK(payment_method IN ('CREDIT_CARD', 'DEBIT_CARD', 'PAYPAL'))
);

CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  price REAL NOT NULL,
  category TEXT NOT NULL,
  in_stock INTEGER NOT NULL DEFAULT 1,
  specifications TEXT -- JSON array string
);

CREATE TABLE IF NOT EXISTS orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  product_ids TEXT NOT NULL, -- JSON array string
  status TEXT NOT NULL CHECK(status IN ('CREATED', 'PROCESSING', 'SHIPPED', 'DELIVERED')),
  total REAL NOT NULL,
  discount_code TEXT,
  shipping_address TEXT -- JSON string
);

