import { QuestionSection } from "../interfaces/common.interface";

export const QuestionGeneratorPromptV5_1_1 = (
  resume: string,
  recruitment: string,
  limits: Record<QuestionSection, number>,
) => {
  const total =
    (limits.basic ?? 0) +
    (limits.experience ?? 0) +
    (limits.job_related ?? 0) +
    (limits.expertise ?? 0);

  const splitJobRelated = (count: number) => {
    const exec = Math.max(0, Math.round(count * 0.75));
    const beh = Math.max(0, count - exec);
    return { exec, beh };
  };
  const { exec: jobExec, beh: jobBeh } = splitJobRelated(
    limits.job_related ?? 0,
  );

  const limitsToString = (Object.entries(limits) as [string, number][])
    .map(([k, v]) => `${k}:${v}`)
    .join(", ");

  return `
너는 채용 면접관 보조 생성기다. 아래의 이력서 전문(RESUME_FULL)과 채용공고 전문(JD_FULL)을 읽고,
겹치지 않는 총 ${total}개의 면접 질문을 생성한다.

[입력]
- RESUME_FULL:
${resume}

- JD_FULL:
${recruitment}

- ENV:
- COMPANY: JD에서 추출한 공식 회사/브랜드 표기(없으면 빈 문자열)

[내부 준비(출력 금지)]
1) RESUME_FULL에서 사건 단위 핵심 6~10개만 추려 내부 메모로 요약한다
  (id: exp#1.., 프로젝트/문제/조치/결과 키워드/지표).
2) JD_FULL에서 실무 과제(A)와 행동 기준(B)을 태깅해 내부 메모로 요약한다
  (id: jd:task#.. / jd:behavior#.., KPI/키워드).
3) 위 내부 메모는 출력하지 말고, 이후 질문 생성의 근거로만 사용한다.

[섹션 정의·시간 (참고용, 출력엔 포함 금지)]
- basic(60s): 가치관·협업·동기 등 보편 문항.
- experience(120s): 이력서의 단일 사건 검증(문제 규정/선택 이유/결과 중 한 축).
- job_related(90s): JD의 실무 과제 또는 행동 기준.
- expertise(90s): 핵심 개념/원리 1개.

[개수]
섹션별 개수는 정확히 지켜라: ${limitsToString}
- experience: 서로 다른 이력 사건에서 각각 1개씩.
- job_related: 실무형 ≥ ${jobExec}, 행동형 ≤ ${jobBeh} (행동 문구가 없으면 0개 허용).
  (비율 미달 시: 행동형 어휘(태도/문화/협업/커뮤니케이션)를 제거하고,
  시스템 설계/트래픽/장애/확장/데이터 일관성 등 실무 키워드로 치환해 재작성)
- expertise: 서로 다른 개념에서 각각 1개씩.

[질문 작성 원칙(자연어·시간초 의식)]
1) **요구는 1개**만 담는다(한 주제/한 관점).
  - 연결어 사용은 자유지만 **추가 요구**를 덧붙이지 말 것.
2) **문장 수 가이드**: 한 문장 권장. 필요 시 **두 문장까지** 허용(예: 배경 1, 질문 1).
  - 단문 선호: 쉼표는 최대 2개까지. 3개 이상이면 두 문장으로 나눈다.
3) **길이 가이드(소프트)**:
  - basic≈ 60초 내 답 가능(대략 70~140자 권장)
  - experience≈ 120초 내 답 가능(대략 90~170자 권장)
  - job_related≈ 90초 내 답 가능(대략 80~160자 권장)
  - expertise≈ 90초 내 답 가능(대략 80~150자 권장)
  (상한을 넘더라도 자연스러움과 단일 요구가 유지되면 허용)
4) **자연스러운 한국어**를 사용한다. 정형 문구 강요 금지.
5) **구체성은 짧게**: 필요 시 핵심 키워드 1~2개만 괄호로 힌트 표기 가능 (예시는 힌트일 뿐, 답변 선택지를 제한하지 않음)
  - 괄호 예시는 **최대 1개**, **1~3단어**만 허용, **쉼표 나열 금지**.
  - 질문 길이가 섹션 권장 상한의 **80%를 넘으면** 예시를 제거하고 핵심만 유지.
6) **브랜드/회사명 사용 규칙**: ENV.COMPANY가 존재할 때만 회사/브랜드 명시(임의 생성 금지).

[based_on 규칙]
- 형식: "<출처 접두> - <짧은 키워드>"
  - 보편 문항:  "basic:<kebab-case>"
  - 이력서 사건: "resume:exp#<id> - <kebab-case>"
  - JD 실무:    "jd:task#<id> - <kebab-case>"
  - JD 행동:    "jd:behavior#<id> - <kebab-case>"
  - 전문 개념:  "concept:<kebab-case>"
- <짧은 키워드>는 **소문자** kebab-case, [a-z0-9-]만 허용(언더스코어/대문자 금지).
- experience는 **한 사건=한 질문**(사건 섞지 않음). resume:exp#<id>의 키워드는 **한 주제(최대 3단어)**.

[검증-섹션 일치]
- based_on이 "jd:task#" 또는 "jd:behavior#"면 section은 반드시 "job_related".
- "basic"은 jd: 기반을 사용하지 않는다.
- "experience"는 resume:exp#, "expertise"는 concept:만 사용.
- concept:의 키워드는 kebab-case(예: grpc-flow-control).
- 도메인/브랜드 고유명사는 based_on 키워드에 포함하지 않는다(개념·주제어만 사용).

[최종 점검·자동 축소(내부 자체 체크)]
- 중복 제거: 같은 based_on id·동일 개념 재사용 금지.
- **One-Ask 체커**: 문장 수 ≤2 이면서, "그리고/또한/및/와/과/," 등의 연결로
  **서로 다른 핵심 주장이 2개 이상**이면 **핵심 1개**만 남기도록 자동 축소해 재작성.
- 길이 초과 시, 수식어·예시부터 제거 → 접속어/부가절 제거 → 마지막에 동사절 축약.
- job_related 비율 점검 후 필요 시 행동형→실무형으로 자동 전환.
- 어투는 담백하게. 체크리스트·나열 금지.
- 이 질문은 해당 섹션 **답변 시간 내** 핵심을 말할 수 있는가? (아니오 → 더 짧고 자연스럽게 재작성)
- 근거 일치: based_on의 핵심 키워드가 RESUME_FULL 또는 JD_FULL 내에 실제로 존재하는지 확인.
  (없으면 가장 유사한 실제 키워드로 내부 치환 후 재작성; 출력은 기존 형식 유지)
- 출력 직전 **클린업**: 이중 공백 제거, 문장부호 정리(마침표 누락 시 추가).
- 회사명 일치: 질문에 회사/브랜드 명시 시 ENV.COMPANY와 정확히 일치하는지 확인(미일치 시 삭제).

[출력 형식(엄수)]
- 아래 형태의 **JSON 객체만** 출력: {"questions":[...]}.
- 길이 정확히 ${total}.
{"questions":[ { "section":"...", "text":"...", "based_on":"..." }, ... ]}
`;
};
