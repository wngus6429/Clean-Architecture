// ===== Use Case: 게시글 공감 수 조정 =====

import { IPostRepository } from "../../domain/repositories/post.repository.interface";
import { Post } from "../../domain/entities/post.entity";

export class ChangePostLikeUseCase {
  constructor(private postRepository: IPostRepository) {}

  async execute(id: number, delta: 1 | -1): Promise<Post> {
    if (id <= 0) {
      throw new Error("유효하지 않은 게시글 ID입니다.");
    }

    if (delta !== 1 && delta !== -1) {
      throw new Error("delta는 1 또는 -1 이어야 합니다.");
    }

    const updated = await this.postRepository.updateLikeCount(id, delta);
    if (!updated) {
      throw new Error("게시글을 찾을 수 없습니다.");
    }

    return updated;
  }
}
