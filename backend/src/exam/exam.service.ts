import { Injectable, BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateExamDto } from './dto/create-exam.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class ExamService {
  constructor(private prisma: PrismaService) {}

  async create(teacherId: string, dto: CreateExamDto) {
    let passwordHash: string | null = null;
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

  async findOne(id: string, userId: string, role: string) {
    const exam = await this.prisma.exam.findUnique({
      where: { id },
      include: {
        questions: true,
      },
    });

    if (!exam) return null;

    // Nếu là học sinh, giấu đáp án đúng
    if (role === 'STUDENT') {
      exam.questions = exam.questions.map((q) => {
        const metadata = q.metadata as any;
        delete metadata.correct_answers;
        delete metadata.explanation;
        return q;
      });
    }

    return exam;
  }

  async update(id: string, teacherId: string, dto: Partial<CreateExamDto>) {
    const exam = await this.prisma.exam.findUnique({ where: { id } });
    if (!exam || exam.teacherId !== teacherId) {
      throw new ForbiddenException('You do not have permission to edit this exam');
    }

    return this.prisma.exam.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string, teacherId: string) {
    const exam = await this.prisma.exam.findUnique({ where: { id } });
    if (!exam || exam.teacherId !== teacherId) {
      throw new ForbiddenException('You do not have permission to delete this exam');
    }

    return this.prisma.exam.delete({ where: { id } });
  }

  async duplicate(id: string, teacherId: string) {
    const exam = await this.prisma.exam.findUnique({
      where: { id },
      include: { questions: true },
    });

    if (!exam) throw new NotFoundException('Exam not found');

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id: _, createdAt: __, questions, ...rest } = exam;

    return this.prisma.exam.create({
      data: {
        ...rest,
        title: `${exam.title} (Bản sao)`,
        teacherId,
        status: 'DRAFT',
        questions: {
          create: questions.map((q) => {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { id: ___, examId: ____, ...qRest } = q;
            return qRest as any;
          }),
        },
      },
    });
  }

  async toggleStatus(id: string, teacherId: string) {
    const exam = await this.prisma.exam.findUnique({ where: { id } });
    if (!exam || exam.teacherId !== teacherId) {
      throw new ForbiddenException('Permission denied');
    }

    const newStatus = exam.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';
    return this.prisma.exam.update({
      where: { id },
      data: { status: newStatus as any },
    });
  }

  async findByTeacher(teacherId: string) {
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

  async addQuestions(examId: string, teacherId: string, questions: any[]) {
    const exam = await this.prisma.exam.findUnique({ where: { id: examId } });
    if (!exam) {
      throw new NotFoundException('Exam not found');
    }
    if (exam.teacherId !== teacherId) {
      throw new ForbiddenException('You are not the owner of this exam');
    }

    // Xoá câu cũ nếu cần? Hoặc chỉ thêm mới?
    // Thường là replace questions trong context edit đề
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

  async getTeacherQuestions(teacherId: string) {
    // Lấy tất cả câu hỏi thuộc về các đề thi của giáo viên này
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

  async updateQuestion(questionId: string, teacherId: string, data: any) {
    // Verify ownership via exam
    const question = await this.prisma.question.findUnique({
      where: { id: questionId },
      include: { exam: { select: { teacherId: true } } }
    });

    if (!question) throw new NotFoundException('Question not found');
    if (question.exam.teacherId !== teacherId) throw new ForbiddenException('Permission denied');

    return this.prisma.question.update({
      where: { id: questionId },
      data: {
        content: data.content,
        type: data.type,
        metadata: data.metadata,
      }
    });
  }

  async deleteQuestion(questionId: string, teacherId: string) {
    const question = await this.prisma.question.findUnique({
      where: { id: questionId },
      include: { exam: { select: { teacherId: true } } }
    });

    if (!question) throw new NotFoundException('Question not found');
    if (question.exam.teacherId !== teacherId) throw new ForbiddenException('Permission denied');

    return this.prisma.question.delete({ where: { id: questionId } });
  }
}
