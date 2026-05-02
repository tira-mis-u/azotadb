import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

// Service for handling exam submissions
@Injectable()
export class SubmissionService {
  constructor(private prisma: PrismaService) {}

  private getDurationMs(value: number, unit: string): number {
    const unitMap: Record<string, number> = {
      MINUTE: 60 * 1000,
      HOUR: 60 * 60 * 1000,
      DAY: 24 * 60 * 60 * 1000,
      WEEK: 7 * 24 * 60 * 60 * 1000,
      MONTH: 30 * 24 * 60 * 60 * 1000,
    };
    return value * (unitMap[unit] || unitMap.MINUTE);
  }

  async startSubmission(
    publicId: string,
    userId?: string,
    guestName?: string,
    guestSessionId?: string,
  ) {
    const exam: any = await this.prisma.exam.findUnique({
      where: { publicId },
    });

    if (!exam) throw new NotFoundException('Exam not found');

    if (exam.requireLogin && !userId) {
      throw new ForbiddenException('Vui lòng đăng nhập để làm bài thi này');
    }

    if (!userId && (!guestName || !guestSessionId)) {
      throw new BadRequestException('Guest require name and session ID');
    }

    // Tìm bài làm đang dang dở
    const inProgress = await this.prisma.submission.findFirst({
      where: userId
        ? {
            examId: exam.id,
            userId,
            status: 'IN_PROGRESS',
          }
        : {
            examId: exam.id,
            guestSessionId,
            status: 'IN_PROGRESS',
          },
    });

    if (inProgress) return inProgress;

    // Đếm số lần đã nộp
    const previousAttempts = await this.prisma.submission.count({
      where: userId
        ? {
            examId: exam.id,
            userId,
          }
        : {
            examId: exam.id,
            guestSessionId,
          },
    });

    if (exam.maxAttempts > 0 && previousAttempts >= exam.maxAttempts) {
      throw new ForbiddenException(
        `Bạn đã hết số lần làm bài (Tối đa: ${exam.maxAttempts} lần)`,
      );
    }

    return (this.prisma.submission as any).create({
      data: {
        examId: exam.id,
        userId,
        guestName,
        guestSessionId,
        status: 'IN_PROGRESS',
        attemptNumber: previousAttempts + 1,
      },
    });
  }

  async getSubmission(id: string, userId?: string, guestSessionId?: string) {
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

    if (!submission) {
      throw new NotFoundException('Submission not found');
    }

    if (userId) {
      if (submission.userId !== userId)
        throw new ForbiddenException('Permission denied');
    } else {
      if (submission.guestSessionId !== guestSessionId)
        throw new ForbiddenException('Guest Session Invalid');
    }

    // Hide correct answers for exam taking
    if (submission.status === 'IN_PROGRESS') {
      submission.exam.questions = submission.exam.questions.map((q) => {
        const metadata = q.metadata as any;
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { correct_answers, correct_answer, explanation, ...rest } =
          metadata;
        q.metadata = rest;
        return q;
      });
    } else if (submission.status === 'SUBMITTED') {
      const examAny = submission.exam as any;
      if (!examAny.allowAnswerReview) {
        submission.exam.questions = submission.exam.questions.map((q) => {
          const metadata = q.metadata as any;
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { correct_answers, correct_answer, explanation, ...rest } =
            metadata;
          q.metadata = rest;
          return q;
        });
      }

      if (!examAny.allowScoreView) {
        submission.score = null;
      }
    }

    return submission;
  }

  async autosave(submissionId: string, questionId: string, answer: any, userId?: string, guestSessionId?: string) {
    const submission = await this.prisma.submission.findUnique({
      where: { id: submissionId },
    });

    if (!submission) throw new NotFoundException('Submission not found');

    if (userId) {
      if (submission.userId !== userId)
        throw new ForbiddenException('Permission denied');
    } else {
      if (submission.guestSessionId !== guestSessionId)
        throw new ForbiddenException('Guest Session Invalid');
    }

    if (!questionId) {
      throw new BadRequestException('Question ID is required');
    }

    if (submission.status === 'SUBMITTED') {
      throw new BadRequestException('Exam already submitted');
    }

    return this.prisma.submissionAnswer.upsert({
      where: {
        submissionId_questionId: {
          submissionId,
          questionId,
        },
      },
      update: {
        studentAnswer: answer,
      },
      create: {
        submissionId,
        questionId,
        studentAnswer: answer,
      },
    });
  }

