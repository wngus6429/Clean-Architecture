// ===== Repository 구현체 (Drizzle ORM 사용) =====
// IPostRepository 인터페이스를 실제로 구현
// 데이터베이스 접근 로직을 담당

import { eq, desc, sql, and } from "drizzle-orm";
import { db } from "../db/drizzle";
import { posts, NewPost } from "../db/schema";
import { IPostRepository, PostPageFilters } from "../../domain/repositories/post.repository.interface";
import {
  Post,
  CreatePostInput,
  UpdatePostInput,
  StockTrendSummary,
} from "../../domain/entities/post.entity";

/**
 * Drizzle ORM을 사용한 PostRepository 구현체
 */
export class DrizzlePostRepository implements IPostRepository {
  /**
   * DB 결과를 도메인 엔티티로 변환 (null -> undefined)
   */
  private toDomain(dbPost: typeof posts.$inferSelect): Post {
    return {
      ...dbPost,
      stockCode: dbPost.stockCode ?? undefined,
      stockName: dbPost.stockName ?? undefined,
      entryPrice: dbPost.entryPrice !== null ? Number(dbPost.entryPrice) : undefined,
      targetPrice: dbPost.targetPrice !== null ? Number(dbPost.targetPrice) : undefined,
      viewCount: dbPost.viewCount ?? 0,
      likeCount: dbPost.likeCount ?? 0,
    };
  }

  /**
   * Update 시 사용할 payload 구성 (undefined 필드 제거)
   */
  private buildUpdatePayload(data: UpdatePostInput): Partial<NewPost> {
    const payload: Partial<NewPost> = {};

    if (data.title !== undefined) payload.title = data.title;
    if (data.content !== undefined) payload.content = data.content;
    if (data.author !== undefined) payload.author = data.author;
    if (data.stockCode !== undefined) payload.stockCode = data.stockCode || null;
    if (data.stockName !== undefined) payload.stockName = data.stockName || null;
    if (data.sentiment !== undefined) payload.sentiment = data.sentiment;
    if (data.positionType !== undefined) payload.positionType = data.positionType;
    if (data.entryPrice !== undefined) payload.entryPrice = data.entryPrice === null ? null : data.entryPrice;
    if (data.targetPrice !== undefined) payload.targetPrice = data.targetPrice === null ? null : data.targetPrice;

    return payload;
  }

  private buildFilters(filters?: PostPageFilters) {
    const conditions: any[] = [];

    if (filters?.sentiment) conditions.push(eq(posts.sentiment, filters.sentiment));
    if (filters?.stockCode) conditions.push(eq(posts.stockCode, filters.stockCode));
    if (filters?.positionType) conditions.push(eq(posts.positionType, filters.positionType));

    return conditions.length ? and(...conditions) : undefined;
  }

  /**
   * 모든 게시글 조회 (최신순)
   */
  async findAll(): Promise<Post[]> {
    const result = await db.select().from(posts).orderBy(desc(posts.createdAt)); // 최신순 정렬

    return result.map(this.toDomain);
  }

  /**
   * 페이지네이션 조회
   */
  async findPage(
    offset: number,
    limit: number,
    filters?: PostPageFilters
  ): Promise<{ items: Post[]; total: number }> {
    const whereClause = this.buildFilters(filters);

    const totalQuery = whereClause
      ? db.select({ total: sql<number>`count(*)` }).from(posts).where(whereClause)
      : db.select({ total: sql<number>`count(*)` }).from(posts);

    const [{ total }] = await totalQuery;

    // page items (최신순)
    const rowsQuery = whereClause
      ? db.select().from(posts).where(whereClause)
      : db.select().from(posts);

    const rows = await rowsQuery.orderBy(desc(posts.createdAt)).limit(limit).offset(offset);

    return { items: rows.map(this.toDomain), total: Number(total ?? 0) };
  }

  /**
   * ID로 게시글 조회
   */
  async findById(id: number): Promise<Post | null> {
    const result = await db
      .select()
      .from(posts)
      .where(eq(posts.id, id)) // WHERE id = ?
      .limit(1);

    return result[0] ? this.toDomain(result[0]) : null;
  }

