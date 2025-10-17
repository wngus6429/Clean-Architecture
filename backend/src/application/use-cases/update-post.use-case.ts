// ===== Use Case: 게시글 수정 =====

import { IPostRepository } from "../../domain/repositories/post.repository.interface";
import { Post, UpdatePostInput } from "../../domain/entities/post.entity";

/**
 * 게시글 수정 유스케이스
 */
export class UpdatePostUseCase {
  constructor(private postRepository: IPostRepository) {}

  /**
   * @param id - 수정할 게시글 ID
   * @param data - 수정할 데이터
   * @returns 수정된 게시글 또는 null
   */
  async execute(id: number, data: UpdatePostInput): Promise<Post | null> {
    // 비즈니스 로직: ID 검증
    if (id <= 0) {
      throw new Error("유효하지 않은 게시글 ID입니다.");
    }

    // 수정할 내용이 있는지 확인
    if (Object.keys(data).length === 0) {
      throw new Error("수정할 내용이 없습니다.");
    }

    // 데이터 정제
    const sanitizedData: UpdatePostInput = {};
    if (data.title !== undefined) sanitizedData.title = data.title.trim();
    if (data.content !== undefined) sanitizedData.content = data.content.trim();
    if (data.author !== undefined) sanitizedData.author = data.author.trim();
    if (data.stockCode !== undefined) sanitizedData.stockCode = data.stockCode.trim() || undefined;
    if (data.stockName !== undefined) sanitizedData.stockName = data.stockName.trim() || undefined;

    return await this.postRepository.update(id, sanitizedData);
  }
}
