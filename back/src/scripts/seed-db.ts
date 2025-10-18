// ===== 더미 데이터 시드 스크립트 =====
// posts 테이블에 대략 50건의 랜덤 게시글을 삽입합니다.

import "dotenv/config";
import { db } from "../infrastructure/db/drizzle";
import { posts } from "../infrastructure/db/schema";

type SeedOptions = {
  count: number;
};

const STOCKS: Array<{ code: string; name: string }> = [
  { code: "005930", name: "삼성전자" },
  { code: "000660", name: "SK하이닉스" },
  { code: "035420", name: "NAVER" },
  { code: "035720", name: "카카오" },
  { code: "051910", name: "LG화학" },
  { code: "068270", name: "셀트리온" },
  { code: "105560", name: "KB금융" },
  { code: "055550", name: "신한지주" },
  { code: "066570", name: "LG전자" },
  { code: "028260", name: "삼성물산" },
];

const AUTHORS = [
  "알파투자자",
  "베타트레이더",
  "감자농부",
  "퀀트덕후",
  "초보개미",
  "재무분석러",
  "롱숏마스터",
  "주린이A",
  "가치투자자",
  "단타장인",
];

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) - 0 + min;
}

function randomPick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function maybe<T>(value: T, probability = 0.6): T | undefined {
  return Math.random() < probability ? value : undefined;
}

function randomPastDate(days = 120): Date {
  const now = new Date();
  const past = new Date(now);
  past.setDate(now.getDate() - randomInt(0, days));
  past.setHours(randomInt(0, 23), randomInt(0, 59), randomInt(0, 59), 0);
  return past;
}

function makeTitle(stock?: { code: string; name: string }) {
  const prefixes = [
    "분석",
    "전망",
    "실적 코멘트",
    "리스크 점검",
    "모멘텀 체크",
    "뉴스 요약",
    "기술적 관점",
    "가치평가",
  ];
  const pf = randomPick(prefixes);
  if (stock) return `${stock.name} (${stock.code}) ${pf}`;
  const generic = ["시장 코멘트", "금리와 증시", "섹터 스캔", "인플레이션 영향"];
  return `${randomPick(generic)} - ${pf}`;
}

function makeContent(stock?: { code: string; name: string }) {
  const lines = [
    "전일 대비 수급 동향을 간단히 정리해봅니다.",
    "단기 추세가 과열 구간에 진입한 것으로 보입니다.",
    "밸류에이션은 동종 업계 평균 대비 소폭 프리미엄 구간입니다.",
    "중장기 관점에서 실적 모멘텀이 유효하다고 판단합니다.",
    "리스크로는 환율 변동성과 주요 원자재 가격 상승을 꼽을 수 있습니다.",
    "기술적 저항선을 돌파하면 추가 랠리를 기대해볼 만합니다.",
    "기관 수급이 개선되고 있는 점이 긍정적입니다.",
  ];
  const body = Array.from({ length: randomInt(2, 5) }, () => randomPick(lines)).join("\n\n");
  if (stock) return `종목 포인트: ${stock.name} (${stock.code})\n\n${body}`;
  return body;
}

async function seed({ count }: SeedOptions) {
  const values = Array.from({ length: count }).map(() => {
    const withStock = maybe(true, 0.7);
    const stock = withStock ? randomPick(STOCKS) : undefined;
    const created = randomPastDate(180);

    return {
      title: makeTitle(stock),
      content: makeContent(stock),
      author: randomPick(AUTHORS),
      stockCode: stock?.code,
      stockName: stock?.name,
      // createdAt/updatedAt을 DB default로 둘 수도 있지만, 정렬 테스트를 위해 명시 설정
      createdAt: created,
      updatedAt: created,
    };
  });

  const batchSize = 25; // 대량 삽입 시 두 번으로 나눠 예시
  for (let i = 0; i < values.length; i += batchSize) {
    const chunk = values.slice(i, i + batchSize);
    await db.insert(posts).values(chunk);
    console.log(`Inserted ${Math.min(i + batchSize, values.length)}/${values.length}`);
  }
}

(async () => {
  try {
    const COUNT = Number(process.env.SEED_COUNT || 50);
    console.log(`🌱 Seeding posts: ${COUNT} rows`);
    await seed({ count: COUNT });
    console.log("✅ Done");
    process.exit(0);
  } catch (err) {
    console.error("❌ Seed failed:", err);
    process.exit(1);
  }
})();
