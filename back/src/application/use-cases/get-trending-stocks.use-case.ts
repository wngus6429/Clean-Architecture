// ===== Use Case: 트렌딩 종목 조회 =====

import { IPostRepository } from "../../domain/repositories/post.repository.interface";
import { StockTrendSummary } from "../../domain/entities/post.entity";

export class GetTrendingStocksUseCase {
  constructor(private postRepository: IPostRepository) {}

  async execute(params?: { limit?: number; days?: number }): Promise<StockTrendSummary[]> {
    const rawLimit = params?.limit ?? 5;
    const rawDays = params?.days ?? 7;

    const limitNumber = Number.isFinite(rawLimit) ? Math.floor(rawLimit) : 5;
    const daysNumber = Number.isFinite(rawDays) ? Math.floor(rawDays) : 7;

    const limit = Math.min(20, Math.max(1, limitNumber));
    const days = Math.min(90, Math.max(1, daysNumber));

    return await this.postRepository.findTrendingStocks({ limit, days });
  }
}
