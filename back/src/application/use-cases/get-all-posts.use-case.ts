// ===== Use Case: 모든 게시글 조회 =====
// 비즈니스 로직을 캡슐화한 유스케이스
// 컨트롤러(presentation)와 저장소(infrastructure) 사이의 중간 계층

import { IPostRepository } from "../../domain/repositories/post.repository.interface";
import { Post } from "../../domain/entities/post.entity";

/**
 * 모든 게시글 조회 유스케이스
 * - 단일 책임: 게시글 목록을 가져오는 것
 */
export class GetAllPostsUseCase {
  // Repository를 주입받음 (Dependency Injection)
  constructor(private postRepository: IPostRepository) {}

  /**
   * 유스케이스 실행
   * @returns 게시글 목록
   */
  async execute(): Promise<Post[]> {
    // 비즈니스 로직: 여기서는 단순히 전체 조회
    // 필요하면 정렬, 필터링, 권한 체크 등을 추가할 수 있음
    return await this.postRepository.findAll();
  }
}
