# 클린 아키텍처 코드 실행 흐름 가이드

> 게시글 작성(POST /posts) 기준으로 설명합니다.

---

## 📂 파일 구조

```
back/src/
├── domain/                          # 도메인 레이어 (가장 안쪽)
│   ├── entities/
│   │   └── post.entity.ts          # Post 엔티티 정의
│   └── repositories/
│       └── post.repository.interface.ts  # Repository 인터페이스
│
├── application/                     # 애플리케이션 레이어
│   └── use-cases/
│       └── create-post.use-case.ts # 비즈니스 로직
│
├── infrastructure/                  # 인프라 레이어 (외부 기술)
│   ├── db/
│   │   └── schema.ts               # DB 스키마
│   └── repositories/
│       └── drizzle-post.repository.ts  # Repository 구현체
│
└── presentation/                    # 프레젠테이션 레이어 (가장 바깥)
    └── routes/
        └── post.routes.ts          # HTTP 라우트
```

---

## 🔄 전체 실행 흐름 요약

```
[서버 시작 시 - 단 1번 실행]
1️⃣ post.routes.ts - 의존성 주입
   └─ new DrizzlePostRepository()
   └─ new CreatePostUseCase(postRepository)

[HTTP 요청마다 실행]
2️⃣ post.routes.ts - POST /posts 요청 수신
   ↓
3️⃣ create-post.use-case.ts - 비즈니스 로직 실행
   ↓
4️⃣ drizzle-post.repository.ts - DB 작업
   ↓
5️⃣ post.routes.ts - HTTP 응답 반환
```

---

## 📝 단계별 상세 설명

### 1️⃣ **post.routes.ts - 의존성 주입 (서버 시작 시)**

**파일 위치**: `back/src/presentation/routes/post.routes.ts`

```typescript
// 서버 시작 시 이 코드가 먼저 실행됨 (단 한 번!)
const postRepository = new DrizzlePostRepository();
const createPostUseCase = new CreatePostUseCase(postRepository);
//                                               ↑
//                          DrizzlePostRepository를 Use Case에 주입!
```

**역할**:

- ✅ Repository 인스턴스 생성
- ✅ Use Case에 Repository 주입 (의존성 주입)
- ✅ 메모리에 객체 생성 완료

**의존성 주입이란?**

```typescript
// Use Case는 IPostRepository 인터페이스만 알고 있음
constructor(private postRepository: IPostRepository) {}

// 실제로는 DrizzlePostRepository 구현체가 주입됨
// → DB를 MySQL에서 PostgreSQL로 바꿔도 Use Case는 수정 불필요!
```

---

### 2️⃣ **post.routes.ts - HTTP 요청 수신**

**파일 위치**: `back/src/presentation/routes/post.routes.ts`

```typescript
// 클라이언트가 POST /posts 요청하면 이 함수 실행
postRouter.post("/", zValidator("json", createPostSchema), async (c) => {
  try {
    // ① Zod 스키마 검증
    const data = c.req.valid("json");
    // data = { title: "제목", content: "내용", author: "작성자" }

    // ② Use Case 호출 (여기서 3️⃣번으로 이동!)
    const post = await createPostUseCase.execute(data);
```

**역할**:

- ✅ HTTP 요청 수신
- ✅ Zod 스키마로 입력값 검증
- ✅ Use Case 호출

**HTTP 요청 예시**:

```bash
POST http://localhost:3000/api/posts
Content-Type: application/json

{
  "title": "삼성전자 분석",
  "content": "주가가 상승하고 있습니다.",
  "author": "홍길동",
  "stockCode": "005930",
  "stockName": "삼성전자"
}
```

---

### 3️⃣ **create-post.use-case.ts - 비즈니스 로직**

**파일 위치**: `back/src/application/use-cases/create-post.use-case.ts`

