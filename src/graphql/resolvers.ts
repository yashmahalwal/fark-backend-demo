import { getDatabase } from "../database/db";
import { UserStatus, OrderStatus } from "../types/models";

export const resolvers = {
  Query: {
    user: async (_: any, { id }: { id: string }) => {
      const db = getDatabase();
      return new Promise((resolve, reject) => {
        db.get(
          "SELECT * FROM users WHERE id = ?",
          [id],
          (err, row: any) => {
            if (err) return reject(err);
            if (!row) return resolve(null);

            resolve({
              id: row.id,
              email: row.email,
              name: row.name,
              status: row.status,
              description: row.description,
              metadata: JSON.parse(row.metadata || "{}"),
              tags: JSON.parse(row.tags || "[]"),
              paymentMethod: row.payment_method, // payment_method is stored as string, not JSON
            });
          }
        );
      });
    },
    users: async () => {
      const db = getDatabase();
      return new Promise((resolve, reject) => {
        db.all("SELECT * FROM users", [], (err, rows: any[]) => {
          if (err) return reject(err);
            resolve(
            rows.map((row) => ({
              id: row.id,
              email: row.email,
              name: row.name,
              status: row.status,
              description: row.description,
              metadata: JSON.parse(row.metadata || "{}"),
              tags: JSON.parse(row.tags || "[]"),
              paymentMethod: row.payment_method, // payment_method is stored as string, not JSON
            }))
          );
        });
      });
    },
    order: async (_: any, { id }: { id: string }) => {
      const db = getDatabase();
      return new Promise((resolve, reject) => {
        db.get(
          "SELECT * FROM orders WHERE id = ?",
          [id],
          (err, row: any) => {
            if (err) return reject(err);
            if (!row) return resolve(null);

            resolve({
              id: row.id,
              userId: row.user_id,
              productIds: JSON.parse(row.product_ids),
              status: row.status,
              total: row.total,
              discountCode: row.discount_code,
              shippingAddress: JSON.parse(row.shipping_address || "{}"),
            });
          }
        );
      });
    },
    orders: async () => {
      const db = getDatabase();
      return new Promise((resolve, reject) => {
        db.all("SELECT * FROM orders", [], (err, rows: any[]) => {
          if (err) return reject(err);
          resolve(
            rows.map((row) => ({
              id: row.id,
              userId: row.user_id,
              productIds: JSON.parse(row.product_ids),
              status: row.status,
              total: row.total,
              discountCode: row.discount_code,
              shippingAddress: JSON.parse(row.shipping_address || "{}"),
            }))
          );
        });
      });
    },
    products: async () => {
      const db = getDatabase();
      return new Promise((resolve, reject) => {
        db.all("SELECT * FROM products", [], (err, rows: any[]) => {
          if (err) return reject(err);
          resolve(
            rows.map((row) => ({
              id: row.id,
              name: row.name,
              price: row.price,
              category: row.category,
              inStock: Boolean(row.in_stock),
              specifications: JSON.parse(row.specifications || "[]"),
            }))
          );
        });
      });
    },
  },
  Mutation: {
    createUser: async (_: any, args: any) => {
      const db = getDatabase();
      
      // Convert GraphQL PaymentMethodInput to database string format
      // PaymentMethodInput has optional fields: type, last4 (CreditCard), bank (DebitCard), email (PayPal)
      const pm = args.paymentMethod || {};
      let paymentMethodStr: string;
      
      if (pm.email && !pm.type && !pm.bank) {
        paymentMethodStr = "PAYPAL";
      } else if (pm.bank) {
        paymentMethodStr = "DEBIT_CARD";
      } else if (pm.type && pm.last4) {
        paymentMethodStr = "CREDIT_CARD";
      } else {
        paymentMethodStr = "CREDIT_CARD"; // default
      }
      
      // Validate payment method string
      const validPaymentMethods = ["CREDIT_CARD", "DEBIT_CARD", "PAYPAL"];
      if (!validPaymentMethods.includes(paymentMethodStr)) {
        return Promise.reject(new Error(`Invalid payment method: ${paymentMethodStr}. Received: ${JSON.stringify(args.paymentMethod)}`));
      }
      
      return new Promise((resolve, reject) => {
        db.run(
          "INSERT INTO users (email, name, status, description, metadata, tags, payment_method) VALUES (?, ?, ?, ?, ?, ?, ?)",
          [
            args.email,
            args.name,
            args.status,
            args.description || null,
            JSON.stringify(args.metadata || {}),
            JSON.stringify(args.tags || []),
            paymentMethodStr,
          ],
          function (err) {
            if (err) {
              console.error("Database error:", err);
              console.error("PaymentMethod received:", JSON.stringify(args.paymentMethod));
              console.error("PaymentMethod converted to:", paymentMethodStr);
              return reject(err);
            }
            resolve({ 
              id: this.lastID, 
              email: args.email,
              name: args.name,
              status: args.status,
            });
          }
        );
      });
    },
    updateUser: async (_: any, args: any) => {
      const db = getDatabase();
      
      const pm = args.paymentMethod || {};
      let paymentMethodStr: string;
      
      if (pm.email && !pm.type && !pm.bank) {
        paymentMethodStr = "PAYPAL";
      } else if (pm.bank) {
        paymentMethodStr = "DEBIT_CARD";
      } else if (pm.type && pm.last4) {
        paymentMethodStr = "CREDIT_CARD";
      } else {
        paymentMethodStr = "CREDIT_CARD";
      }
      
      return new Promise((resolve, reject) => {
        db.run(
          "UPDATE users SET email = ?, name = ?, status = ?, description = ?, metadata = ?, tags = ?, payment_method = ? WHERE id = ?",
          [
            args.email,
            args.name,
            args.status,
            args.description || null,
            JSON.stringify(args.metadata || {}),
            JSON.stringify(args.tags || []),
            paymentMethodStr,
            args.id,
          ],
          function (err) {
            if (err) {
              console.error("Database error:", err);
              return reject(err);
            }
            if (this.changes === 0) {
              return reject(new Error("User not found"));
            }
            resolve({
              id: args.id,
              email: args.email,
              name: args.name,
              status: args.status,
            });
          }
        );
      });
    },
    deleteUser: async (_: any, { id }: { id: string }) => {
      const db = getDatabase();
      return new Promise((resolve, reject) => {
        db.run("DELETE FROM users WHERE id = ?", [id], function (err) {
          if (err) {
            return reject(err);
          }
          resolve(this.changes > 0);
        });
      });
    },
    createProduct: async (_: any, args: any) => {
      const db = getDatabase();
      return new Promise((resolve, reject) => {
        db.run(
          "INSERT INTO products (name, price, category, in_stock, specifications) VALUES (?, ?, ?, ?, ?)",
          [
            args.name,
            args.price,
            args.category,
            args.inStock ? 1 : 0,
            JSON.stringify(args.specifications || []),
          ],
          function (err) {
            if (err) {
              return reject(err);
            }
            resolve({
              id: this.lastID,
              name: args.name,
              price: args.price,
              category: args.category,
              inStock: args.inStock,
              specifications: args.specifications || [],
            });
          }
        );
      });
    },
    updateProduct: async (_: any, args: any) => {
      const db = getDatabase();
      return new Promise((resolve, reject) => {
        db.run(
          "UPDATE products SET name = ?, price = ?, category = ?, in_stock = ?, specifications = ? WHERE id = ?",
          [
            args.name,
            args.price,
            args.category,
            args.inStock ? 1 : 0,
            JSON.stringify(args.specifications || []),
            args.id,
          ],
          function (err) {
            if (err) {
              return reject(err);
            }
            if (this.changes === 0) {
              return reject(new Error("Product not found"));
            }
            resolve({
              id: args.id,
              name: args.name,
              price: args.price,
              category: args.category,
              inStock: args.inStock,
              specifications: args.specifications || [],
            });
          }
        );
      });
    },
    deleteProduct: async (_: any, { id }: { id: string }) => {
      const db = getDatabase();
      return new Promise((resolve, reject) => {
        db.run("DELETE FROM products WHERE id = ?", [id], function (err) {
          if (err) {
            return reject(err);
          }
          resolve(this.changes > 0);
        });
      });
    },
    createOrder: async (_: any, args: any) => {
      const db = getDatabase();
      return new Promise((resolve, reject) => {
        db.run(
          "INSERT INTO orders (user_id, product_ids, status, total, discount_code, shipping_address) VALUES (?, ?, ?, ?, ?, ?)",
          [
            args.userId,
            JSON.stringify(args.productIds),
            args.status,
            args.total,
            args.discountCode || null,
            JSON.stringify(args.shippingAddress),
          ],
          function (err) {
            if (err) {
              return reject(err);
            }
            resolve({
              id: this.lastID,
              userId: args.userId,
              productIds: args.productIds,
              status: args.status,
              total: args.total,
              discountCode: args.discountCode,
              shippingAddress: args.shippingAddress,
            });
          }
        );
      });
    },
    updateOrder: async (_: any, args: any) => {
      const db = getDatabase();
      return new Promise((resolve, reject) => {
        db.run(
          "UPDATE orders SET user_id = ?, product_ids = ?, status = ?, total = ?, discount_code = ?, shipping_address = ? WHERE id = ?",
          [
            args.userId,
            JSON.stringify(args.productIds),
            args.status,
            args.total,
            args.discountCode || null,
            JSON.stringify(args.shippingAddress),
            args.id,
          ],
          function (err) {
            if (err) {
              return reject(err);
            }
            if (this.changes === 0) {
              return reject(new Error("Order not found"));
            }
            resolve({
              id: args.id,
              userId: args.userId,
              productIds: args.productIds,
              status: args.status,
              total: args.total,
              discountCode: args.discountCode,
              shippingAddress: args.shippingAddress,
            });
          }
        );
      });
    },
    deleteOrder: async (_: any, { id }: { id: string }) => {
      const db = getDatabase();
      return new Promise((resolve, reject) => {
        db.run("DELETE FROM orders WHERE id = ?", [id], function (err) {
          if (err) {
            return reject(err);
          }
          resolve(this.changes > 0);
        });
      });
    },
  },
  UserStatus: {
    ACTIVE: UserStatus.ACTIVE,
    INACTIVE: UserStatus.INACTIVE,
    PENDING: UserStatus.PENDING,
  },
  OrderStatus: {
    CREATED: OrderStatus.CREATED,
    PROCESSING: OrderStatus.PROCESSING,
    SHIPPED: OrderStatus.SHIPPED,
    DELIVERED: OrderStatus.DELIVERED,
  },
};

