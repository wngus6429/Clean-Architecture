// ===== 게시글 API 라우터 (Hono) =====
// REST API 엔드포인트 정의
// 클린 아키텍처의 Presentation Layer

import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { createPostSchema, updatePostSchema } from "../schemas/post.schema";

// Use Cases 가져오기
import { GetAllPostsUseCase } from "../../application/use-cases/get-all-posts.use-case";
import { GetPostsPageUseCase } from "../../application/use-cases/get-posts-page.use-case";
import { GetPostByIdUseCase } from "../../application/use-cases/get-post-by-id.use-case";
import { CreatePostUseCase } from "../../application/use-cases/create-post.use-case";
import { UpdatePostUseCase } from "../../application/use-cases/update-post.use-case";
import { DeletePostUseCase } from "../../application/use-cases/delete-post.use-case";
import { ChangePostLikeUseCase } from "../../application/use-cases/change-post-like.use-case";
import { GetTrendingStocksUseCase } from "../../application/use-cases/get-trending-stocks.use-case";

// Repository 구현체
import { DrizzlePostRepository } from "../../infrastructure/repositories/drizzle-post.repository";
import type { Sentiment, PositionType } from "../../domain/entities/post.entity";

// 의존성 주입 (Dependency Injection)
const postRepository = new DrizzlePostRepository();
const getAllPostsUseCase = new GetAllPostsUseCase(postRepository);
const getPostsPageUseCase = new GetPostsPageUseCase(postRepository);
const getPostByIdUseCase = new GetPostByIdUseCase(postRepository);
const createPostUseCase = new CreatePostUseCase(postRepository);
const updatePostUseCase = new UpdatePostUseCase(postRepository);
const deletePostUseCase = new DeletePostUseCase(postRepository);
const changePostLikeUseCase = new ChangePostLikeUseCase(postRepository);
const getTrendingStocksUseCase = new GetTrendingStocksUseCase(postRepository);

// Hono 라우터 생성
const postRouter = new Hono();

/**
 * GET /posts
 * 모든 게시글 목록 조회
 */
postRouter.get("/", async (c) => {
  try {
    const posts = await getAllPostsUseCase.execute();
    return c.json({ success: true, data: posts });
  } catch (error) {
    return c.json({ success: false, error: (error as Error).message }, 500);
  }
});

/**
 * GET /posts/page?page=1&pageSize=10
 * 페이지네이션 목록 조회
 */
postRouter.get("/page", async (c) => {
  try {
    const url = new URL(c.req.url);
    const page = Number(url.searchParams.get("page") ?? "1");
    const pageSize = Number(url.searchParams.get("pageSize") ?? "10");
    const sentimentParam = url.searchParams.get("sentiment");
    const sentiment = sentimentParam === "bullish" || sentimentParam === "neutral" || sentimentParam === "bearish"
      ? (sentimentParam as Sentiment)
      : undefined;
    const positionParam = url.searchParams.get("positionType");
    const positionType = positionParam === "buy" || positionParam === "hold" || positionParam === "sell"
      ? (positionParam as PositionType)
      : undefined;
    const stockCodeParam = url.searchParams.get("stockCode");
    const stockCode = stockCodeParam && stockCodeParam.trim().length > 0 ? stockCodeParam.trim() : undefined;

    const result = await getPostsPageUseCase.execute({
      page,
      pageSize,
      sentiment,
      positionType,
      stockCode,
    });
    return c.json({ success: true, data: result });
  } catch (error) {
    return c.json({ success: false, error: (error as Error).message }, 500);
  }
});

/**
 * GET /posts/trending
 * 최근 인기 종목 통계
 */
