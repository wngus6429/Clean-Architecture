// ===== DB 스키마 정의 (Drizzle ORM) =====
// 주식 게시판 테이블 구조를 정의합니다.

import { mysqlTable, serial, varchar, text, timestamp } from "drizzle-orm/mysql-core";

/**
 * posts 테이블
 * - 주식 게시판의 게시글을 저장하는 테이블
 */
export const posts = mysqlTable("posts", {
  // 게시글 고유 ID (자동 증가)
  id: serial("id").primaryKey(),

  // 게시글 제목 (최대 200자)
  title: varchar("title", { length: 200 }).notNull(),

  // 게시글 내용 (긴 텍스트)
  content: text("content").notNull(),

  // 작성자 이름 (최대 100자)
  author: varchar("author", { length: 100 }).notNull(),

  // 주식 종목 코드 (예: 005930, 선택 사항)
  stockCode: varchar("stock_code", { length: 20 }),

  // 주식 종목명 (예: 삼성전자, 선택 사항)
  stockName: varchar("stock_name", { length: 100 }),

  // 생성일시 (자동 설정)
  createdAt: timestamp("created_at").defaultNow().notNull(),

  // 수정일시 (자동 업데이트)
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// TypeScript 타입 자동 추출
export type Post = typeof posts.$inferSelect; // SELECT용 타입
export type NewPost = typeof posts.$inferInsert; // INSERT용 타입
