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
exports.ExamService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ExamService = class ExamService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(teacherId, dto) {
        return this.prisma.exam.create({
            data: {
                title: dto.title,
                description: dto.description,
                duration: dto.duration,
                startTime: dto.startTime,
                endTime: dto.endTime,
                teacherId: teacherId,
                status: 'DRAFT',
            },
        });
    }
    async findAll() {
        return this.prisma.exam.findMany({
            where: { status: 'PUBLISHED' },
            include: { teacher: { select: { email: true } } },
        });
    }
    async findOne(id, userId, role) {
        const exam = await this.prisma.exam.findUnique({
            where: { id },
            include: {
                questions: true,
            },
        });
        if (!exam)
            return null;
        if (role === 'STUDENT') {
            exam.questions = exam.questions.map((q) => {
                const metadata = q.metadata;
                delete metadata.correct_answers;
                delete metadata.explanation;
                return q;
            });
        }
        return exam;
    }
    async addQuestions(examId, teacherId, questions) {
        const exam = await this.prisma.exam.findUnique({ where: { id: examId } });
        if (!exam) {
            throw new common_1.NotFoundException('Exam not found');
        }
        if (exam.teacherId !== teacherId) {
            throw new common_1.ForbiddenException('You are not the owner of this exam');
        }
        return this.prisma.question.createMany({
            data: questions.map((q) => ({
                ...q,
                examId,
            })),
        });
    }
};
exports.ExamService = ExamService;
exports.ExamService = ExamService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ExamService);
//# sourceMappingURL=exam.service.js.map