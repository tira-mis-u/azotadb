import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateExamDto } from './dto/create-exam.dto';

@Injectable()
export class ExamService {
  constructor(private prisma: PrismaService) {}

  async create(teacherId: string, dto: CreateExamDto) {
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

  async addQuestions(examId: string, teacherId: string, questions: any[]) {
    const exam = await this.prisma.exam.findUnique({ where: { id: examId } });
    if (!exam) {
      throw new NotFoundException('Exam not found');
    }
    if (exam.teacherId !== teacherId) {
      throw new ForbiddenException('You are not the owner of this exam');
    }

    return this.prisma.question.createMany({
      data: questions.map((q) => ({
        ...q,
        examId,
      })),
    });
  }
}