  /**
   * 새 게시글 생성
   */
  async create(data: CreatePostInput): Promise<Post> {
    const result = await db.insert(posts).values({
      title: data.title,
      content: data.content,
      author: data.author,
      stockCode: data.stockCode ?? undefined,
      stockName: data.stockName ?? undefined,
      sentiment: data.sentiment ?? "neutral",
      positionType: data.positionType ?? "hold",
      entryPrice: data.entryPrice === null ? null : data.entryPrice ?? undefined,
      targetPrice: data.targetPrice === null ? null : data.targetPrice ?? undefined,
    });

    // 생성된 게시글의 ID 가져오기
    const insertId = Number(result[0].insertId);

    // 생성된 게시글 반환
    const created = await this.findById(insertId);
    if (!created) {
      throw new Error("게시글 생성 후 조회 실패");
    }

    return created;
  }

  /**
   * 게시글 수정
   */
  async update(id: number, data: UpdatePostInput): Promise<Post | null> {
    // 게시글 존재 여부 확인
    const existing = await this.findById(id);
    if (!existing) {
      return null;
    }

    // 수정 실행
    const payload = this.buildUpdatePayload(data);
    if (Object.keys(payload).length === 0) {
      return existing;
    }

    await db.update(posts).set(payload).where(eq(posts.id, id));

    // 수정된 게시글 반환
    return await this.findById(id);
  }

  /**
   * 조회수 +1
   */
  async incrementViewCount(id: number): Promise<Post | null> {
    const existing = await this.findById(id);
    if (!existing) {
      return null;
    }

    await db
      .update(posts)
      .set({ viewCount: existing.viewCount + 1 })
      .where(eq(posts.id, id));

    return await this.findById(id);
  }

  /**
   * 공감 수 증감
   */
  async updateLikeCount(id: number, delta: 1 | -1): Promise<Post | null> {
    const existing = await this.findById(id);
    if (!existing) {
      return null;
    }

    const next = Math.max(0, (existing.likeCount ?? 0) + delta);

    await db
      .update(posts)
      .set({ likeCount: next })
      .where(eq(posts.id, id));

    return await this.findById(id);
  }

  /**
   * 최근 인기 종목 목록
   */
  async findTrendingStocks(params: { limit: number; days: number }): Promise<StockTrendSummary[]> {
    const { limit, days } = params;

    const rows = await db
      .select({
        stockCode: posts.stockCode,
        stockName: posts.stockName,
        postCount: sql<number>`count(*)`,
        bullishCount: sql<number>`sum(case when ${posts.sentiment} = 'bullish' then 1 else 0 end)`,
        neutralCount: sql<number>`sum(case when ${posts.sentiment} = 'neutral' then 1 else 0 end)`,
        bearishCount: sql<number>`sum(case when ${posts.sentiment} = 'bearish' then 1 else 0 end)`,
        avgTargetPrice: sql<string | null>`avg(${posts.targetPrice})`,
        lastPostedAt: sql<Date>`max(${posts.createdAt})`,
      })
      .from(posts)
      .where(
        and(sql`${posts.stockCode} IS NOT NULL`, sql`${posts.createdAt} >= DATE_SUB(NOW(), INTERVAL ${days} DAY)`)
      )
      .groupBy(posts.stockCode, posts.stockName)
      .orderBy(desc(sql<number>`count(*)`))
      .limit(limit);

    return rows
      .filter((row) => !!row.stockCode)
      .map((row) => ({
        stockCode: row.stockCode!,
        stockName: row.stockName ?? undefined,
        postCount: Number(row.postCount ?? 0),
        bullishCount: Number(row.bullishCount ?? 0),
        neutralCount: Number(row.neutralCount ?? 0),
        bearishCount: Number(row.bearishCount ?? 0),
        avgTargetPrice: row.avgTargetPrice !== null ? Number(row.avgTargetPrice) : undefined,
        lastPostedAt: new Date(row.lastPostedAt),
      }));
  }

  /**
   * 게시글 삭제
   */
  async delete(id: number): Promise<boolean> {
    const result = await db.delete(posts).where(eq(posts.id, id));

    // affectedRows가 1 이상이면 삭제 성공
    return (result[0].affectedRows ?? 0) > 0;
  }
}