```typescript
export class CreatePostUseCase {
  constructor(private postRepository: IPostRepository) {}

  async execute(data: CreatePostInput): Promise<Post> {
    // ① 제목 검증
    if (!data.title || data.title.trim().length === 0) {
      throw new Error("제목은 필수입니다.");
    }

    // ② 내용 검증
    if (!data.content || data.content.trim().length === 0) {
      throw new Error("내용은 필수입니다.");
    }

    // ③ 작성자 검증
    if (!data.author || data.author.trim().length === 0) {
      throw new Error("작성자는 필수입니다.");
    }

    // ④ 데이터 정제 (공백 제거)
    const sanitizedData: CreatePostInput = {
      title: data.title.trim(),
      content: data.content.trim(),
      author: data.author.trim(),
      stockCode: data.stockCode?.trim() || undefined,
      stockName: data.stockName?.trim() || undefined,
    };

    // ⑤ Repository 호출 (여기서 4️⃣번으로 이동!)
    return await this.postRepository.create(sanitizedData);
    //            ↑
    //    생성자로 받은 DrizzlePostRepository 인스턴스의 메서드 호출
  }
}
```

**역할**:

- ✅ 비즈니스 규칙 검증 (제목/내용/작성자 필수)
- ✅ 데이터 정제 (앞뒤 공백 제거)
- ✅ Repository에게 DB 작업 위임

**왜 Use Case가 필요한가?**

- 비즈니스 로직을 한 곳에 모음
- 라우트에서 비즈니스 로직 분리
- 테스트하기 쉬움 (Mock Repository 사용 가능)

---

### 4️⃣ **drizzle-post.repository.ts - DB 작업**

**파일 위치**: `back/src/infrastructure/repositories/drizzle-post.repository.ts`

```typescript
export class DrizzlePostRepository implements IPostRepository {
  constructor(private db: MySql2Database) {}

  async create(data: CreatePostInput): Promise<Post> {
    // ① INSERT 쿼리 실행
    const [result] = await db.insert(posts).values({
      title: data.title,
      content: data.content,
      author: data.author,
      stockCode: data.stockCode ?? null,
      stockName: data.stockName ?? null,
    });
    // 실제 SQL: INSERT INTO posts (title, content, ...) VALUES (...)

    // ② 생성된 ID 추출
    const insertId = Number(result.insertId);
    // insertId = 123 (예시)

    // ③ 생성된 게시글 다시 조회 (모든 필드 가져오기)
    const [newPost] = await db.select().from(posts).where(eq(posts.id, insertId)).limit(1);
    // 실제 SQL: SELECT * FROM posts WHERE id = 123 LIMIT 1

    // ④ 조회 실패 시 에러
    if (!newPost) {
      throw new Error("게시글 생성 후 조회 실패");
    }

    // ⑤ 도메인 엔티티로 변환 (null → undefined)
    return this.toDomain(newPost);
    // 반환: { id: 123, title: "삼성전자 분석", ..., createdAt: Date, updatedAt: Date }
  }

  // DB의 null을 도메인의 undefined로 변환
  private toDomain(dbPost: any): Post {
    return {
      ...dbPost,
      stockCode: dbPost.stockCode ?? undefined,
      stockName: dbPost.stockName ?? undefined,
    };
  }
}
```

**역할**:

- ✅ DB에 데이터 INSERT
- ✅ 생성된 데이터 조회 (createdAt, updatedAt 포함)
- ✅ Post 엔티티로 변환하여 반환

**왜 INSERT 후 다시 SELECT?**

- `createdAt`, `updatedAt`은 DB가 자동 생성
- 완전한 Post 객체를 반환하기 위해 다시 조회

---

### 5️⃣ **post.routes.ts - HTTP 응답 반환**

**파일 위치**: `back/src/presentation/routes/post.routes.ts`

```typescript
    // ③ Use Case에서 Post 받음 (3️⃣→4️⃣→3️⃣→여기!)
    const post = await createPostUseCase.execute(data);
    // post = { id: 123, title: "삼성전자 분석", ... }

    // ④ HTTP 201 응답 (성공)
    return c.json({ success: true, data: post }, 201);

  } catch (error) {
    // ⑤ 에러 시 400 응답
    return c.json({
      success: false,
      error: (error as Error).message
    }, 400);
  }
});
```

**역할**:

- ✅ Use Case로부터 결과 받기
- ✅ HTTP 201 Created 응답
- ✅ 에러 처리

**응답 예시**:

