import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SubmissionService {
  constructor(private prisma: PrismaService) {}

  async startSubmission(examId: string, userId: string) {
    // Kiểm tra xem đã bắt đầu chưa
    const existing = await this.prisma.submission.findUnique({
      where: {
        examId_userId: { examId, userId },
      },
    });

    if (existing) return existing;

    return this.prisma.submission.create({
      data: {
        examId,
        userId,
        status: 'IN_PROGRESS',
      },
    });
  }

  async submitExam(submissionId: string, studentAnswers: Record<string, any>) {
    return this.prisma.$transaction(async (tx) => {
      const submission = await tx.submission.findUnique({
        where: { id: submissionId },
        include: { exam: { include: { questions: true } } },
      });

      if (!submission) throw new NotFoundException('Submission not found');
      if (submission.status === 'SUBMITTED') {
        throw new BadRequestException('Already submitted');
      }

      let totalScore = 0;
      const answerRecords: any[] = [];

      for (const question of submission.exam.questions) {
        const studentAns = studentAnswers[question.id];
        const metadata = question.metadata as any;
        const correctAnswers = metadata.correct_answers;

        // Chấm điểm trắc nghiệm cơ bản
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

  async getMySubmissions(userId: string) {
    return this.prisma.submission.findMany({
      where: { userId },
      include: { exam: { select: { title: true } } },
    });
  }
}
