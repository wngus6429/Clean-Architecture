// ===== Use Case: 페이지네이션 조회 =====
import { IPostRepository } from "../../domain/repositories/post.repository.interface";
import { Post } from "../../domain/entities/post.entity";

export class GetPostsPageUseCase {
  constructor(private postRepository: IPostRepository) {}

  async execute(params: {
    page: number;
    pageSize: number;
  }): Promise<{ items: Post[]; total: number; page: number; pageSize: number }> {
    const page = Math.max(1, Math.floor(params.page || 1));
    const pageSize = Math.min(100, Math.max(1, Math.floor(params.pageSize || 10))); // 안전한 가드
    const offset = (page - 1) * pageSize;

    const { items, total } = await this.postRepository.findPage(offset, pageSize);
    return { items, total, page, pageSize };
  }
}
