// ===== Use Case: 게시글 삭제 =====

import { IPostRepository } from "../../domain/repositories/post.repository.interface";

/**
 * 게시글 삭제 유스케이스
 */
export class DeletePostUseCase {
  constructor(private postRepository: IPostRepository) {}

  /**
   * @param id - 삭제할 게시글 ID
   * @returns 삭제 성공 여부
   */
  async execute(id: number): Promise<boolean> {
    // 비즈니스 로직: ID 검증
    if (id <= 0) {
      throw new Error("유효하지 않은 게시글 ID입니다.");
    }

    // 게시글이 존재하는지 확인
    const post = await this.postRepository.findById(id);
    if (!post) {
      throw new Error("게시글을 찾을 수 없습니다.");
    }

    return await this.postRepository.delete(id);
  }
}
