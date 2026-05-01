import { PrismaService } from '../prisma/prisma.service';
export declare class SubmissionService {
    private prisma;
    constructor(prisma: PrismaService);
    startSubmission(examId: string, userId: string): Promise<any>;
    getSubmission(id: string, userId: string): Promise<{
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
            duration: number | null;
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
            status: import("@prisma/client").$Enums.ExamStatus;
            shuffleQuestions: boolean;
            shuffleOptions: boolean;
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
        userId: string;
        startTime: Date;
        endTime: Date | null;
        examCode: string | null;
        status: string;
        examId: string;
        score: number | null;
        candidateNumber: string | null;
        attemptNumber: number;
        violations: import("@prisma/client/runtime/library").JsonValue;
        deviceIdentifier: string | null;
        scoreHidden: boolean;
        reviewHidden: boolean;
    }>;
    autosave(submissionId: string, userId: string, questionId: string, answer: any): Promise<{
        id: string;
        questionId: string;
        studentAnswer: import("@prisma/client/runtime/library").JsonValue | null;
        isCorrect: boolean | null;
        pointsAwarded: number | null;
        submissionId: string;
    }>;
    submitExam(submissionId: string, userId: string, extraData?: {
        candidateNumber?: string;
        examCode?: string;
        violations?: any[];
    }): Promise<any>;
    getMySubmissions(userId: string): Promise<({
        exam: {
            id: string;
            title: string;
            duration: number | null;
        };
    } & {
        id: string;
        userId: string;
        startTime: Date;
        endTime: Date | null;
        examCode: string | null;
        status: string;
        examId: string;
        score: number | null;
        candidateNumber: string | null;
        attemptNumber: number;
        violations: import("@prisma/client/runtime/library").JsonValue;
        deviceIdentifier: string | null;
        scoreHidden: boolean;
        reviewHidden: boolean;
    })[]>;
}
