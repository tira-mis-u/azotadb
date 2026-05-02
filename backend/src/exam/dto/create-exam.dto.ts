import {
  IsString,
  IsNotEmpty,
  IsInt,
  IsOptional,
  IsDateString,
} from 'class-validator';

export class CreateExamDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsInt()
  @IsOptional()
  durationValue?: number;

  @IsString()
  @IsOptional()
  durationUnit?: 'MINUTE' | 'HOUR' | 'DAY' | 'WEEK' | 'MONTH';

  @IsDateString()
  @IsOptional()
  startTime?: string;

  @IsDateString()
  @IsOptional()
  endTime?: string;

  @IsString()
  @IsOptional()
  mode?: 'PRACTICE' | 'STANDARD' | 'THPTQG';

  @IsString()
  @IsOptional()
  examCode?: string;

  @IsOptional()
  isTimed?: boolean;

  @IsOptional()
  requiresPassword?: boolean;

  @IsString()
  @IsOptional()
  password?: string;

  @IsOptional()
  strictMode?: boolean;

  @IsOptional()
  fullscreenRequired?: boolean;

  @IsInt()
  @IsOptional()
  maxAttempts?: number;

  @IsOptional()
  allowScoreView?: boolean;

  @IsOptional()
  allowAnswerReview?: boolean;

  @IsOptional()
  maxScore?: number;

  @IsOptional()
  requireLogin?: boolean;
}
