// ===== Repository Interface (저장소 인터페이스) =====
// 데이터 접근 계약을 정의 (구현체는 Infrastructure 레이어에)
// DDD의 핵심: 도메인은 "어떻게" 저장하는지 모르고, "무엇을" 할 수 있는지만 정의

import { Post, CreatePostInput, UpdatePostInput } from "../entities/post.entity";

/**
 * PostRepository 인터페이스
 * - 게시글 데이터 접근을 위한 계약
 * - 실제 구현은 Infrastructure 레이어에서 담당
 */
export interface IPostRepository {
  /**
   * 모든 게시글 목록 조회
   * @returns 게시글 배열 (최신순)
   */
  findAll(): Promise<Post[]>;

  /**
   * ID로 게시글 하나 조회
   * @param id - 게시글 ID
   * @returns 게시글 또는 null
   */
  findById(id: number): Promise<Post | null>;

  /**
   * 새 게시글 생성
   * @param data - 생성할 게시글 데이터
   * @returns 생성된 게시글
   */
  create(data: CreatePostInput): Promise<Post>;

  /**
   * 게시글 수정
   * @param id - 수정할 게시글 ID
   * @param data - 수정할 데이터
   * @returns 수정된 게시글 또는 null
   */
  update(id: number, data: UpdatePostInput): Promise<Post | null>;

  /**
   * 게시글 삭제
   * @param id - 삭제할 게시글 ID
   * @returns 삭제 성공 여부
   */
  delete(id: number): Promise<boolean>;
}
