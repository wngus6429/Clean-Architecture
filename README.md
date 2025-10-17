# 📈 주식 게시판 (Stock Board)

DDD(도메인 주도 개발) + 클린 아키텍처로 구현한 학습용 주식 게시판 프로젝트

## 🎯 프로젝트 개요

- **목적**: DDD와 클린 아키텍처 학습을 위한 간단한 CRUD 게시판
- **백엔드**: Hono + Drizzle ORM + MySQL
- **프론트엔드**: React + TanStack Query + Tailwind CSS

## 📂 프로젝트 구조

```
주식거래/
├── backend/              # 백엔드 (Node.js + TypeScript)
│   ├── src/
│   │   ├── domain/          # 도메인 계층 (비즈니스 로직의 핵심)
│   │   │   ├── entities/    # 엔티티 (Post)
│   │   │   └── repositories/ # Repository 인터페이스
│   │   │
│   │   ├── application/     # 애플리케이션 계층 (유스케이스)
│   │   │   └── use-cases/   # 비즈니스 로직 실행
│   │   │
│   │   ├── infrastructure/  # 인프라 계층 (외부 의존성)
│   │   │   ├── db/          # DB 연결 & 스키마
│   │   │   └── repositories/ # Repository 구현체
│   │   │
│   │   ├── presentation/    # 프레젠테이션 계층 (API)
│   │   │   ├── routes/      # Hono 라우터
│   │   │   └── schemas/     # Zod 검증 스키마
│   │   │
│   │   ├── db.ts           # MySQL 커넥션 풀
│   │   ├── server.ts       # 서버 진입점
│   │   └── scripts/        # 유틸리티 스크립트
│   │
│   ├── drizzle.config.ts   # Drizzle 설정
│   ├── package.json
│   └── .env                # 환경 변수
│
└── frontend/             # 프론트엔드 (React + Vite)
    ├── src/
    │   ├── api/          # API 클라이언트
    │   ├── pages/        # 페이지 컴포넌트
    │   ├── types/        # TypeScript 타입
    │   ├── App.tsx       # 메인 앱 + 라우팅
    │   └── main.tsx      # 엔트리 포인트
    │
    ├── package.json
    └── vite.config.ts
```

## 🏗️ 아키텍처 설명

### 클린 아키텍처 계층

```
┌─────────────────────────────────────┐
│   Presentation (API Routes)         │  ← 사용자 인터페이스
├─────────────────────────────────────┤
│   Application (Use Cases)           │  ← 비즈니스 로직 실행
├─────────────────────────────────────┤
│   Domain (Entities, Interfaces)     │  ← 핵심 비즈니스 규칙
├─────────────────────────────────────┤
│   Infrastructure (DB, Repositories) │  ← 외부 시스템 연결
└─────────────────────────────────────┘
```

### 의존성 방향

- **외부 → 내부**: Infrastructure → Application → Domain
- **핵심 원칙**: Domain은 어떤 계층도 의존하지 않음 (순수 비즈니스 로직)

## 🚀 실행 방법

### 1️⃣ 사전 준비

- Node.js 18 이상
- MySQL 8.0 이상
- npm 또는 yarn

### 2️⃣ 백엔드 설정

```bash
# 1. 백엔드 폴더로 이동
cd backend

# 2. 의존성 설치
npm install

# 3. 환경 변수 설정 (.env 파일 수정)
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=stock

# 4. 데이터베이스 생성 및 테이블 마이그레이션
npm run db:init    # DB 생성
npm run db:push    # 테이블 생성

# 5. 서버 실행
npm run dev        # 개발 모드 (핫 리로드)
# 또는
npm run start      # 프로덕션 모드
```

백엔드는 `http://localhost:3000`에서 실행됩니다.

### 3️⃣ 프론트엔드 설정

```bash
# 1. 프론트엔드 폴더로 이동
cd frontend

# 2. 의존성 설치
npm install

# 3. 개발 서버 실행
npm run dev
```

프론트엔드는 `http://localhost:5173`에서 실행됩니다.

## 📡 API 엔드포인트

### 게시글 API (`/api/posts`)

| 메서드 | 경로             | 설명             |
| ------ | ---------------- | ---------------- |
| GET    | `/api/posts`     | 모든 게시글 조회 |
| GET    | `/api/posts/:id` | 특정 게시글 조회 |
| POST   | `/api/posts`     | 새 게시글 생성   |
| PUT    | `/api/posts/:id` | 게시글 수정      |
| DELETE | `/api/posts/:id` | 게시글 삭제      |

