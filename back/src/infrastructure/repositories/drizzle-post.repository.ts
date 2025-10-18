// ===== Repository 구현체 (Drizzle ORM 사용) =====
// IPostRepository 인터페이스를 실제로 구현
// 데이터베이스 접근 로직을 담당

import { eq, desc, sql } from "drizzle-orm";
import { db } from "../db/drizzle";
import { posts } from "../db/schema";
import { IPostRepository } from "../../domain/repositories/post.repository.interface";
import { Post, CreatePostInput, UpdatePostInput } from "../../domain/entities/post.entity";

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
    };
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
  async findPage(offset: number, limit: number): Promise<{ items: Post[]; total: number }> {
    // total count (drizzle sql helper로 안전하게 카운트)
    const [{ total }] = await db.select({ total: sql<number>`count(*)` }).from(posts);

    // page items (최신순)
    const rows = await db.select().from(posts).orderBy(desc(posts.createdAt)).limit(limit).offset(offset);

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
      stockCode: data.stockCode,
      stockName: data.stockName,
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
    await db.update(posts).set(data).where(eq(posts.id, id));

    // 수정된 게시글 반환
    return await this.findById(id);
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
