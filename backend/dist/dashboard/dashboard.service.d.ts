import { PrismaService } from '../prisma/prisma.service';
export declare class DashboardService {
    private prisma;
    constructor(prisma: PrismaService);
    getTeacherStats(userId: string): Promise<{
        stats: {
            exams: any;
            submissions: any;
            questions: any;
            avgScore: any;
            accuracyRate: string;
        };
        recentActivity: any;
    }>;
    getStudentStats(userId: string): Promise<{
        stats: {
            examsDone: any;
            avgScore: any;
            streak: number;
            bookmarks: number;
        };
        weakTopics: unknown[];
        recentExams: any;
    }>;
}