### 요청/응답 예시

#### 게시글 생성 (POST `/api/posts`)

**요청 본문:**

```json
{
  "title": "삼성전자 실적 분석",
  "content": "이번 분기 실적이 예상보다 좋습니다...",
  "author": "홍길동",
  "stockCode": "005930",
  "stockName": "삼성전자"
}
```

**응답:**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "삼성전자 실적 분석",
    "content": "이번 분기 실적이 예상보다 좋습니다...",
    "author": "홍길동",
    "stockCode": "005930",
    "stockName": "삼성전자",
    "createdAt": "2025-10-17T14:30:00.000Z",
    "updatedAt": "2025-10-17T14:30:00.000Z"
  }
}
```

## 💾 데이터베이스 스키마

### posts 테이블

| 컬럼       | 타입                     | 설명             |
| ---------- | ------------------------ | ---------------- |
| id         | INT (PK, AUTO_INCREMENT) | 게시글 ID        |
| title      | VARCHAR(200)             | 제목             |
| content    | TEXT                     | 내용             |
| author     | VARCHAR(100)             | 작성자           |
| stock_code | VARCHAR(20)              | 종목 코드 (선택) |
| stock_name | VARCHAR(100)             | 종목명 (선택)    |
| created_at | TIMESTAMP                | 생성일시         |
| updated_at | TIMESTAMP                | 수정일시         |

## 🎨 주요 기능

### 게시판 기능

- ✅ 게시글 목록 보기 (최신순 정렬)
- ✅ 게시글 상세 보기
- ✅ 게시글 작성
- ✅ 게시글 수정
- ✅ 게시글 삭제

### 주식 정보

- 종목 코드와 종목명을 선택적으로 입력 가능
- 게시글 목록에 종목 태그 표시

## 📚 학습 포인트

### 1. DDD (Domain-Driven Design)

- **엔티티**: 게시글(Post)을 도메인 객체로 정의
- **Repository 패턴**: 데이터 접근 추상화
- **유스케이스**: 비즈니스 로직을 독립적으로 관리

### 2. 클린 아키텍처

- **계층 분리**: Domain, Application, Infrastructure, Presentation
- **의존성 역전**: 고수준 모듈이 저수준 모듈에 의존하지 않음
- **테스트 용이성**: 각 계층을 독립적으로 테스트 가능

### 3. 사용 기술

**백엔드:**

- Hono: 경량 고성능 웹 프레임워크
- Drizzle ORM: 타입 안전한 SQL 쿼리 빌더
- Zod: 런타임 타입 검증
- MySQL2: MySQL 드라이버

**프론트엔드:**

- React 19: 최신 React
- TanStack Query: 서버 상태 관리
- Tailwind CSS: 유틸리티 CSS 프레임워크

## 🔧 유용한 명령어

### 백엔드

```bash
npm run dev          # 개발 서버 (핫 리로드)
npm run start        # 프로덕션 서버
npm run db:init      # DB 생성
npm run db:push      # 스키마 동기화
npm run db:studio    # Drizzle Studio (DB GUI)
npm run db:test      # DB 연결 테스트
```

### 프론트엔드

```bash
npm run dev          # 개발 서버
npm run build        # 프로덕션 빌드
npm run preview      # 빌드 결과 미리보기
npm run lint         # ESLint 검사
```

## 🐛 트러블슈팅

### MySQL 연결 오류

```
Error: ER_ACCESS_DENIED_ERROR
```

→ `.env` 파일의 DB 접속 정보 확인

### CORS 오류

```
Access to fetch at 'http://localhost:3000' has been blocked
```

→ 백엔드 `server.ts`의 CORS 설정 확인 (포트 5173 허용 여부)

### 테이블이 없음

```
Error: Table 'stock.posts' doesn't exist
```

→ `npm run db:push` 실행하여 테이블 생성

## 📖 더 공부하기

- [클린 아키텍처 (Robert C. Martin)](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [DDD (Eric Evans)](https://www.domainlanguage.com/ddd/)
- [Hono 문서](https://hono.dev/)
- [Drizzle ORM 문서](https://orm.drizzle.team/)
- [TanStack Query 문서](https://tanstack.com/query/latest)

## 📝 라이선스

MIT License - 학습 목적으로 자유롭게 사용하세요!
