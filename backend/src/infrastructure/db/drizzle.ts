// ===== Drizzle ORM 클라이언트 생성 =====
// MySQL과 Drizzle을 연결합니다.

import "dotenv/config";
import { drizzle } from "drizzle-orm/mysql2";
import { pool } from "../../db";
import * as schema from "./schema";

// Drizzle 클라이언트 생성
// - pool: MySQL 커넥션 풀 (db.ts에서 가져옴)
// - schema: 테이블 정의 (schema.ts에서 가져옴)
export const db = drizzle(pool, { schema, mode: "default" });
