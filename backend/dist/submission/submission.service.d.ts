import { PrismaService } from '../prisma/prisma.service';
export declare class SubmissionService {
    private prisma;
    constructor(prisma: PrismaService);
    startSubmission(examId: string, userId: string): Promise<{
        id: string;
        userId: string;
        startTime: Date;
        endTime: Date | null;
        status: string;
        examId: string;
        score: number | null;
    }>;
    submitExam(submissionId: string, studentAnswers: Record<string, any>): Promise<{
        id: string;
        userId: string;
        startTime: Date;
        endTime: Date | null;
        status: string;
        examId: string;
        score: number | null;
    }>;
    getMySubmissions(userId: string): Promise<({
        exam: {
            title: string;
        };
    } & {
        id: string;
        userId: string;
        startTime: Date;
        endTime: Date | null;
        status: string;
        examId: string;
        score: number | null;
    })[]>;
}
