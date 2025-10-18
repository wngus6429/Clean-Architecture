// ===== 데이터베이스 초기화 스크립트 =====
// stock 데이터베이스가 없으면 생성합니다.

import "dotenv/config";
import mysql from "mysql2/promise";

const dbName = process.env.DB_NAME || "stock";

async function initDB() {
  // DB 이름 없이 연결 (DB 생성을 위해)
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
  });

  try {
    // 데이터베이스 생성 (이미 있으면 무시)
    await connection.query(
      `CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
    );
    console.log(`✅ 데이터베이스 '${dbName}' 생성 완료 (또는 이미 존재함)`);
  } catch (error) {
    console.error("❌ 데이터베이스 생성 실패:", error);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

initDB();
