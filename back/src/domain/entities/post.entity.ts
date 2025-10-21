// ===== 도메인 엔티티: Post (게시글) =====
// 비즈니스 로직의 핵심 데이터 구조
// 데이터베이스나 프레임워크에 의존하지 않는 순수한 비즈니스 객체

export type Sentiment = "bullish" | "neutral" | "bearish";
export type PositionType = "buy" | "hold" | "sell";

/**
 * 게시글 엔티티
 * - 주식 게시판의 게시글을 표현하는 도메인 모델
 */
export interface Post {
  id: number; // 게시글 고유 ID
  title: string; // 제목
  content: string; // 내용
  author: string; // 작성자
  stockCode?: string; // 주식 종목 코드 (선택)
  stockName?: string; // 주식 종목명 (선택)
  sentiment: Sentiment; // 투자 의견 (강세/중립/약세)
  positionType: PositionType; // 포지션 (매수/관망/매도)
  entryPrice?: number; // 진입가 (선택)
  targetPrice?: number; // 목표가 (선택)
  viewCount: number; // 조회수
  likeCount: number; // 공감 수
  createdAt: Date; // 생성일시
  updatedAt: Date; // 수정일시
}

/**
 * 새 게시글 생성용 데이터 (ID와 시간 제외)
 */
export interface CreatePostInput {
  title: string;
  content: string;
  author: string;
  stockCode?: string;
  stockName?: string;
  sentiment?: Sentiment;
  positionType?: PositionType;
  entryPrice?: number | null;
  targetPrice?: number | null;
}

/**
 * 게시글 수정용 데이터 (모든 필드 선택 가능)
 */
export interface UpdatePostInput {
  title?: string;
  content?: string;
  author?: string;
  stockCode?: string;
  stockName?: string;
  sentiment?: Sentiment;
  positionType?: PositionType;
  entryPrice?: number | null;
  targetPrice?: number | null;
}

/**
 * 종목 트렌드 요약
 * - 최근 게시글 기준으로 카운트 및 분위기를 제공
 */
export interface StockTrendSummary {
  stockCode: string;
  stockName?: string;
  postCount: number;
  bullishCount: number;
  neutralCount: number;
  bearishCount: number;
  avgTargetPrice?: number;
  lastPostedAt: Date;
}
