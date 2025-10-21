// ===== API 타입 정의 =====
// 백엔드 API 응답 구조를 정의

export type Sentiment = "bullish" | "neutral" | "bearish";
export type PositionType = "buy" | "hold" | "sell";

/**
 * 게시글 타입
 */
export interface Post {
  id: number;
  title: string;
  content: string;
  author: string;
  stockCode?: string;
  stockName?: string;
  sentiment: Sentiment;
  positionType: PositionType;
  entryPrice?: number | null;
  targetPrice?: number | null;
  viewCount: number;
  likeCount: number;
  createdAt: string; // ISO 8601 문자열
  updatedAt: string;
}

/**
 * 게시글 생성 요청
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
 * 게시글 수정 요청
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
 * 트렌딩 종목 정보
 */
export interface TrendingStock {
  stockCode: string;
  stockName?: string;
  postCount: number;
  bullishCount: number;
  neutralCount: number;
  bearishCount: number;
  avgTargetPrice?: number | null;
  lastPostedAt: string;
}

/**
 * API 응답 - 성공
 */
export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
}

/**
 * API 응답 - 에러
 */
export interface ApiErrorResponse {
  success: false;
  error: string;
}

/**
 * API 응답 타입 (Union)
 */
export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;
