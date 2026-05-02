import { SubmissionService } from './submission.service';
export declare class SubmissionController {
    private readonly submissionService;
    constructor(submissionService: SubmissionService);
    getSubmission(id: string, userId?: string, guestSessionId?: string): Promise<{
        exam: {
            questions: {
                id: string;
                examId: string;
                type: string;
                content: string;
                points: number;
                explanation: string | null;
                metadata: import("@prisma/client/runtime/library").JsonValue;
            }[];
        } & {
            id: string;
            passwordHash: string | null;
            createdAt: Date;
            title: string;
            description: string | null;
            durationValue: number | null;
            durationUnit: import("@prisma/client").$Enums.DurationUnit | null;
            startTime: Date | null;
            endTime: Date | null;
            mode: import("@prisma/client").$Enums.ExamMode;
            examCode: string | null;
            isTimed: boolean;
            requiresPassword: boolean;
            strictMode: boolean;
            fullscreenRequired: boolean;
            maxAttempts: number;
            allowScoreView: boolean;
            allowAnswerReview: boolean;
            maxScore: number;
            requireLogin: boolean;
            status: import("@prisma/client").$Enums.ExamStatus;
            shuffleQuestions: boolean;
            shuffleOptions: boolean;
            publicId: string;
            teacherId: string;
        };
        answers: {
            id: string;
            questionId: string;
            studentAnswer: import("@prisma/client/runtime/library").JsonValue | null;
            isCorrect: boolean | null;
            pointsAwarded: number | null;
            submissionId: string;
        }[];
    } & {
        id: string;
        userId: string | null;
        startTime: Date;
        endTime: Date | null;
        examCode: string | null;
        status: string;
        examId: string;
        guestName: string | null;
        guestSessionId: string | null;
        score: number | null;
        candidateNumber: string | null;
        attemptNumber: number;
        violations: import("@prisma/client/runtime/library").JsonValue;
        deviceIdentifier: string | null;
        scoreHidden: boolean;
        reviewHidden: boolean;
    }>;
    startSubmission(publicId: string, userId?: string, body?: {
        guestName?: string;
        guestSessionId?: string;
    }): Promise<any>;
    autosave(id: string, body: {
        questionId: string;
        answer: any;
        guestSessionId?: string;
    }, userId?: string): Promise<{
        id: string;
        questionId: string;
        studentAnswer: import("@prisma/client/runtime/library").JsonValue | null;
        isCorrect: boolean | null;
        pointsAwarded: number | null;
        submissionId: string;
    }>;
    submitExam(id: string, userId?: string, body?: {
        violations?: any[];
        candidateNumber?: string;
        examCode?: string;
        guestSessionId?: string;
    }): Promise<any>;
    getMySubmissions(userId: string): Promise<({
        exam: {
            id: string;
            title: string;
            durationValue: number | null;
            durationUnit: import("@prisma/client").$Enums.DurationUnit | null;
        };
    } & {
        id: string;
        userId: string | null;
        startTime: Date;
        endTime: Date | null;
        examCode: string | null;
        status: string;
        examId: string;
        guestName: string | null;
        guestSessionId: string | null;
        score: number | null;
        candidateNumber: string | null;
        attemptNumber: number;
        violations: import("@prisma/client/runtime/library").JsonValue;
        deviceIdentifier: string | null;
        scoreHidden: boolean;
        reviewHidden: boolean;
    })[]>;
}
