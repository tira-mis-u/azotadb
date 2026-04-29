import { SubmissionService } from './submission.service';
export declare class SubmissionController {
    private readonly submissionService;
    constructor(submissionService: SubmissionService);
    startSubmission(examId: string, userId: string): Promise<{
        id: string;
        startTime: Date;
        endTime: Date | null;
        status: string;
        examId: string;
        userId: string;
        score: number | null;
    }>;
    submitExam(id: string, answers: Record<string, any>): Promise<{
        id: string;
        startTime: Date;
        endTime: Date | null;
        status: string;
        examId: string;
        userId: string;
        score: number | null;
    }>;
    getMySubmissions(userId: string): Promise<({
        exam: {
            title: string;
        };
    } & {
        id: string;
        startTime: Date;
        endTime: Date | null;
        status: string;
        examId: string;
        userId: string;
        score: number | null;
    })[]>;
}
