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
              paymentMethod: JSON.parse(row.payment_method || "{}"),
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
              paymentMethod: JSON.parse(row.payment_method || "{}"),
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
            JSON.stringify(args.paymentMethod),
          ],
          function (err) {
            if (err) return reject(err);
            resolve({ id: this.lastID, ...args });
          }
        );
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

