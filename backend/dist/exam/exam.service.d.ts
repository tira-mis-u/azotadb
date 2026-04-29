import { PrismaService } from '../prisma/prisma.service';
import { CreateExamDto } from './dto/create-exam.dto';
export declare class ExamService {
    private prisma;
    constructor(prisma: PrismaService);
    create(teacherId: string, dto: CreateExamDto): Promise<{
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
    addQuestions(examId: string, teacherId: string, questions: any[]): Promise<import("@prisma/client").Prisma.BatchPayload>;
}
