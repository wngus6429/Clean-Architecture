import "dotenv/config";
import mysql from "mysql2/promise";

// Construct pool using env vars
const {
  DB_HOST = "localhost",
  DB_PORT = "3306",
  DB_USER = "root",
  DB_PASSWORD = "",
  DB_NAME = "",
  DB_POOL_MIN = "0",
  DB_POOL_MAX = "10",
  DB_POOL_IDLE = "10000",
} = process.env;

// mysql2 doesn't have min option; using connectionLimit for max
export const pool = mysql.createPool({
  host: DB_HOST,
  port: Number(DB_PORT),
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
  waitForConnections: true,
  connectionLimit: Number(DB_POOL_MAX),
  idleTimeout: Number(DB_POOL_IDLE),
  // enable named placeholders if needed
  namedPlaceholders: true,
});

export async function ping() {
  const conn = await pool.getConnection();
  try {
    const [rows] = await conn.query("SELECT 1 AS ok");
    return rows as Array<Record<string, unknown>>;
  } finally {
    conn.release();
  }
}

export async function withConnection<T>(fn: (conn: mysql.PoolConnection) => Promise<T>): Promise<T> {
  const conn = await pool.getConnection();
  try {
    return await fn(conn);
  } finally {
    conn.release();
  }
}
