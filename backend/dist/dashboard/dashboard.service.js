"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let DashboardService = class DashboardService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getTeacherStats(userId) {
        const db = this.prisma;
        const [examCount, submissionCount, questionCount, avgScoreResult, submissions, recentExams] = await Promise.all([
            db.exam.count({ where: { teacherId: userId } }),
            db.submission.count({ where: { exam: { teacherId: userId } } }),
            db.question.count({ where: { exam: { teacherId: userId } } }),
            db.submission.aggregate({
                where: { exam: { teacherId: userId }, status: 'SUBMITTED' },
                _avg: { score: true },
            }),
            db.submission.findMany({
                where: { exam: { teacherId: userId }, status: 'SUBMITTED' },
                include: { _count: { select: { answers: true } }, answers: { where: { isCorrect: true } } },
            }),
            db.exam.findMany({
                where: { teacherId: userId },
                orderBy: { createdAt: 'desc' },
                take: 5,
            }),
        ]);
        let totalCorrect = 0;
        let totalAnswers = 0;
        submissions.forEach(s => {
            totalCorrect += s.answers.length;
            totalAnswers += s._count.answers;
        });
        const accuracyRate = totalAnswers > 0 ? (totalCorrect / totalAnswers * 100).toFixed(1) : '0.0';
        return {
            stats: {
                exams: examCount,
                submissions: submissionCount,
                questions: questionCount,
                avgScore: avgScoreResult._avg.score?.toFixed(1) || '0.0',
                accuracyRate,
            },
            recentActivity: recentExams.map(exam => ({
                id: exam.id,
                title: exam.title,
                createdAt: exam.createdAt,
            })),
        };
    }
    async getStudentStats(userId) {
        const db = this.prisma;
        const [submissionCount, avgScoreResult, wrongAnswers, recentSubmissions] = await Promise.all([
            db.submission.count({ where: { userId } }),
            db.submission.aggregate({
                where: { userId, status: 'SUBMITTED' },
                _avg: { score: true },
            }),
            db.submissionAnswer.findMany({
                where: { submission: { userId }, isCorrect: false },
                include: { question: true },
                take: 10,
            }),
            db.submission.findMany({
                where: { userId },
                include: { exam: true },
                orderBy: { startTime: 'desc' },
                take: 5,
            }),
        ]);
        const weakTopics = Array.from(new Set(wrongAnswers.map(a => a.question.metadata.topic || 'Chung'))).slice(0, 3);
        return {
            stats: {
                examsDone: submissionCount,
                avgScore: avgScoreResult._avg.score?.toFixed(1) || '0.0',
                streak: 3,
                bookmarks: 0,
            },
            weakTopics,
            recentExams: recentSubmissions.map(s => ({
                id: s.id,
                name: s.exam.title,
                score: s.score?.toFixed(1) || 'N/A',
                time: s.startTime,
            })),
        };
    }
};
exports.DashboardService = DashboardService;
exports.DashboardService = DashboardService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DashboardService);
//# sourceMappingURL=dashboard.service.js.map