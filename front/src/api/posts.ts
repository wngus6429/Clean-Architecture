// ===== API 클라이언트 =====
// 백엔드 API와 통신하는 함수들

import type {
  Post,
  CreatePostInput,
  UpdatePostInput,
  ApiResponse,
  Sentiment,
  PositionType,
  TrendingStock,
} from "../types/post";

const API_BASE_URL = "http://localhost:3000/api";

/**
 * 모든 게시글 조회
 */
export async function getPosts(): Promise<Post[]> {
  const response = await fetch(`${API_BASE_URL}/posts`);
  const data: ApiResponse<Post[]> = await response.json();

  if (!data.success) {
    throw new Error(data.error);
  }

  return data.data;
}

/**
 * 페이지네이션 게시글 조회
 */
export async function getPostsPage(params: {
  page: number;
  pageSize: number;
  sentiment?: Sentiment;
  stockCode?: string;
  positionType?: PositionType;
}): Promise<{
  items: Post[];
  total: number;
  page: number;
  pageSize: number;
}> {
  const search = new URLSearchParams({
    page: String(params.page),
    pageSize: String(params.pageSize),
  });

  if (params.sentiment) {
    search.set("sentiment", params.sentiment);
  }
  if (params.stockCode) {
    search.set("stockCode", params.stockCode);
  }
  if (params.positionType) {
    search.set("positionType", params.positionType);
  }

  const query = search.toString();
  const response = await fetch(`${API_BASE_URL}/posts/page?${query}`);
  const data: ApiResponse<{
    items: Post[];
    total: number;
    page: number;
    pageSize: number;
  }> = await response.json();

  if (!data.success) {
    throw new Error(data.error);
  }

  return data.data;
}

/**
 * 게시글 상세 조회
 */
export async function getPost(id: number, options?: { recordView?: boolean }): Promise<Post> {
  const url = new URL(`${API_BASE_URL}/posts/${id}`);
  if (options?.recordView === false) {
    url.searchParams.set("recordView", "false");
  }

  const response = await fetch(url.toString());
  const data: ApiResponse<Post> = await response.json();

  if (!data.success) {
    throw new Error(data.error);
  }

  return data.data;
}

/**
 * 게시글 생성
 */
export async function createPost(input: CreatePostInput): Promise<Post> {
  const response = await fetch(`${API_BASE_URL}/posts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  const data: ApiResponse<Post> = await response.json();

  if (!data.success) {
    throw new Error(data.error);
  }

  return data.data;
}

/**
 * 게시글 수정
 */
export async function updatePost(id: number, input: UpdatePostInput): Promise<Post> {
  const response = await fetch(`${API_BASE_URL}/posts/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  const data: ApiResponse<Post> = await response.json();

  if (!data.success) {
    throw new Error(data.error);
  }

  return data.data;
}

/**
 * 게시글 삭제
 */
export async function deletePost(id: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/posts/${id}`, {
    method: "DELETE",
  });

  const data = await response.json();

  if (!data.success) {
    throw new Error(data.error);
  }
}

/**
 * 게시글 공감 추가
 */
export async function likePost(id: number): Promise<Post> {
  const response = await fetch(`${API_BASE_URL}/posts/${id}/like`, {
    method: "POST",
  });
  const data: ApiResponse<Post> = await response.json();

  if (!data.success) {
    throw new Error(data.error);
  }

  return data.data;
}

/**
 * 게시글 공감 취소
 */
export async function unlikePost(id: number): Promise<Post> {
  const response = await fetch(`${API_BASE_URL}/posts/${id}/like`, {
    method: "DELETE",
  });
  const data: ApiResponse<Post> = await response.json();

  if (!data.success) {
    throw new Error(data.error);
  }

  return data.data;
}

/**
 * 트렌딩 종목 조회
 */
export async function getTrendingStocks(params?: { limit?: number; days?: number }): Promise<TrendingStock[]> {
  const url = new URL(`${API_BASE_URL}/posts/trending`);
  if (params?.limit) {
    url.searchParams.set("limit", String(params.limit));
  }
  if (params?.days) {
    url.searchParams.set("days", String(params.days));
  }

  const response = await fetch(url.toString());
  const data: ApiResponse<TrendingStock[]> = await response.json();

  if (!data.success) {
    throw new Error(data.error);
  }

  return data.data;
}
