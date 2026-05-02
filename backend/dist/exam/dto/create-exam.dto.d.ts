export declare class CreateExamDto {
    title: string;
    description?: string;
    durationValue?: number;
    durationUnit?: 'MINUTE' | 'HOUR' | 'DAY' | 'WEEK' | 'MONTH';
    startTime?: string;
    endTime?: string;
    mode?: 'PRACTICE' | 'STANDARD' | 'THPTQG';
    examCode?: string;
    isTimed?: boolean;
    requiresPassword?: boolean;
    password?: string;
    strictMode?: boolean;
    fullscreenRequired?: boolean;
    maxAttempts?: number;
    allowScoreView?: boolean;
    allowAnswerReview?: boolean;
    maxScore?: number;
    requireLogin?: boolean;
}
