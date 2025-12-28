import sqlite3 from "sqlite3";
import { readFileSync } from "fs";
import { join } from "path";

let db: sqlite3.Database | null = null;

export function getDatabase(): sqlite3.Database {
  if (!db) {
    db = new sqlite3.Database(":memory:", (err) => {
      if (err) {
        console.error("Error opening database:", err);
      }
    });

    // Initialize schema
    const schema = readFileSync(
      join(__dirname, "schema.sql"),
      "utf-8"
    );
    db.exec(schema);
  }

  return db;
}

export function closeDatabase(): void {
  if (db) {
    db.close();
    db = null;
  }
}

