// ===== 메인 서버 (Hono) =====
// API 서버의 진입점

import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { cors } from "hono/cors"; // CORS 설정 추가
import postRouter from "./presentation/routes/post.routes";

const app = new Hono();

// CORS 설정 (프론트엔드에서 API 호출 가능하도록)
app.use(
  "*",
  cors({
    origin: ["http://localhost:5173", "http://localhost:5174"], // Vite 기본 포트
    credentials: true,
  })
);

// 헬스 체크
app.get("/health", (c) => c.text("OK"));

// 게시판 API 라우트 연결
app.route("/api/posts", postRouter);

// 404 처리
app.notFound((c) => c.json({ success: false, error: "Not Found" }, 404));

// 서버 시작
const port = Number(process.env.PORT || 3000);
console.log(`🚀 서버 실행 중: http://localhost:${port}`);
console.log(`📝 게시판 API: http://localhost:${port}/api/posts`);

serve({
  fetch: app.fetch,
  port,
});
