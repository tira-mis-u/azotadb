"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExamService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const bcrypt = __importStar(require("bcrypt"));
let ExamService = class ExamService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(teacherId, dto) {
        let passwordHash = null;
        if (dto.requiresPassword && dto.password) {
            passwordHash = await bcrypt.hash(dto.password, 10);
        }
        return this.prisma.exam.create({
            data: {
                title: dto.title,
                description: dto.description,
                isTimed: dto.isTimed ?? true,
                duration: dto.duration,
                startTime: dto.startTime,
                endTime: dto.endTime,
                mode: dto.mode || 'STANDARD',
                examCode: dto.examCode,
                requiresPassword: dto.requiresPassword || false,
                passwordHash: passwordHash,
                strictMode: dto.strictMode || false,
                fullscreenRequired: dto.fullscreenRequired || false,
                maxAttempts: dto.maxAttempts || 0,
                allowScoreView: dto.allowScoreView ?? true,
                allowAnswerReview: dto.allowAnswerReview ?? true,
                maxScore: dto.maxScore ?? 10.0,
                teacherId: teacherId,
                status: 'DRAFT',
            },
        });
    }
    async findAll() {
        return this.prisma.exam.findMany({
            where: { status: 'PUBLISHED' },
            include: {
                teacher: { select: { email: true } },
                _count: { select: { questions: true } }
            },
            orderBy: { createdAt: 'desc' }
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
    async update(id, teacherId, dto) {
        const exam = await this.prisma.exam.findUnique({ where: { id } });
        if (!exam || exam.teacherId !== teacherId) {
            throw new common_1.ForbiddenException('You do not have permission to edit this exam');
        }
        return this.prisma.exam.update({
            where: { id },
            data: dto,
        });
    }
    async remove(id, teacherId) {
        const exam = await this.prisma.exam.findUnique({ where: { id } });
        if (!exam || exam.teacherId !== teacherId) {
            throw new common_1.ForbiddenException('You do not have permission to delete this exam');
        }
        return this.prisma.exam.delete({ where: { id } });
    }
    async duplicate(id, teacherId) {
        const exam = await this.prisma.exam.findUnique({
            where: { id },
            include: { questions: true },
        });
        if (!exam)
            throw new common_1.NotFoundException('Exam not found');
        const { id: _, createdAt: __, questions, ...rest } = exam;
        return this.prisma.exam.create({
            data: {
                ...rest,
                title: `${exam.title} (Bản sao)`,
                teacherId,
                status: 'DRAFT',
                questions: {
                    create: questions.map((q) => {
                        const { id: ___, examId: ____, ...qRest } = q;
                        return qRest;
                    }),
                },
            },
        });
    }
    async toggleStatus(id, teacherId) {
        const exam = await this.prisma.exam.findUnique({ where: { id } });
        if (!exam || exam.teacherId !== teacherId) {
            throw new common_1.ForbiddenException('Permission denied');
        }
        const newStatus = exam.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';
        return this.prisma.exam.update({
            where: { id },
            data: { status: newStatus },
        });
    }
    async findByTeacher(teacherId) {
        return this.prisma.exam.findMany({
            where: { teacherId },
            orderBy: { createdAt: 'desc' },
            include: {
                _count: {
                    select: { questions: true, submissions: true },
                },
            },
        });
    }
    async addQuestions(examId, teacherId, questions) {
        const exam = await this.prisma.exam.findUnique({ where: { id: examId } });
        if (!exam) {
            throw new common_1.NotFoundException('Exam not found');
        }
        if (exam.teacherId !== teacherId) {
            throw new common_1.ForbiddenException('You are not the owner of this exam');
        }
        return this.prisma.$transaction([
            this.prisma.question.deleteMany({ where: { examId } }),
            this.prisma.question.createMany({
                data: questions.map((q) => ({
                    ...q,
                    examId,
                })),
            }),
        ]);
    }
    async getTeacherQuestions(teacherId) {
        return this.prisma.question.findMany({
            where: {
                exam: {
                    teacherId: teacherId,
                },
            },
            include: {
                exam: {
                    select: { title: true }
                }
            },
            orderBy: {
                exam: { createdAt: 'desc' }
            }
        });
    }
    async updateQuestion(questionId, teacherId, data) {
        const question = await this.prisma.question.findUnique({
            where: { id: questionId },
            include: { exam: { select: { teacherId: true } } }
        });
        if (!question)
            throw new common_1.NotFoundException('Question not found');
        if (question.exam.teacherId !== teacherId)
            throw new common_1.ForbiddenException('Permission denied');
        return this.prisma.question.update({
            where: { id: questionId },
            data: {
                content: data.content,
                type: data.type,
                metadata: data.metadata,
            }
        });
    }
    async deleteQuestion(questionId, teacherId) {
        const question = await this.prisma.question.findUnique({
            where: { id: questionId },
            include: { exam: { select: { teacherId: true } } }
        });
        if (!question)
            throw new common_1.NotFoundException('Question not found');
        if (question.exam.teacherId !== teacherId)
            throw new common_1.ForbiddenException('Permission denied');
        return this.prisma.question.delete({ where: { id: questionId } });
    }
};
exports.ExamService = ExamService;
exports.ExamService = ExamService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ExamService);
//# sourceMappingURL=exam.service.js.map