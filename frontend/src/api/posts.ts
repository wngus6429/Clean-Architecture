// ===== API 클라이언트 =====
// 백엔드 API와 통신하는 함수들

import type { Post, CreatePostInput, UpdatePostInput, ApiResponse } from "../types/post";

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
 * 게시글 상세 조회
 */
export async function getPost(id: number): Promise<Post> {
  const response = await fetch(`${API_BASE_URL}/posts/${id}`);
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
