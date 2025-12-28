import { Router, Request, Response } from "express";
import { User, UserStatus, Order, OrderStatus, Product } from "../types/models";
import { getDatabase } from "../database/db";

const router: Router = Router();

// GET /api/users/:id
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
        email: row.email,
        name: row.name,
        status: row.status as UserStatus,
        description: row.description,
        metadata: JSON.parse(row.metadata || "{}"),
        tags: JSON.parse(row.tags || "[]"),
        paymentMethod: row.payment_method as any,
      };

      res.json(user);
    }
  );
});

// POST /api/users
router.post("/users", (req: Request, res: Response) => {
  const db = getDatabase();
  const { email, name, status, description, metadata, tags, paymentMethod } =
    req.body;

  db.run(
    "INSERT INTO users (email, name, status, description, metadata, tags, payment_method) VALUES (?, ?, ?, ?, ?, ?, ?)",
    [
      email,
      name,
      status,
      description || null,
      JSON.stringify(metadata || {}),
      JSON.stringify(tags || []),
      paymentMethod,
    ],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json({ id: this.lastID });
    }
  );
});

// GET /api/orders/:id
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
        shippingAddress: JSON.parse(row.shipping_address || "{}"),
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

