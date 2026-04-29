import { ExamService } from './exam.service';
import { CreateExamDto } from './dto/create-exam.dto';
export declare class ExamController {
    private readonly examService;
    constructor(examService: ExamService);
    create(userId: string, dto: CreateExamDto): Promise<{
        id: string;
        createdAt: Date;
        title: string;
        description: string | null;
        duration: number;
        startTime: Date | null;
        endTime: Date | null;
        status: import("@prisma/client").$Enums.ExamStatus;
        teacherId: string;
    }>;
    findAll(): Promise<({
        teacher: {
            email: string;
        };
    } & {
        id: string;
        createdAt: Date;
        title: string;
        description: string | null;
        duration: number;
        startTime: Date | null;
        endTime: Date | null;
        status: import("@prisma/client").$Enums.ExamStatus;
        teacherId: string;
    })[]>;
    findOne(id: string, userId: string, role: string): Promise<({
        questions: {
            id: string;
            examId: string;
            type: string;
            content: string;
            points: number;
            metadata: import("@prisma/client/runtime/library").JsonValue;
        }[];
    } & {
        id: string;
        createdAt: Date;
        title: string;
        description: string | null;
        duration: number;
        startTime: Date | null;
        endTime: Date | null;
        status: import("@prisma/client").$Enums.ExamStatus;
        teacherId: string;
    }) | null>;
    addQuestions(id: string, userId: string, questions: any[]): Promise<import("@prisma/client").Prisma.BatchPayload>;
}
