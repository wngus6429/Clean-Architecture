// ===== Zod 스키마 정의 (API 요청 검증용) =====
// Zod를 사용해 API 요청 데이터의 타입과 유효성을 검증

import { z } from "zod";

/**
 * 게시글 생성 요청 스키마
 */
export const createPostSchema = z.object({
  title: z.string().min(1, "제목은 필수입니다.").max(200, "제목은 200자 이하여야 합니다."),
  content: z.string().min(1, "내용은 필수입니다."),
  author: z.string().min(1, "작성자는 필수입니다.").max(100, "작성자는 100자 이하여야 합니다."),
  stockCode: z.string().max(20).optional(),
  stockName: z.string().max(100).optional(),
});

/**
 * 게시글 수정 요청 스키마
 */
export const updatePostSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  content: z.string().min(1).optional(),
  author: z.string().min(1).max(100).optional(),
  stockCode: z.string().max(20).optional(),
  stockName: z.string().max(100).optional(),
});
