// ===== 도메인 엔티티: Post (게시글) =====
// 비즈니스 로직의 핵심 데이터 구조
// 데이터베이스나 프레임워크에 의존하지 않는 순수한 비즈니스 객체

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
}