postRouter.get("/trending", async (c) => {
  try {
    const url = new URL(c.req.url);
    const limitRaw = url.searchParams.get("limit");
    const daysRaw = url.searchParams.get("days");

    const parsedLimit = limitRaw ? Number(limitRaw) : undefined;
    const parsedDays = daysRaw ? Number(daysRaw) : undefined;
    const limit = parsedLimit !== undefined && !Number.isNaN(parsedLimit) ? parsedLimit : undefined;
    const days = parsedDays !== undefined && !Number.isNaN(parsedDays) ? parsedDays : undefined;

    const trends = await getTrendingStocksUseCase.execute({ limit, days });
    return c.json({ success: true, data: trends });
  } catch (error) {
    return c.json({ success: false, error: (error as Error).message }, 500);
  }
});

/**
 * GET /posts/:id
 * 특정 게시글 상세 조회
 */
postRouter.get("/:id", async (c) => {
  try {
    const id = Number(c.req.param("id"));

    if (isNaN(id)) {
      return c.json({ success: false, error: "유효하지 않은 ID입니다." }, 400);
    }

    const url = new URL(c.req.url);
    const recordViewParam = url.searchParams.get("recordView");
    const recordView = recordViewParam === "false" ? false : true;

    const post = await getPostByIdUseCase.execute(id, { recordView });

    if (!post) {
      return c.json({ success: false, error: "게시글을 찾을 수 없습니다." }, 404);
    }

    return c.json({ success: true, data: post });
  } catch (error) {
    return c.json({ success: false, error: (error as Error).message }, 500);
  }
});

/**
 * POST /posts
 * 새 게시글 생성
 */
postRouter.post("/", zValidator("json", createPostSchema), async (c) => {
  try {
    const data = c.req.valid("json");
    const post = await createPostUseCase.execute(data);

    return c.json({ success: true, data: post }, 201);
  } catch (error) {
    return c.json({ success: false, error: (error as Error).message }, 400);
  }
});

/**
 * PUT /posts/:id
 * 게시글 수정
 */
postRouter.put("/:id", zValidator("json", updatePostSchema), async (c) => {
  try {
    const id = Number(c.req.param("id"));

    if (isNaN(id)) {
      return c.json({ success: false, error: "유효하지 않은 ID입니다." }, 400);
    }

    const data = c.req.valid("json");
    const post = await updatePostUseCase.execute(id, data);

    if (!post) {
      return c.json({ success: false, error: "게시글을 찾을 수 없습니다." }, 404);
    }

    return c.json({ success: true, data: post });
  } catch (error) {
    return c.json({ success: false, error: (error as Error).message }, 400);
  }
});

/**
 * POST /posts/:id/like
 * 게시글 공감 증가
 */
postRouter.post("/:id/like", async (c) => {
  try {
    const id = Number(c.req.param("id"));
    if (isNaN(id)) {
      return c.json({ success: false, error: "유효하지 않은 ID입니다." }, 400);
    }

    const post = await changePostLikeUseCase.execute(id, 1);
    return c.json({ success: true, data: post });
  } catch (error) {
    return c.json({ success: false, error: (error as Error).message }, 400);
  }
});

/**
 * DELETE /posts/:id/like
 * 게시글 공감 감소
 */
postRouter.delete("/:id/like", async (c) => {
  try {
    const id = Number(c.req.param("id"));
    if (isNaN(id)) {
      return c.json({ success: false, error: "유효하지 않은 ID입니다." }, 400);
    }

    const post = await changePostLikeUseCase.execute(id, -1);
    return c.json({ success: true, data: post });
  } catch (error) {
    return c.json({ success: false, error: (error as Error).message }, 400);
  }
});

/**
 * DELETE /posts/:id
 * 게시글 삭제
 */
postRouter.delete("/:id", async (c) => {
  try {
    const id = Number(c.req.param("id"));

    if (isNaN(id)) {
      return c.json({ success: false, error: "유효하지 않은 ID입니다." }, 400);
    }

    const deleted = await deletePostUseCase.execute(id);

    if (!deleted) {
      return c.json({ success: false, error: "게시글 삭제 실패" }, 500);
    }

    return c.json({ success: true, message: "게시글이 삭제되었습니다." });
  } catch (error) {
    return c.json({ success: false, error: (error as Error).message }, 400);
  }
});

export default postRouter;