```json
// 성공 시 (201)
{
  "success": true,
  "data": {
    "id": 123,
    "title": "삼성전자 분석",
    "content": "주가가 상승하고 있습니다.",
    "author": "홍길동",
    "stockCode": "005930",
    "stockName": "삼성전자",
    "createdAt": "2025-01-19T10:00:00.000Z",
    "updatedAt": "2025-01-19T10:00:00.000Z"
  }
}

// 실패 시 (400)
{
  "success": false,
  "error": "제목은 필수입니다."
}
```

---

## 🎯 레이어별 책임

| 레이어             | 파일                                             | 책임                                     |
| ------------------ | ------------------------------------------------ | ---------------------------------------- |
| **Presentation**   | `post.routes.ts`                                 | HTTP 요청/응답, 스키마 검증, 의존성 주입 |
| **Application**    | `create-post.use-case.ts`                        | 비즈니스 로직, 데이터 검증/정제          |
| **Infrastructure** | `drizzle-post.repository.ts`                     | DB 접근, SQL 실행, 데이터 변환           |
| **Domain**         | `post.entity.ts`, `post.repository.interface.ts` | 엔티티 정의, 인터페이스 정의             |

---

## 🔗 의존성 방향 (Dependency Rule)

```
Presentation ──depends on──> Application ──depends on──> Domain
                                                            ▲
Infrastructure ──────────────implements───────────────────┘
```

**핵심 원칙**:

- ✅ 바깥 레이어는 안쪽 레이어에 의존 가능
- ❌ 안쪽 레이어는 바깥 레이어에 의존 불가
- ✅ Domain은 아무것도 의존하지 않음 (순수)
- ✅ Infrastructure는 Domain 인터페이스를 구현

---

## 🧩 핵심 개념: 의존성 역전 원칙 (DIP)

### ❌ 나쁜 예 (직접 의존)

```typescript
// Use Case가 Drizzle에 직접 의존
import { db } from "../../infrastructure/db/drizzle";

export class CreatePostUseCase {
  async execute(data: CreatePostInput) {
    // DB 코드가 Use Case에 섞임 😱
    const [result] = await db.insert(posts).values(data);
    // ...
  }
}
```

**문제점**:

- DB를 바꾸면 Use Case도 수정해야 함
- 테스트하기 어려움 (실제 DB 필요)
- 비즈니스 로직이 기술 세부사항에 오염됨

### ✅ 좋은 예 (인터페이스로 분리)

```typescript
// Use Case는 인터페이스에만 의존
export class CreatePostUseCase {
  constructor(private postRepository: IPostRepository) {}
  //                                ↑
  //                          인터페이스만 의존

  async execute(data: CreatePostInput) {
    // 비즈니스 로직만 집중
    const sanitizedData = { ... };
    return await this.postRepository.create(sanitizedData);
    //           ↑
    //    어떻게 저장하는지 몰라도 됨!
  }
}
```

**장점**:

- ✅ **DB 교체 쉬움**: Drizzle → Prisma로 바꿔도 Use Case는 변경 없음
- ✅ **테스트 쉬움**: Mock Repository로 테스트 가능
- ✅ **비즈니스 로직 보호**: Use Case는 순수하게 유지

---

## 🧪 테스트 예시 (Mock Repository)

```typescript
// create-post.use-case.test.ts

class MockPostRepository implements IPostRepository {
  async create(data: CreatePostInput): Promise<Post> {
    // 가짜 데이터 반환 (실제 DB 없이 테스트 가능!)
    return {
      id: 1,
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  // ... 다른 메서드 구현
}

describe("CreatePostUseCase", () => {
  it("게시글을 생성해야 함", async () => {
    const mockRepo = new MockPostRepository();
    const useCase = new CreatePostUseCase(mockRepo);

    const result = await useCase.execute({
      title: "테스트",
      content: "내용",
      author: "홍길동",
    });

    expect(result.id).toBe(1);
    expect(result.title).toBe("테스트");
  });

  it("제목이 없으면 에러를 던져야 함", async () => {
    const mockRepo = new MockPostRepository();
    const useCase = new CreatePostUseCase(mockRepo);

    await expect(useCase.execute({ title: "", content: "내용", author: "홍길동" })).rejects.toThrow(
      "제목은 필수입니다."
    );
  });
});
```

---

## 📊 전체 흐름 타임라인

