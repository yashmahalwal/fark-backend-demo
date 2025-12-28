-- SQLite schema with BREAKING CHANGES
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email_address TEXT NOT NULL, -- Renamed from 'email'
  name TEXT NOT NULL,
  status TEXT NOT NULL CHECK(status IN ('ACTIVE', 'INACTIVE', 'SUSPENDED')), -- Added SUSPENDED, removed PENDING
  description TEXT NOT NULL, -- Changed from nullable to required
  -- metadata column removed
  tag TEXT NOT NULL, -- Changed from tags (JSON array) to single tag
  payment_method TEXT NOT NULL CHECK(payment_method IN ('CREDIT_CARD', 'DEBIT_CARD', 'PAYPAL', 'BANK_TRANSFER')), -- Added BANK_TRANSFER
  phone_number TEXT NOT NULL -- Added required field
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
  shipping_address TEXT -- JSON string, now nullable
);

