# 🏗️ 클린 아키텍처 & DDD 초보자 가이드

> 이 프로젝트를 통해 클린 아키텍처와 도메인 주도 설계(DDD)를 이해해봅시다!

## 📚 목차

1. [클린 아키텍처란?](#클린-아키텍처란)
2. [DDD란?](#ddd란)
3. [프로젝트 구조 설명](#프로젝트-구조-설명)
4. [코드 흐름 이해하기](#코드-흐름-이해하기)
5. [실제 예제로 따라가기](#실제-예제로-따라가기)

---

## 🎯 클린 아키텍처란?

### 쉽게 설명하면?

**"코드를 양파처럼 여러 층으로 나누는 설계 방법"**

- 🧅 **양파의 중심**: 비즈니스 로직 (가장 중요한 핵심)
- 🧅 **양파의 바깥층**: 데이터베이스, API, UI 등 (바뀔 수 있는 것들)

### 왜 이렇게 할까?

```
❌ 나쁜 예: 모든 것이 섞여있는 코드
├── API 코드에 데이터베이스 쿼리가 직접...
├── 비즈니스 로직에 HTTP 요청 처리가...
└── 테스트하기 어렵고, 수정하면 다 망가짐 💥

✅ 좋은 예: 층으로 분리된 코드
├── 각 층은 자기 역할만 수행
├── 데이터베이스를 MySQL에서 PostgreSQL로 바꿔도 비즈니스 로직은 그대로!
└── 테스트하기 쉽고, 유지보수가 편함 ✨
```

### 핵심 원칙: 의존성 규칙

```
┌─────────────────────────────────────┐
│   Presentation (API, UI)            │  ← 바깥층
│   ┌───────────────────────────┐     │
│   │   Application (UseCase)   │     │  ← 중간층
│   │   ┌─────────────────┐     │     │
│   │   │     Domain      │     │     │  ← 핵심층 (비즈니스)
│   │   │   (Entities)    │     │     │
│   │   └─────────────────┘     │     │
│   └───────────────────────────┘     │
└─────────────────────────────────────┘
      Infrastructure (DB, 외부 API)   ← 가장 바깥층

화살표 방향: 바깥 → 안 (안쪽은 바깥을 모름!)
```

**의존성 규칙**: 안쪽 층은 바깥쪽 층을 몰라야 합니다!

- ✅ `UseCase`가 `Entity`를 사용: OK
- ❌ `Entity`가 `Database`를 직접 사용: NO!

---

## 🎨 DDD란?

### Domain-Driven Design (도메인 주도 설계)

**"비즈니스(도메인)를 중심으로 코드를 설계하는 방법"**

### 핵심 개념

#### 1️⃣ **Entity (엔티티)**

"실제 세계의 개념을 코드로 표현한 것"

```typescript
// 예: 게시글(Post)이라는 개념
interface Post {
  id: number; // 고유 식별자
  title: string; // 제목
  content: string; // 내용
  author: string; // 작성자
}
```

**특징**:

- 고유 ID가 있음 (같은 내용이어도 ID가 다르면 다른 객체)
- 비즈니스의 핵심 개념
- 데이터베이스나 프레임워크에 의존하지 않음

#### 2️⃣ **Repository (저장소)**

"엔티티를 저장하고 불러오는 방법"

```typescript
// "어떻게" 저장할지는 몰라도 돼요!
// "무엇을" 할 수 있는지만 정의
interface IPostRepository {
  findAll(): Promise<Post[]>; // 모든 게시글 가져오기
  findById(id: number): Promise<Post | null>; // ID로 찾기
  create(data: CreatePostInput): Promise<Post>; // 생성
  update(id: number, data: UpdatePostInput): Promise<Post | null>; // 수정
  delete(id: number): Promise<boolean>; // 삭제
}
```

**핵심**: 인터페이스(계약)만 정의하고, 실제 구현은 나중에!

#### 3️⃣ **Use Case (유스케이스)**

"사용자가 하고 싶은 일"

```typescript
// 예: "게시글을 작성하고 싶어요!"
class CreatePostUseCase {
  async execute(data: CreatePostInput): Promise<Post> {
    // 1. 입력값 검증
    if (!data.title) throw new Error("제목은 필수!");

    // 2. 비즈니스 규칙 적용
    const sanitizedData = { ...data, title: data.title.trim() };

    // 3. 저장
    return await this.repository.create(sanitizedData);
  }
}
```

---

## 📁 프로젝트 구조 설명

우리 프로젝트는 이렇게 구성되어 있습니다:

```
backend/src/
├── domain/                    🧠 핵심 비즈니스 로직 (가장 안쪽)
│   ├── entities/
│   │   └── post.entity.ts     "게시글이 무엇인지" 정의
│   └── repositories/
│       └── post.repository.interface.ts  "저장소가 할 수 있는 일" 정의
│
├── application/               💼 업무 로직 (중간층)
│   └── use-cases/
│       ├── create-post.use-case.ts      "게시글 작성" 업무
│       ├── get-all-posts.use-case.ts    "게시글 목록 보기" 업무
│       ├── get-post-by-id.use-case.ts   "게시글 상세 보기" 업무
│       ├── update-post.use-case.ts      "게시글 수정" 업무
│       └── delete-post.use-case.ts      "게시글 삭제" 업무
│
├── infrastructure/            🔧 기술적 구현 (바깥층)
│   ├── db/
│   │   ├── drizzle.ts         데이터베이스 연결
│   │   └── schema.ts          데이터베이스 테이블 정의
│   └── repositories/
│       └── drizzle-post.repository.ts  "실제로 DB에 저장하는 방법"
│
└── presentation/              🌐 사용자 인터페이스 (가장 바깥층)
    ├── routes/
    │   └── post.routes.ts     API 엔드포인트 (GET, POST, PUT, DELETE)
    └── schemas/
        └── post.schema.ts     입력 검증 스키마
```

### 각 층의 역할

| 층                 | 폴더              | 역할               | 예시                                         |
| ------------------ | ----------------- | ------------------ | -------------------------------------------- |
| **Domain**         | `domain/`         | 비즈니스 개념 정의 | "게시글은 제목, 내용, 작성자가 있어요"       |
| **Application**    | `application/`    | 업무 흐름 정의     | "게시글 작성할 때 제목이 비어있으면 안 돼요" |
| **Infrastructure** | `infrastructure/` | 기술적 구현        | "MySQL 데이터베이스에 INSERT 쿼리 실행"      |
| **Presentation**   | `presentation/`   | 사용자 접점        | "POST /posts API 요청을 받아요"              |

---

## 🔄 코드 흐름 이해하기

### 시나리오: "새 게시글 작성하기"

사용자가 게시글을 작성할 때 코드는 이런 순서로 동작합니다:

```
👤 사용자
  ↓
  "게시글을 작성하고 싶어요!"
  POST /posts { title: "안녕하세요", content: "첫 게시글입니다" }
  ↓

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1️⃣ PRESENTATION LAYER (프레젠테이션 층)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📍 post.routes.ts (라우터)
  ↓
  ✅ "요청 받았어요!"
  ✅ "입력값이 올바른지 검증할게요" (Zod 스키마로 검증)
  ↓

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
2️⃣ APPLICATION LAYER (애플리케이션 층)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📍 create-post.use-case.ts (유스케이스)
  ↓
  ✅ "비즈니스 규칙 체크할게요!"
     - 제목이 비어있나요? → ❌ 에러!
     - 내용이 비어있나요? → ❌ 에러!
     - 작성자가 비어있나요? → ❌ 에러!
  ✅ "데이터 정제할게요!" (공백 제거 등)
  ↓
  "Repository야, 이거 저장해줘!"
  ↓

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
3️⃣ INFRASTRUCTURE LAYER (인프라 층)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📍 drizzle-post.repository.ts (저장소 구현체)
  ↓
  ✅ "데이터베이스에 INSERT 쿼리 실행!"
  ✅ "생성된 게시글 다시 조회!"
  ↓

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
4️⃣ DATABASE (데이터베이스)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💾 MySQL/MariaDB
  ↓
  ✅ "저장 완료!"
  ↓

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
역순으로 돌아가기
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Repository → UseCase → Router → 사용자
  ↓
👤 사용자
  "게시글이 작성되었습니다!"
  { success: true, data: { id: 1, title: "안녕하세요", ... } }
```

### 층 간 통신 규칙

```typescript
// ❌ 이렇게 하면 안 돼요! (층을 건너뛰기)
Router → Database (직접 접근)

// ✅ 이렇게 해야 해요! (순서대로)
Router → UseCase → Repository → Database
```

---

## 🎮 실제 예제로 따라가기

### 예제 1: 게시글 작성 (CREATE)

#### Step 1: 사용자 요청

```http
POST http://localhost:3000/posts
Content-Type: application/json

{
  "title": "삼성전자 분석",
  "content": "주가가 상승할 것 같습니다",
  "author": "홍길동",
  "stockCode": "005930",
  "stockName": "삼성전자"
}
```

#### Step 2: Router (presentation/routes/post.routes.ts)

```typescript
// API 요청을 받아요
postRouter.post("/", zValidator("json", createPostSchema), async (c) => {
  const data = c.req.valid("json"); // 검증된 데이터

  // UseCase에게 일을 시켜요
  const post = await createPostUseCase.execute(data);

  return c.json({ success: true, data: post }, 201);
});
```

**역할**:

- HTTP 요청 받기
- 입력값 검증 (Zod 스키마)
- UseCase 호출
- HTTP 응답 반환

#### Step 3: UseCase (application/use-cases/create-post.use-case.ts)

```typescript
class CreatePostUseCase {
  async execute(data: CreatePostInput): Promise<Post> {
    // 🔍 비즈니스 규칙 검증
    if (!data.title || data.title.trim().length === 0) {
      throw new Error("제목은 필수입니다.");
    }

    if (!data.content || data.content.trim().length === 0) {
      throw new Error("내용은 필수입니다.");
    }

    if (!data.author || data.author.trim().length === 0) {
      throw new Error("작성자는 필수입니다.");
    }

    // 🧹 데이터 정제
    const sanitizedData: CreatePostInput = {
      title: data.title.trim(),
      content: data.content.trim(),
      author: data.author.trim(),
      stockCode: data.stockCode?.trim() || undefined,
      stockName: data.stockName?.trim() || undefined,
    };

    // 💾 Repository에게 저장 요청
    return await this.postRepository.create(sanitizedData);
  }
}
```

**역할**:

- 비즈니스 규칙 검증 (제목/내용/작성자 필수)
- 데이터 정제 (공백 제거)
- Repository 호출

#### Step 4: Repository (infrastructure/repositories/drizzle-post.repository.ts)

```typescript
class DrizzlePostRepository implements IPostRepository {
  async create(data: CreatePostInput): Promise<Post> {
    // 🗄️ 데이터베이스에 INSERT
    const result = await db.insert(posts).values({
      title: data.title,
      content: data.content,
      author: data.author,
      stockCode: data.stockCode,
      stockName: data.stockName,
    });

    // 생성된 ID로 다시 조회
    const insertId = Number(result[0].insertId);
    const created = await this.findById(insertId);

    if (!created) {
      throw new Error("게시글 생성 후 조회 실패");
    }

    return created;
  }
}
```

**역할**:

- 실제 데이터베이스 쿼리 실행
- DB 결과를 도메인 엔티티로 변환

#### Step 5: 결과 반환

```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "삼성전자 분석",
    "content": "주가가 상승할 것 같습니다",
    "author": "홍길동",
    "stockCode": "005930",
    "stockName": "삼성전자",
    "createdAt": "2025-10-17T10:30:00.000Z",
    "updatedAt": "2025-10-17T10:30:00.000Z"
  }
}
```

---

### 예제 2: 게시글 목록 조회 (READ)

#### 전체 흐름 한눈에 보기

```
GET /posts
    ↓
┌─────────────────────────────────────┐
│ 1️⃣ Router (post.routes.ts)         │
│  "게시글 목록 요청 받았어요!"         │
└─────────────────────────────────────┘
    ↓
┌─────────────────────────────────────┐
│ 2️⃣ UseCase (get-all-posts.use-case)│
│  "Repository야, 모든 게시글 줘!"     │
└─────────────────────────────────────┘
    ↓
┌─────────────────────────────────────┐
│ 3️⃣ Repository (drizzle-post)        │
│  SELECT * FROM posts                │
│  ORDER BY createdAt DESC            │
└─────────────────────────────────────┘
    ↓
┌─────────────────────────────────────┐
│ 4️⃣ Database                         │
│  💾 [게시글1, 게시글2, 게시글3...]   │
└─────────────────────────────────────┘
    ↓
    결과를 역순으로 반환
    ↓
👤 사용자에게 JSON 응답
```

#### 코드로 보기

```typescript
// 1️⃣ Router
postRouter.get("/", async (c) => {
  const posts = await getAllPostsUseCase.execute();
  return c.json({ success: true, data: posts });
});

// 2️⃣ UseCase
class GetAllPostsUseCase {
  async execute(): Promise<Post[]> {
    return await this.postRepository.findAll();
  }
}

// 3️⃣ Repository
class DrizzlePostRepository {
  async findAll(): Promise<Post[]> {
    const result = await db.select().from(posts).orderBy(desc(posts.createdAt)); // 최신순 정렬

    return result.map(this.toDomain);
  }
}
```

---

### 예제 3: 게시글 수정 (UPDATE)

#### 흐름

```
PUT /posts/1
    ↓
    "ID가 1인 게시글의 제목을 바꾸고 싶어요!"
    ↓
┌──────────────────────────────────────────────┐
│ Router: ID 검증 → UseCase 호출                │
├──────────────────────────────────────────────┤
│ UseCase: 비즈니스 규칙 체크                    │
│  - 수정할 내용이 있나요?                       │
│  - 공백 제거                                  │
├──────────────────────────────────────────────┤
│ Repository:                                  │
│  1. 게시글 존재 확인                          │
│  2. UPDATE 쿼리 실행                         │
│  3. 수정된 게시글 다시 조회                   │
└──────────────────────────────────────────────┘
    ↓
    수정된 게시글 반환
```

#### 코드

```typescript
// UseCase
class UpdatePostUseCase {
  async execute(id: number, data: UpdatePostInput): Promise<Post | null> {
    // 수정할 내용이 있는지 확인
    if (Object.keys(data).length === 0) {
      throw new Error("수정할 내용이 없습니다.");
    }

    // 데이터 정제
    const sanitizedData: UpdatePostInput = {};
    if (data.title !== undefined) {
      sanitizedData.title = data.title.trim();
    }
    // ... 다른 필드들도 정제

    return await this.postRepository.update(id, sanitizedData);
  }
}

// Repository
async update(id: number, data: UpdatePostInput): Promise<Post | null> {
  // 1. 존재 확인
  const existing = await this.findById(id);
  if (!existing) return null;

  // 2. 수정
  await db.update(posts).set(data).where(eq(posts.id, id));

  // 3. 수정된 내용 반환
  return await this.findById(id);
}
```

---

## 💡 왜 이렇게 복잡하게 나눌까요?

### 간단한 코드 vs 클린 아키텍처

#### ❌ 간단하게 한 파일에 다 쓰면 안 될까요?

```typescript
// 모든 것이 섞인 나쁜 예
app.post("/posts", async (req, res) => {
  // HTTP, 검증, 비즈니스 로직, DB 쿼리가 모두 섞여있음
  const { title, content } = req.body;

  if (!title) return res.status(400).json({ error: "제목 필수" });

  const result = await db.query("INSERT INTO posts (title, content) VALUES (?, ?)", [title, content]);

  res.json({ id: result.insertId });
});
```

**문제점**:

- 🔴 테스트하기 어려움 (HTTP 서버를 띄워야 테스트 가능)
- 🔴 데이터베이스를 바꾸면? 모든 코드 수정
- 🔴 비즈니스 규칙이 어디있는지 찾기 어려움
- 🔴 재사용 불가능 (CLI에서 쓰고 싶어도 못 씀)

#### ✅ 클린 아키텍처로 나누면?

```typescript
// 각자의 역할이 명확
Router → UseCase → Repository → Database
```

**장점**:

- ✅ 각 부분을 독립적으로 테스트 가능
- ✅ 데이터베이스를 바꿔도 Repository만 수정
- ✅ 비즈니스 로직이 UseCase에 명확히 정리됨
- ✅ CLI, API, 웹 모두에서 같은 UseCase 재사용 가능

---

## 🔑 핵심 개념 정리

### 1. 의존성 역전 원칙 (Dependency Inversion)

```typescript
// ❌ 나쁜 예: 직접 의존
class CreatePostUseCase {
  private repository = new MySQLPostRepository(); // MySQL에 직접 의존!
}

// ✅ 좋은 예: 인터페이스 의존
class CreatePostUseCase {
  constructor(private repository: IPostRepository) {} // 인터페이스에 의존
}

// 사용할 때 주입
const repository = new DrizzlePostRepository(); // 또는 MongoPostRepository
const useCase = new CreatePostUseCase(repository);
```

**장점**: DB를 바꿔도 UseCase 코드는 안 바뀜!

### 2. 관심사의 분리 (Separation of Concerns)

| 관심사           | 담당 층        | 예시                      |
| ---------------- | -------------- | ------------------------- |
| 사용자 입력 검증 | Presentation   | "JSON이 올바른 형식인가?" |
| 비즈니스 규칙    | Application    | "제목은 필수입니다"       |
| 데이터 저장      | Infrastructure | "MySQL INSERT 쿼리"       |
| 비즈니스 개념    | Domain         | "게시글은 무엇인가?"      |

### 3. 단일 책임 원칙 (Single Responsibility)

```typescript
// ✅ 각 클래스는 하나의 책임만
class CreatePostUseCase {
  // 책임: "게시글 생성" 비즈니스 로직만
}

class DrizzlePostRepository {
  // 책임: "Drizzle ORM을 사용한 데이터 접근"만
}

class PostRouter {
  // 책임: "HTTP 요청/응답 처리"만
}
```

---

## 📊 전체 구조 다이어그램

```
┌─────────────────────────────────────────────────────────────────┐
│                      👤 사용자 (브라우저/앱)                       │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ↓ HTTP 요청
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃                   🌐 PRESENTATION LAYER                        ┃
┃  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        ┃
┃  │   Router     │  │   Schema     │  │  Validator   │        ┃
┃  │ post.routes  │→ │ post.schema  │→ │   (Zod)      │        ┃
┃  └──────────────┘  └──────────────┘  └──────────────┘        ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
                              │
                              ↓ 검증된 데이터
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃                   💼 APPLICATION LAYER                         ┃
┃  ┌────────────────────────────────────────────────────┐       ┃
┃  │              Use Cases (업무 로직)                  │       ┃
┃  │  ┌──────────┐ ┌──────────┐ ┌──────────┐           │       ┃
┃  │  │ Create   │ │ GetAll   │ │ Update   │  ...      │       ┃
┃  │  │ Post     │ │ Posts    │ │ Post     │           │       ┃
┃  │  └──────────┘ └──────────┘ └──────────┘           │       ┃
┃  └────────────────────────────────────────────────────┘       ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
                              │
                              ↓ Repository 인터페이스 호출
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃                      🧠 DOMAIN LAYER                           ┃
┃  ┌──────────────┐           ┌──────────────────────┐          ┃
┃  │   Entities   │           │    Repository        │          ┃
┃  │              │           │    Interface         │          ┃
┃  │ Post         │    ←──────│ IPostRepository      │          ┃
┃  │ (비즈니스    │           │ (계약 정의)           │          ┃
┃  │  개념 정의)   │           │                      │          ┃
┃  └──────────────┘           └──────────────────────┘          ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
                              ↑
                              │ 인터페이스 구현
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃                   🔧 INFRASTRUCTURE LAYER                      ┃
┃  ┌──────────────────────────────────────────────────┐         ┃
┃  │         Repository 구현체                         │         ┃
┃  │  DrizzlePostRepository                           │         ┃
┃  │  (IPostRepository 인터페이스를 구현)               │         ┃
┃  └──────────────────────────────────────────────────┘         ┃
┃                       │                                        ┃
┃                       ↓ ORM 사용                               ┃
┃  ┌──────────────┐  ┌──────────────┐                          ┃
┃  │   Drizzle    │  │   Schema     │                          ┃
┃  │   (ORM)      │  │  (테이블)     │                          ┃
┃  └──────────────┘  └──────────────┘                          ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
                              │
                              ↓ SQL 쿼리
┌─────────────────────────────────────────────────────────────────┐
│                    💾 DATABASE (MySQL/MariaDB)                  │
│              posts 테이블 (id, title, content, ...)            │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🎓 학습 팁

### 1. 코드 읽는 순서 추천

처음 보는 분들은 이 순서로 읽어보세요:

1. **`domain/entities/post.entity.ts`**
   → "게시글이 뭔지" 이해

2. **`domain/repositories/post.repository.interface.ts`**
   → "게시글로 뭘 할 수 있는지" 이해

3. **`application/use-cases/create-post.use-case.ts`**
   → "게시글을 어떻게 작성하는지" 이해

4. **`infrastructure/repositories/drizzle-post.repository.ts`**
   → "실제로 어떻게 저장하는지" 이해

5. **`presentation/routes/post.routes.ts`**
   → "API로 어떻게 호출하는지" 이해

### 2. 직접 해보기

1. **새로운 기능 추가해보기**:

   ```
   예: "게시글 좋아요 기능"
   1. domain/entities에 likes 필드 추가
   2. repository interface에 incrementLikes 메서드 추가
   3. use-case에 LikePostUseCase 생성
   4. infrastructure에서 구현
   5. presentation에서 API 추가
   ```

2. **데이터베이스 바꿔보기**:
   ```
   Drizzle → Prisma 또는 TypeORM으로 바꿔도
   Domain, Application 층은 전혀 수정 안 해도 됨!
   Infrastructure만 바꾸면 끝!
   ```

### 3. 테스트 작성해보기

```typescript
// UseCase는 독립적으로 테스트 가능!
describe("CreatePostUseCase", () => {
  it("제목이 없으면 에러", async () => {
    const mockRepository = {
      /* mock */
    };
    const useCase = new CreatePostUseCase(mockRepository);

    await expect(useCase.execute({ title: "", content: "test", author: "test" })).rejects.toThrow("제목은 필수입니다");
  });
});
```

---

## ❓ 자주 묻는 질문 (FAQ)

### Q1: 왜 이렇게 파일이 많아요? 복잡해요!

**A**: 처음엔 복잡해 보이지만, 프로젝트가 커질수록 빛을 발합니다!

```
작은 프로젝트 (파일 10개):
- 간단한 방식: 👍 빠르고 쉬움
- 클린 아키텍처: 😐 좀 복잡함

큰 프로젝트 (파일 1000개):
- 간단한 방식: 💀 스파게티 코드, 유지보수 지옥
- 클린 아키텍처: ✨ 깔끔하게 정리됨, 찾기 쉬움
```

### Q2: 모든 프로젝트에 클린 아키텍처를 써야 하나요?

**A**: 아니요! 프로젝트 규모에 따라 선택하세요.

- ✅ **적합한 경우**:

  - 팀 프로젝트
  - 장기 유지보수가 필요한 프로젝트
  - 비즈니스 로직이 복잡한 경우
  - 여러 인터페이스(API, CLI, 웹)가 필요한 경우

- ❌ **과한 경우**:
  - 간단한 개인 프로젝트
  - 프로토타입
  - 일회성 스크립트

### Q3: UseCase가 Repository만 호출하는데 왜 필요한가요?

**A**: 지금은 단순해 보여도, 나중에 복잡해질 수 있어요!

```typescript
// 지금은 단순
class GetAllPostsUseCase {
  async execute(): Promise<Post[]> {
    return await this.repository.findAll();
  }
}

// 나중에 요구사항 추가
class GetAllPostsUseCase {
  async execute(userId?: number): Promise<Post[]> {
    const posts = await this.repository.findAll();

    // 비즈니스 로직 추가
    // - 사용자별 권한 체크
    // - 필터링
    // - 정렬
    // - 캐싱
    // - 로깅

    return posts;
  }
}
```

### Q4: Interface와 구현체를 따로 두는 이유는?

**A**: 유연성과 테스트 용이성!

```typescript
// Production 환경
const repository = new DrizzlePostRepository(); // 진짜 DB

// Test 환경
const repository = new MockPostRepository(); // 가짜 DB

// CLI 환경
const repository = new FilePostRepository(); // 파일에 저장

// 같은 UseCase 재사용!
const useCase = new CreatePostUseCase(repository);
```

---

## 🚀 다음 단계

이제 클린 아키텍처와 DDD의 기본을 이해했다면:

1. **코드 직접 수정해보기**

   - 새로운 필드 추가
   - 새로운 UseCase 만들기
   - 검증 규칙 추가하기

2. **테스트 작성해보기**

   - UseCase 단위 테스트
   - Repository Mock 테스트

3. **다른 기능 추가해보기**

   - 댓글 기능
   - 좋아요 기능
   - 검색 기능

4. **심화 학습**
   - CQRS 패턴
   - Event Sourcing
   - Hexagonal Architecture

---

## 📚 참고 자료

- **클린 아키텍처**: Robert C. Martin의 "Clean Architecture" 책
- **DDD**: Eric Evans의 "Domain-Driven Design" 책
- **실전 예제**: 이 프로젝트 코드를 직접 읽어보세요!

---

## 🎉 마무리

축하합니다! 이제 여러분은:

✅ 클린 아키텍처가 무엇인지 알게 되었습니다  
✅ DDD의 핵심 개념(Entity, Repository, UseCase)을 이해했습니다  
✅ 코드가 어떻게 흐르는지 알게 되었습니다  
✅ 왜 이렇게 설계하는지 이유를 알게 되었습니다

**핵심 기억할 것**:

1. **Domain(비즈니스)이 중심**
2. **바깥층은 안쪽층에 의존** (역은 안 됨)
3. **각 층은 자기 책임만**
4. **Interface로 유연성 확보**

처음엔 복잡해 보이지만, 코드를 읽고 수정하다 보면 자연스럽게 이해가 될 거예요! 💪

Happy Coding! 🚀
