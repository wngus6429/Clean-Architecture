// ===== Use Case: 게시글 ID로 조회 =====

import { IPostRepository } from "../../domain/repositories/post.repository.interface";
import { Post } from "../../domain/entities/post.entity";

/**
 * 게시글 상세 조회 유스케이스
 */
export class GetPostByIdUseCase {
  constructor(private postRepository: IPostRepository) {}

  /**
   * @param id - 조회할 게시글 ID
   * @returns 게시글 또는 null
   */
  async execute(id: number, options?: { recordView?: boolean }): Promise<Post | null> {
    // 비즈니스 로직: ID 유효성 검사 추가 가능
    if (id <= 0) {
      throw new Error("유효하지 않은 게시글 ID입니다.");
    }

    const shouldRecordView = options?.recordView ?? true;

    if (shouldRecordView) {
      return await this.postRepository.incrementViewCount(id);
    }

    return await this.postRepository.findById(id);
  }
}
