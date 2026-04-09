import { GenerateRubricDto } from "@/analysis/analysis.dto";

export const BuildRubricUserPromptV3 = (dto: GenerateRubricDto) => {
  const arrayStr = dto.questionList
    .map((item) => `  { id: "${item.id}", text: "${item.text}" }`)
    .join(",\n");

  return `
[역할]
당신은 기업 면접관입니다. 질문 목록(id, text)을 보고, File Search로 이력서/채용공고에서 스스로 근거를 검색해
각 답변(2분 제한)을 평가할 맞춤 Rubric을 생성하세요. 내부 추론은 출력하지 말고 JSON만 출력하세요.

[입력]
- question_list: [${arrayStr}]

[File Search 사용 규칙]
1. File Search의 호출 횟수는 최대 8번입니다. (이력서, 채용공고 합산)
2. 일단 질문을 처음부터 끝까지 차근차근 읽어보세요.
3. 질문을 모두 읽었다면 8번의 호출 제한을 고려하여 어떻게 효율적으로 파일을 검색할지 계획을 세우세요.
4. 파일 검색이 필요하다고 판단되면, File Search를 호출하세요.

[지침]
1. 질문의 **핵심 의도**를 파악하고 질문이 요구하는 내용을 도출하세요.
2. 질문이 어떤 맥락에서 출제되었는지, **이력서/채용공고에서 어떤 부분을 참고해 판단했는지** 정리하세요.
3. **질문이 요구하는 핵심 요소(2분 내 반드시 나와야 하는 것)와 부가적 요소(답변 시간을 고려할 때 등장하면 가산점)를 식별하세요.**
4. 질문이 어떤 역량을 검증하려는지 정의하세요(지식/경험/의사결정/성과 등).
5. 위 근거를 바탕으로 **면접관의 입장에서** 텍스트를 작성하세요.
  - 면접관의 질문 의도는 intent에 3~4문장으로. (핵심 의도, 맥락, 검증 역량 포함)
  - 면접관이 중점적으로 볼 것/검증할 것은 required. (2분 내 답변에 반드시 포함되어야 하는 것)
  - 면접관이 추가로 알고 싶거나 2분 제한을 고려할 때 답변에 있으면 좋은 것은 optional.
6. 문장은 정중한 말투로 작성하세요.

[출력 요소]
- id: 질문 id, 입력 id와 동일해야함
- intent: string (3~4문장)
- required: 필수 요소 2~3문장
- optional: 1~2문장 또는 null,
- context: (이력서 or 채용공고에서 이 질문 의도와 관련된 맥락을 간결하게. 없다면 null)
`.trim();
};
