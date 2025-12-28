import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";
import { join } from "path";
import { getDatabase } from "../database/db";
import { UserStatus, PaymentMethod } from "../types/models";

const PROTO_PATH = join(__dirname, "user.proto");

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const userProto = grpc.loadPackageDefinition(
  packageDefinition
) as any;

export function getGrpcService(): any {
  return {
    GetUser: (
      call: grpc.ServerUnaryCall<any, any>,
      callback: grpc.sendUnaryData<any>
    ) => {
      const db = getDatabase();
      const userId = call.request.id;

      db.get(
        "SELECT * FROM users WHERE id = ?",
        [userId],
        (err, row: any) => {
          if (err) {
            return callback({
              code: grpc.status.INTERNAL,
              message: err.message,
            });
          }
          if (!row) {
            return callback({
              code: grpc.status.NOT_FOUND,
              message: "User not found",
            });
          }

          callback(null, {
            id: row.id,
            email: row.email,
            name: row.name,
            status: row.status,
            description: row.description || undefined,
            metadata: JSON.parse(row.metadata || "{}"),
            tags: JSON.parse(row.tags || "[]"),
            payment_method: row.payment_method,
          });
        }
      );
    },
    CreateUser: (
      call: grpc.ServerUnaryCall<any, any>,
      callback: grpc.sendUnaryData<any>
    ) => {
      const db = getDatabase();
      const { email, name, status, description, metadata, tags, payment_method } =
        call.request;

      db.run(
        "INSERT INTO users (email, name, status, description, metadata, tags, payment_method) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [
          email,
          name,
          status,
          description || null,
          JSON.stringify(metadata || {}),
          JSON.stringify(tags || []),
          payment_method,
        ],
        function (err) {
          if (err) {
            return callback({
              code: grpc.status.INTERNAL,
              message: err.message,
            });
          }
          callback(null, {
            id: this.lastID,
            email,
            name,
            status,
            description: description || undefined,
            metadata: metadata || {},
            tags: tags || [],
            payment_method,
          });
        }
      );
    },
    ListUsers: (
      call: grpc.ServerUnaryCall<any, any>,
      callback: grpc.sendUnaryData<any>
    ) => {
      const db = getDatabase();
      db.all("SELECT * FROM users", [], (err, rows: any[]) => {
        if (err) {
          return callback({
            code: grpc.status.INTERNAL,
            message: err.message,
          });
        }

        callback(null, {
          users: rows.map((row) => ({
            id: row.id,
            email: row.email,
            name: row.name,
            status: row.status,
            description: row.description || undefined,
            metadata: JSON.parse(row.metadata || "{}"),
            tags: JSON.parse(row.tags || "[]"),
            payment_method: row.payment_method,
          })),
          total: rows.length,
        });
      });
    },
  };
}

