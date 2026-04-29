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
exports.SubmissionService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let SubmissionService = class SubmissionService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async startSubmission(examId, userId) {
        const existing = await this.prisma.submission.findUnique({
            where: {
                examId_userId: { examId, userId },
            },
        });
        if (existing)
            return existing;
        return this.prisma.submission.create({
            data: {
                examId,
                userId,
                status: 'IN_PROGRESS',
            },
        });
    }
    async submitExam(submissionId, studentAnswers) {
        return this.prisma.$transaction(async (tx) => {
            const submission = await tx.submission.findUnique({
                where: { id: submissionId },
                include: { exam: { include: { questions: true } } },
            });
            if (!submission)
                throw new common_1.NotFoundException('Submission not found');
            if (submission.status === 'SUBMITTED') {
                throw new common_1.BadRequestException('Already submitted');
            }
            let totalScore = 0;
            const answerRecords = [];
            for (const question of submission.exam.questions) {
                const studentAns = studentAnswers[question.id];
                const metadata = question.metadata;
                const correctAnswers = metadata.correct_answers;
                let isCorrect = false;
                if (Array.isArray(correctAnswers)) {
                    isCorrect = JSON.stringify(studentAns) === JSON.stringify(correctAnswers);
                }
                const points = isCorrect ? question.points : 0;
                totalScore += points;
                answerRecords.push({
                    submissionId,
                    questionId: question.id,
                    studentAnswer: studentAns,
                    isCorrect,
                    pointsAwarded: points,
                });
            }
            await tx.submissionAnswer.createMany({
                data: answerRecords,
            });
            return tx.submission.update({
                where: { id: submissionId },
                data: {
                    status: 'SUBMITTED',
                    score: totalScore,
                    endTime: new Date(),
                },
            });
        });
    }
    async getMySubmissions(userId) {
        return this.prisma.submission.findMany({
            where: { userId },
            include: { exam: { select: { title: true } } },
        });
    }
};
exports.SubmissionService = SubmissionService;
exports.SubmissionService = SubmissionService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SubmissionService);
//# sourceMappingURL=submission.service.js.map