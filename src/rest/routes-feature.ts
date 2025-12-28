import { Router, Request, Response } from "express";
import { User, UserStatus, Order, OrderStatus, Product } from "../types/models-feature";
import { getDatabase } from "../database/db";

const router: Router = Router();

// GET /api/users/:id - BREAKING: email -> emailAddress, description required, metadata removed, tags -> tag
router.get("/users/:id", (req: Request, res: Response) => {
  const db = getDatabase();
  const userId = parseInt(req.params.id);

  db.get(
    "SELECT * FROM users WHERE id = ?",
    [userId],
    (err, row: any) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (!row) {
        return res.status(404).json({ error: "User not found" });
      }

      const user: User = {
        id: row.id,
        emailAddress: row.email_address, // BREAKING: renamed from email
        name: row.name,
        status: row.status as UserStatus,
        description: row.description, // BREAKING: now required (was nullable)
        // metadata removed - BREAKING CHANGE
        tag: row.tag, // BREAKING: changed from tags array to single tag
        paymentMethod: row.payment_method as any,
        phoneNumber: row.phone_number, // BREAKING: added required field
      };

      res.json(user);
    }
  );
});

// POST /api/users - BREAKING: email -> emailAddress, description required, metadata removed, tags -> tag, phoneNumber required
router.post("/users", (req: Request, res: Response) => {
  const db = getDatabase();
  const { emailAddress, name, status, description, tag, paymentMethod, phoneNumber } =
    req.body; // BREAKING: email -> emailAddress, tags -> tag, metadata removed, phoneNumber added

  db.run(
    "INSERT INTO users (email_address, name, status, description, tag, payment_method, phone_number) VALUES (?, ?, ?, ?, ?, ?, ?)",
    [
      emailAddress, // BREAKING: renamed
      name,
      status,
      description, // BREAKING: now required
      tag, // BREAKING: single value instead of array
      paymentMethod,
      phoneNumber, // BREAKING: added required field
    ],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json({ id: this.lastID });
    }
  );
});

// GET /api/orders/:id - BREAKING: shippingAddress now nullable
router.get("/orders/:id", (req: Request, res: Response) => {
  const db = getDatabase();
  const orderId = parseInt(req.params.id);

  db.get(
    "SELECT * FROM orders WHERE id = ?",
    [orderId],
    (err, row: any) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (!row) {
        return res.status(404).json({ error: "Order not found" });
      }

      const order: Order = {
        id: row.id,
        userId: row.user_id,
        productIds: JSON.parse(row.product_ids),
        status: row.status as OrderStatus,
        total: row.total,
        discountCode: row.discount_code,
        shippingAddress: row.shipping_address ? JSON.parse(row.shipping_address) : null, // BREAKING: now nullable
      };

      res.json(order);
    }
  );
});

// GET /api/products
router.get("/products", (req: Request, res: Response) => {
  const db = getDatabase();

  db.all("SELECT * FROM products", [], (err, rows: any[]) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    const products: Product[] = rows.map((row) => ({
      id: row.id,
      name: row.name,
      price: row.price,
      category: row.category,
      inStock: Boolean(row.in_stock),
      specifications: JSON.parse(row.specifications || "[]"),
    }));

    res.json(products);
  });
});

export default router;