  async submitExam(
    submissionId: string,
    userId?: string,
    extraData?: {
      candidateNumber?: string;
      examCode?: string;
      violations?: any[];
      guestSessionId?: string;
    },
  ) {
    const violations = extraData?.violations || [];

    return this.prisma.$transaction(async (tx) => {
      const submission = await tx.submission.findUnique({
        where: { id: submissionId },
        include: {
          exam: { include: { questions: true } },
          answers: true,
        },
      });

      if (!submission) throw new NotFoundException('Submission not found');

      if (userId) {
        if (submission.userId !== userId)
          throw new ForbiddenException('Permission denied');
      } else {
        if (submission.guestSessionId !== extraData?.guestSessionId)
          throw new ForbiddenException('Guest Session Invalid');
      }
      if (submission.status === 'SUBMITTED') {
        throw new BadRequestException('Already submitted');
      }

      // Backend verification: Check if exam has ended (only if isTimed is true)
      const exam = submission.exam as any;
      if (exam.isTimed && exam.durationValue) {
        const startTime = new Date(submission.startTime).getTime();
        const durationMs = this.getDurationMs(
          exam.durationValue,
          exam.durationUnit || 'MINUTE',
        );
        const gracePeriodMs = 2 * 60 * 1000; // 2 mins grace

        if (Date.now() > startTime + durationMs + gracePeriodMs) {
          // You could throw an error or handle auto-submit logic here
        }
      }

      let totalPoints = 0;
      let earnedPoints = 0;

      for (const question of submission.exam.questions) {
        const studentAnsRecord = submission.answers.find(
          (a) => a.questionId === question.id,
        );
        const studentAns = studentAnsRecord?.studentAnswer;
        const metadata = question.metadata as any;
        let isCorrect = false;

        if (question.type === 'TRUE_FALSE') {
          isCorrect = studentAns === metadata.correct_answer;
        } else if (question.type === 'MULTIPLE_CHOICE') {
          const correctAnswers = metadata.correct_answers;
          if (Array.isArray(correctAnswers)) {
            if (Array.isArray(studentAns)) {
              isCorrect =
                JSON.stringify([...studentAns].sort()) ===
                JSON.stringify([...correctAnswers].sort());
            } else {
              isCorrect =
                correctAnswers.length === 1 && correctAnswers[0] === studentAns;
            }
          } else {
            isCorrect = studentAns === correctAnswers;
          }
        } else if (question.type === 'TRUE_FALSE_GROUP') {
          const statements = metadata.statements || [];
          const studentAnswers = studentAns || {}; // { stmtId: boolean }

          // Grading for TRUE_FALSE_GROUP: Usually all must be correct to get point,
          // or partial credit. Here we use "all correct" for simplicity.
          isCorrect = statements.every(
            (s: any) => studentAnswers[s.id] === s.correctAnswer,
          );
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

      // Calculate scaled score based on maxScore (e.g. 10.0)
      const maxScore = (submission.exam as any).maxScore || 10.0;
      const finalScore =
        totalPoints > 0 ? (earnedPoints / totalPoints) * maxScore : 0;

      // Merge existing violations
      let finalViolations: any[] = [];
      try {
        finalViolations = Array.isArray((submission as any).violations)
          ? (submission as any).violations
          : JSON.parse(((submission as any).violations as string) || '[]');
      } catch (e) {
        finalViolations = [];
      }
      finalViolations = [...finalViolations, ...violations];

      return (tx.submission as any).update({
        where: { id: submissionId },
        data: {
          status: 'SUBMITTED',
          score: parseFloat(finalScore.toFixed(2)),
          endTime: new Date(),
          violations: finalViolations,
          candidateNumber: extraData?.candidateNumber,
          examCode: extraData?.examCode,
          scoreHidden: !(submission.exam as any).allowScoreView,
          reviewHidden: !(submission.exam as any).allowAnswerReview,
        },
      });
    });
  }

  async getMySubmissions(userId: string) {
    return this.prisma.submission.findMany({
      where: { userId },
      include: {
        exam: {
          select: {
            id: true,
            title: true,
            durationValue: true,
            durationUnit: true,
          },
        },
      },
      orderBy: { startTime: 'desc' },
    });
  }
}
