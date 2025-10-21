// ===== Use Case: 페이지네이션 조회 =====
import { IPostRepository, PostPageFilters } from "../../domain/repositories/post.repository.interface";
import { Post, Sentiment, PositionType } from "../../domain/entities/post.entity";

export class GetPostsPageUseCase {
  constructor(private postRepository: IPostRepository) {}

  async execute(params: {
    page: number;
    pageSize: number;
    sentiment?: Sentiment;
    stockCode?: string;
    positionType?: PositionType;
  }): Promise<{ items: Post[]; total: number; page: number; pageSize: number }> {
    const page = Math.max(1, Math.floor(params.page || 1));
    const pageSize = Math.min(100, Math.max(1, Math.floor(params.pageSize || 10))); // 안전한 가드
    const offset = (page - 1) * pageSize;

    const filters: PostPageFilters = {};

    if (params.sentiment) {
      filters.sentiment = params.sentiment;
    }

    if (params.stockCode && params.stockCode.trim().length > 0) {
      filters.stockCode = params.stockCode.trim();
    }

    if (params.positionType) {
      filters.positionType = params.positionType;
    }

    const { items, total } = await this.postRepository.findPage(offset, pageSize, filters);
    return { items, total, page, pageSize };
  }
}
