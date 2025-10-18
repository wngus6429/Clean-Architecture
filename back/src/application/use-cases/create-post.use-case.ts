// ===== Use Case: 새 게시글 생성 =====

import { IPostRepository } from "../../domain/repositories/post.repository.interface";
import { Post, CreatePostInput } from "../../domain/entities/post.entity";

/**
 * 게시글 생성 유스케이스
 */
export class CreatePostUseCase {
  constructor(private postRepository: IPostRepository) {}

  /**
   * @param data - 생성할 게시글 데이터
   * @returns 생성된 게시글
   */
  async execute(data: CreatePostInput): Promise<Post> {
    // 비즈니스 로직: 입력값 검증
    if (!data.title || data.title.trim().length === 0) {
      throw new Error("제목은 필수입니다.");
    }

    if (!data.content || data.content.trim().length === 0) {
      throw new Error("내용은 필수입니다.");
    }

    if (!data.author || data.author.trim().length === 0) {
      throw new Error("작성자는 필수입니다.");
    }

    // 데이터 정제 (앞뒤 공백 제거)
    const sanitizedData: CreatePostInput = {
      title: data.title.trim(),
      content: data.content.trim(),
      author: data.author.trim(),
      stockCode: data.stockCode?.trim() || undefined,
      stockName: data.stockName?.trim() || undefined,
    };

    return await this.postRepository.create(sanitizedData);
  }
}
