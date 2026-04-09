import { ApiProperty } from "@nestjs/swagger";
import {
  IsArray,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
} from "class-validator";
import { TranscriptionSegment } from "openai/resources/audio/transcriptions";

export class STTRefineSegmentsDto {
  @ApiProperty({ description: "질문 텍스트", required: false })
  @IsString()
  @IsOptional()
  questionText?: string;

  @ApiProperty({
    description: "직군",
    required: false,
  })
  @IsOptional()
  @IsString()
  jobRole?: string;

  @ApiProperty({ description: "필사 텍스트", isArray: true })
  @IsArray()
  @IsNotEmpty()
  segments: TranscriptionSegment[];
}

export class GenerateRubricDto {
  @ApiProperty({
    description: "질문 배열",
    required: true,
  })
  @IsArray()
  questionList: { id: string; text: string }[];

  @ApiProperty({
    description: "vector request id",
    required: true,
  })
  @IsString()
  vectorId: string;
}

export class FeedbackDto {
  @ApiProperty({
    description: "질문 텍스트",
    required: true,
    default:
      "예약 시스템의 동시성 문제를 해결했다고 했는데, 그 상황에서 어떤 현상을 근거로 문제를 규정했고 왜 그 접근을 선택했는지, 적용 후 어떤 지표/현상이 개선되었는지 설명해주세요.",
  })
  @IsString()
  questionText: string;

  @ApiProperty({
    description: "segments",
    isArray: true,
    default: [
      "음, 제가 경험한 동시성 문제는 심야 자습이나 안마의자 같은 예약 시스템에서 동시에 여러 사용자가 신청했을 때, 최대 인원을 추가해서 예약이 잡히는 현상이었습니다.",
      "처음에는 단순히 database 레벨에서 transaction만으로 해결하려고 했는데, 순간적으로 traffic이 몰릴 때 처리 속도가 따라가지 못하는 문제가 있었어요.",
      "그래서 더 빠른 처리와 일관성을 위해 인메모리 저장소인 Redis를 도입했고, 그 위에 Redisson client를 활용해서 distributed lock을 구현했습니다.",
      "단순 락이 아니라 TTL을 설정해서 일정 시간 내에 처리되지 않으면 자동으로 실패하도록 했고, transaction이 commit된 이후에만 락을 반납하는 방식으로 데이터 일관성을 보장했습니다.",
      "적용 이후에는 최대 인원 초과 예약 같은 현상이 사라졌고, 처리량 자체도 확연히 개선됐습니다.",
      "특히 사용자 피드백에서 예약이 꼬이지 않는다는 반응을 많이 받았고, monitoring 지표상에서도 예약 요청 성공률이 안정적으로 100%에 가까워졌습니다.",
    ],
  })
  @IsArray()
  @IsNotEmpty()
  segments: string[];

  @ApiProperty({
    description: "vector request id",
    required: true,
  })
  @IsString()
  vectorId: string;

  @ApiProperty({
    description: "rubric object",
    required: true,
  })
  @IsObject()
  rubric: object;
}