```
[서버 시작]
00:00:00 - post.routes.ts (25-30줄)
           └─ const postRepository = new DrizzlePostRepository();
           └─ const createPostUseCase = new CreatePostUseCase(postRepository);

[HTTP 요청 처리]
00:00:01 - post.routes.ts (89줄) - POST /posts 수신
00:00:01 - post.routes.ts (91줄) - zValidator 검증
00:00:01 - post.routes.ts (92줄) - data 추출
00:00:01 - post.routes.ts (93줄) - createPostUseCase.execute(data)
00:00:01 - create-post.use-case.ts (18-30줄) - 검증 로직
00:00:01 - create-post.use-case.ts (32-38줄) - 데이터 정제
00:00:01 - create-post.use-case.ts (40줄) - this.postRepository.create()
00:00:02 - drizzle-post.repository.ts - DB INSERT
00:00:03 - drizzle-post.repository.ts - DB SELECT
00:00:03 - drizzle-post.repository.ts - Post 반환
00:00:03 - create-post.use-case.ts (40줄) - Post 반환
00:00:03 - post.routes.ts (93줄) - post 변수에 저장
00:00:03 - post.routes.ts (95줄) - HTTP 201 응답
```

---

## 💡 클린 아키텍처의 장점

### 1. **테스트 용이성**

- Use Case를 Mock Repository로 쉽게 테스트
- 실제 DB 없이도 비즈니스 로직 검증 가능

### 2. **유지보수성**

- 각 레이어의 책임이 명확
- 버그 발생 시 어느 레이어인지 쉽게 파악

### 3. **확장성**

- DB 교체 쉬움 (MySQL → PostgreSQL)
- 새로운 Use Case 추가 쉬움
- API 변경해도 비즈니스 로직 보호됨

### 4. **독립성**

- Domain은 프레임워크에 독립적
- 비즈니스 로직은 기술 세부사항과 분리

---

## 🔍 자주 묻는 질문

### Q1. Use Case 없이 Repository를 직접 호출하면 안 되나요?

**A**: 가능하지만 권장하지 않습니다.

```typescript
// ❌ 나쁜 예
router.post("/", async (c) => {
  const data = c.req.valid("json");
  // 비즈니스 로직이 라우터에 섞임
  if (!data.title.trim()) throw new Error("...");
  const post = await postRepository.create(data);
  return c.json(post);
});

// ✅ 좋은 예
router.post("/", async (c) => {
  const data = c.req.valid("json");
  // 비즈니스 로직은 Use Case에 위임
  const post = await createPostUseCase.execute(data);
  return c.json(post);
});
```

### Q2. 인터페이스가 꼭 필요한가요?

**A**: 네! 의존성 역전을 위해 필수입니다.

- Use Case는 구현체가 아닌 인터페이스에 의존
- DB를 바꿔도 Use Case는 수정 불필요
- 테스트 시 Mock 구현체 사용 가능

### Q3. INSERT 후 왜 다시 SELECT 하나요?

**A**: DB가 자동 생성하는 값을 받기 위해서입니다.

- `id` (AUTO_INCREMENT)
- `createdAt` (DEFAULT NOW())
- `updatedAt` (DEFAULT NOW())

완전한 Post 엔티티를 반환하려면 다시 조회가 필요합니다.

---

## 📚 참고 자료

- [Clean Architecture by Robert C. Martin](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Dependency Inversion Principle](https://en.wikipedia.org/wiki/Dependency_inversion_principle)
- [Hexagonal Architecture](https://alistair.cockburn.us/hexagonal-architecture/)

---

## 🎓 다음 단계

1. **다른 Use Case 분석**

   - `get-posts-page.use-case.ts` (페이지네이션)
   - `update-post.use-case.ts` (게시글 수정)
   - `delete-post.use-case.ts` (게시글 삭제)

2. **테스트 작성**

   - Use Case 단위 테스트
   - Repository 통합 테스트
   - E2E 테스트

3. **확장 고려**
   - 좋아요 기능 추가
   - 댓글 기능 추가
   - 이미지 업로드 기능

---

**작성일**: 2025년 1월 19일  
**버전**: 1.0.0  
**프로젝트**: Clean-Architecture Stock Discussion Board
