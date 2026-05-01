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
        const exam = await this.prisma.exam.findUnique({
            where: { id: examId }
        });
        if (!exam)
            throw new common_1.NotFoundException('Exam not found');
        const inProgress = await this.prisma.submission.findFirst({
            where: {
                examId,
                userId,
                status: 'IN_PROGRESS'
            }
        });
        if (inProgress)
            return inProgress;
        const previousAttempts = await this.prisma.submission.count({
            where: {
                examId,
                userId
            }
        });
        if (exam.maxAttempts > 0 && previousAttempts >= exam.maxAttempts) {
            throw new common_1.ForbiddenException(`Bạn đã hết số lần làm bài (Tối đa: ${exam.maxAttempts} lần)`);
        }
        return this.prisma.submission.create({
            data: {
                examId,
                userId,
                status: 'IN_PROGRESS',
                attemptNumber: previousAttempts + 1
            },
        });
    }
    async getSubmission(id, userId) {
        const submission = await this.prisma.submission.findUnique({
            where: { id },
            include: {
                exam: {
                    include: {
                        questions: true,
                    },
                },
                answers: true,
            },
        });
        if (!submission || submission.userId !== userId) {
            throw new common_1.NotFoundException('Submission not found');
        }
        if (submission.status === 'IN_PROGRESS') {
            submission.exam.questions = submission.exam.questions.map((q) => {
                const metadata = q.metadata;
                const { correct_answers, correct_answer, explanation, ...rest } = metadata;
                q.metadata = rest;
                return q;
            });
        }
        else if (submission.status === 'SUBMITTED') {
            const examAny = submission.exam;
            if (!(examAny.allowAnswerReview)) {
                submission.exam.questions = submission.exam.questions.map((q) => {
                    const metadata = q.metadata;
                    const { correct_answers, correct_answer, explanation, ...rest } = metadata;
                    q.metadata = rest;
                    return q;
                });
            }
            if (!(examAny.allowScoreView)) {
                submission.score = null;
            }
        }
        return submission;
    }
    async autosave(submissionId, userId, questionId, answer) {
        const submission = await this.prisma.submission.findUnique({
            where: { id: submissionId },
        });
        if (!submission || submission.userId !== userId) {
            throw new common_1.ForbiddenException('Permission denied');
        }
        if (submission.status === 'SUBMITTED') {
            throw new common_1.BadRequestException('Exam already submitted');
        }
        const existingAnswer = await this.prisma.submissionAnswer.findFirst({
            where: { submissionId, questionId },
        });
        if (existingAnswer) {
            return this.prisma.submissionAnswer.update({
                where: { id: existingAnswer.id },
                data: { studentAnswer: answer },
            });
        }
        return this.prisma.submissionAnswer.create({
            data: {
                submissionId,
                questionId,
                studentAnswer: answer,
            },
        });
    }
    async submitExam(submissionId, userId, extraData) {
        const violations = extraData?.violations || [];
        return this.prisma.$transaction(async (tx) => {
            const submission = await tx.submission.findUnique({
                where: { id: submissionId },
                include: {
                    exam: { include: { questions: true } },
                    answers: true,
                },
            });
            if (!submission || submission.userId !== userId) {
                throw new common_1.NotFoundException('Submission not found');
            }
            if (submission.status === 'SUBMITTED') {
                throw new common_1.BadRequestException('Already submitted');
            }
            const exam = submission.exam;
            if (exam.isTimed && exam.duration) {
                const startTime = new Date(submission.startTime).getTime();
                const durationMs = (exam.duration + 2) * 60 * 1000;
                if (Date.now() > startTime + durationMs) {
                }
            }
            let totalPoints = 0;
            let earnedPoints = 0;
            for (const question of submission.exam.questions) {
                const studentAnsRecord = submission.answers.find((a) => a.questionId === question.id);
                const studentAns = studentAnsRecord?.studentAnswer;
                const metadata = question.metadata;
                let isCorrect = false;
                if (question.type === 'TRUE_FALSE') {
                    isCorrect = studentAns === metadata.correct_answer;
                }
                else if (question.type === 'MULTIPLE_CHOICE') {
                    const correctAnswers = metadata.correct_answers;
                    if (Array.isArray(correctAnswers)) {
                        if (Array.isArray(studentAns)) {
                            isCorrect = JSON.stringify([...studentAns].sort()) === JSON.stringify([...correctAnswers].sort());
                        }
                        else {
                            isCorrect = correctAnswers.length === 1 && correctAnswers[0] === studentAns;
                        }
                    }
                    else {
                        isCorrect = studentAns === correctAnswers;
                    }
                }
                else if (question.type === 'TRUE_FALSE_GROUP') {
                    const statements = metadata.statements || [];
                    const studentAnswers = studentAns || {};
                    isCorrect = statements.every((s) => studentAnswers[s.id] === s.correctAnswer);
                }
                totalPoints += question.points;
                const awarded = isCorrect ? question.points : 0;
                earnedPoints += awarded;
                if (studentAnsRecord) {
                    await tx.submissionAnswer.update({
                        where: { id: studentAnsRecord.id },
                        data: { isCorrect, pointsAwarded: awarded },
                    });
                }
            }
            const maxScore = submission.exam.maxScore || 10.0;
            const finalScore = totalPoints > 0 ? (earnedPoints / totalPoints) * maxScore : 0;
            let finalViolations = [];
            try {
                finalViolations = Array.isArray(submission.violations)
                    ? submission.violations
                    : JSON.parse(submission.violations || '[]');
            }
            catch (e) {
                finalViolations = [];
            }
            finalViolations = [...finalViolations, ...violations];
            return tx.submission.update({
                where: { id: submissionId },
                data: {
                    status: 'SUBMITTED',
                    score: parseFloat(finalScore.toFixed(2)),
                    endTime: new Date(),
                    violations: finalViolations,
                    candidateNumber: extraData?.candidateNumber,
                    examCode: extraData?.examCode,
                    scoreHidden: !submission.exam.allowScoreView,
                    reviewHidden: !submission.exam.allowAnswerReview,
                },
            });
        });
    }
    async getMySubmissions(userId) {
        return this.prisma.submission.findMany({
            where: { userId },
            include: {
                exam: {
                    select: {
                        id: true,
                        title: true,
                        duration: true,
                    }
                }
            },
            orderBy: { startTime: 'desc' },
        });
    }
};
exports.SubmissionService = SubmissionService;
exports.SubmissionService = SubmissionService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SubmissionService);
//# sourceMappingURL=submission.service.js.map