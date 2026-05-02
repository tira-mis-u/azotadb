import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getTeacherStats(userId: string) {
    const db: any = this.prisma;

    // Parallel fetch
    const [
      examCount,
      submissionCount,
      questionCount,
      avgScoreResult,
      submissions,
      recentExams,
    ] = await Promise.all([
      db.exam.count({ where: { teacherId: userId } }),
      db.submission.count({ where: { exam: { teacherId: userId } } }),
      db.question.count({ where: { exam: { teacherId: userId } } }),
      db.submission.aggregate({
        where: { exam: { teacherId: userId }, status: 'SUBMITTED' },
        _avg: { score: true },
      }),
      db.submission.findMany({
        where: { exam: { teacherId: userId }, status: 'SUBMITTED' },
        include: {
          _count: { select: { answers: true } },
          answers: { where: { isCorrect: true } },
        },
      }),
      db.exam.findMany({
        where: { teacherId: userId },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
    ]);

    let totalCorrect = 0;
    let totalAnswers = 0;
    submissions.forEach((s) => {
      totalCorrect += s.answers.length;
      totalAnswers += s._count.answers;
    });
    const accuracyRate =
      totalAnswers > 0
        ? ((totalCorrect / totalAnswers) * 100).toFixed(1)
        : '0.0';

    return {
      stats: {
        exams: examCount,
        submissions: submissionCount,
        questions: questionCount,
        avgScore: avgScoreResult._avg.score?.toFixed(1) || '0.0',
        accuracyRate,
      },
      recentActivity: recentExams.map((exam) => ({
        id: exam.id,
        title: exam.title,
        createdAt: exam.createdAt,
      })),
    };
  }

  async getStudentStats(userId: string) {
    const db: any = this.prisma;

    // Parallel fetch
    const [submissionCount, avgScoreResult, wrongAnswers, recentSubmissions] =
      await Promise.all([
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

    // Calculate topics from wrong answers
    const weakTopics = Array.from(
      new Set(wrongAnswers.map((a) => a.question.metadata.topic || 'Chung')),
    ).slice(0, 3);

    return {
      stats: {
        examsDone: submissionCount,
        avgScore: avgScoreResult._avg.score?.toFixed(1) || '0.0',
        streak: 3, // Giả lập
        bookmarks: 0,
      },
      weakTopics,
      recentExams: recentSubmissions.map((s) => ({
        id: s.id,
        name: s.exam.title,
        score: s.score?.toFixed(1) || 'N/A',
        time: s.startTime,
      })),
    };
  }
}
