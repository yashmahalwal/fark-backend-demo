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
        emailAddress: row.email,
        name: row.name,
        status: row.status as UserStatus,
        description: row.description,
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
  const { emailAddress, name, status, description, tags, paymentMethod } =
    req.body;

  // Validation
  if (!emailAddress || !name || !status || !description || !paymentMethod) {
    return res.status(400).json({
      error: "Missing required fields",
      required: ["emailAddress", "name", "status", "description", "paymentMethod"],
    });
  }

  const validStatuses = ["ACTIVE", "INACTIVE", "PENDING", "SUSPENDED"];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({
      error: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
    });
  }

  const validPaymentMethods = ["CREDIT_CARD", "DEBIT_CARD", "PAYPAL"];
  if (!validPaymentMethods.includes(paymentMethod)) {
    return res.status(400).json({
      error: `Invalid paymentMethod. Must be one of: ${validPaymentMethods.join(", ")}`,
    });
  }

  db.run(
    "INSERT INTO users (email, name, status, description, tags, payment_method) VALUES (?, ?, ?, ?, ?, ?)",
    [
      emailAddress,
      name,
      status,
      description,
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

// PUT /api/users/:id
router.put("/users/:id", (req: Request, res: Response) => {
  const db = getDatabase();
  const userId = parseInt(req.params.id);
  const { emailAddress, name, status, description, tags, paymentMethod } =
    req.body;

  // Validation
  if (!emailAddress || !name || !status || !description || !paymentMethod) {
    return res.status(400).json({
      error: "Missing required fields",
      required: ["emailAddress", "name", "status", "description", "paymentMethod"],
    });
  }

  const validStatuses = ["ACTIVE", "INACTIVE", "PENDING", "SUSPENDED"];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({
      error: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
    });
  }

  const validPaymentMethods = ["CREDIT_CARD", "DEBIT_CARD", "PAYPAL"];
  if (!validPaymentMethods.includes(paymentMethod)) {
    return res.status(400).json({
      error: `Invalid paymentMethod. Must be one of: ${validPaymentMethods.join(", ")}`,
    });
  }

  db.run(
    "UPDATE users SET email = ?, name = ?, status = ?, description = ?, tags = ?, payment_method = ? WHERE id = ?",
    [
      emailAddress,
      name,
      status,
      description,
      JSON.stringify(tags || []),
      paymentMethod,
      userId,
    ],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json({ id: userId, message: "User updated successfully" });
    }
  );
});

// DELETE /api/users/:id
router.delete("/users/:id", (req: Request, res: Response) => {
  const db = getDatabase();
  const userId = parseInt(req.params.id);

  db.run("DELETE FROM users WHERE id = ?", [userId], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json({ id: userId, message: "User deleted successfully" });
  });
});

// GET /api/users
router.get("/users", (req: Request, res: Response) => {
  const db = getDatabase();

  db.all("SELECT * FROM users", [], (err, rows: any[]) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    const users: User[] = rows.map((row) => ({
      id: row.id,
      emailAddress: row.email,
      name: row.name,
      status: row.status as UserStatus,
      description: row.description,
      tags: JSON.parse(row.tags || "[]"),
      paymentMethod: row.payment_method as any,
    }));

    res.json(users);
  });
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

// POST /api/products
router.post("/products", (req: Request, res: Response) => {
  const db = getDatabase();
  const { name, price, category, inStock, specifications } = req.body;

  if (!name || price === undefined || !category) {
    return res.status(400).json({
      error: "Missing required fields",
      required: ["name", "price", "category"],
    });
  }

  db.run(
    "INSERT INTO products (name, price, category, in_stock, specifications) VALUES (?, ?, ?, ?, ?)",
    [
      name,
      price,
      category,
      inStock ? 1 : 0,
      JSON.stringify(specifications || []),
    ],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json({ id: this.lastID });
    }
  );
});

// PUT /api/products/:id
router.put("/products/:id", (req: Request, res: Response) => {
  const db = getDatabase();
  const productId = parseInt(req.params.id);
  const { name, price, category, inStock, specifications } = req.body;

  if (!name || price === undefined || !category) {
    return res.status(400).json({
      error: "Missing required fields",
      required: ["name", "price", "category"],
    });
  }

  db.run(
    "UPDATE products SET name = ?, price = ?, category = ?, in_stock = ?, specifications = ? WHERE id = ?",
    [
      name,
      price,
      category,
      inStock ? 1 : 0,
      JSON.stringify(specifications || []),
      productId,
    ],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.json({ id: productId, message: "Product updated successfully" });
    }
  );
});

// DELETE /api/products/:id
router.delete("/products/:id", (req: Request, res: Response) => {
  const db = getDatabase();
  const productId = parseInt(req.params.id);

  db.run("DELETE FROM products WHERE id = ?", [productId], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.json({ id: productId, message: "Product deleted successfully" });
  });
});

// GET /api/orders
router.get("/orders", (req: Request, res: Response) => {
  const db = getDatabase();

  db.all("SELECT * FROM orders", [], (err, rows: any[]) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    const orders: Order[] = rows.map((row) => ({
      id: row.id,
      userId: row.user_id,
      productIds: JSON.parse(row.product_ids),
      status: row.status as OrderStatus,
      total: row.total,
      discountCode: row.discount_code,
      shippingAddress: JSON.parse(row.shipping_address || "{}"),
    }));

    res.json(orders);
  });
});

// POST /api/orders
router.post("/orders", (req: Request, res: Response) => {
  const db = getDatabase();
  const { userId, productIds, status, total, discountCode, shippingAddress } = req.body;

  if (!userId || !productIds || !status || total === undefined) {
    return res.status(400).json({
      error: "Missing required fields",
      required: ["userId", "productIds", "status", "total"],
    });
  }

  const validStatuses = ["CREATED", "PROCESSING", "SHIPPED", "DELIVERED"];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({
      error: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
    });
  }

  db.run(
    "INSERT INTO orders (user_id, product_ids, status, total, discount_code, shipping_address) VALUES (?, ?, ?, ?, ?, ?)",
    [
      userId,
      JSON.stringify(productIds),
      status,
      total,
      discountCode || null,
      JSON.stringify(shippingAddress || {}),
    ],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json({ id: this.lastID });
    }
  );
});

// PUT /api/orders/:id
router.put("/orders/:id", (req: Request, res: Response) => {
  const db = getDatabase();
  const orderId = parseInt(req.params.id);
  const { userId, productIds, status, total, discountCode, shippingAddress } = req.body;

  if (!userId || !productIds || !status || total === undefined) {
    return res.status(400).json({
      error: "Missing required fields",
      required: ["userId", "productIds", "status", "total"],
    });
  }

  const validStatuses = ["CREATED", "PROCESSING", "SHIPPED", "DELIVERED"];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({
      error: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
    });
  }

  db.run(
    "UPDATE orders SET user_id = ?, product_ids = ?, status = ?, total = ?, discount_code = ?, shipping_address = ? WHERE id = ?",
    [
      userId,
      JSON.stringify(productIds),
      status,
      total,
      discountCode || null,
      JSON.stringify(shippingAddress || {}),
      orderId,
    ],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: "Order not found" });
      }
      res.json({ id: orderId, message: "Order updated successfully" });
    }
  );
});

// DELETE /api/orders/:id
router.delete("/orders/:id", (req: Request, res: Response) => {
  const db = getDatabase();
  const orderId = parseInt(req.params.id);

  db.run("DELETE FROM orders WHERE id = ?", [orderId], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: "Order not found" });
    }
    res.json({ id: orderId, message: "Order deleted successfully" });
  });
});

export default router;

