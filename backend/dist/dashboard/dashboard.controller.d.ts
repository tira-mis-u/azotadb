import { DashboardService } from './dashboard.service';
export declare class DashboardController {
    private readonly dashboardService;
    constructor(dashboardService: DashboardService);
    getStats(req: any): Promise<{
        stats: {
            exams: any;
            submissions: any;
            questions: any;
            avgScore: any;
            accuracyRate: string;
        };
        recentActivity: any;
    } | {
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
