'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/components/providers/theme-provider';
import axios from 'axios';
import { Loader2, Lock, ShieldCheck, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { THPTQGExamLayout } from '@/components/ui/thptqg-exam-layout';
import { StandardExamLayout } from '@/components/ui/standard-exam-layout';
import { PracticeExamLayout } from '@/components/ui/practice-exam-layout';
import { ExamAccessGuard } from '@/components/student/exam-access-guard';
// @ts-ignore
import { debounce } from 'lodash';

interface Question {
  id: string;
  type: 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'TRUE_FALSE_GROUP' | 'ESSAY';
  content: string;
  metadata: any;
}

interface Exam {
  id: string;
  title: string;
  durationValue: number | null;
  durationUnit: string | null;
  isTimed: boolean;
  requiresPassword?: boolean;
  mode: 'STANDARD' | 'THPTQG';
  questions: Question[];
}

interface Submission {
  id: string;
  status: 'IN_PROGRESS' | 'SUBMITTED';
  startTime: string;
  exam: Exam;
  answers: { questionId: string; studentAnswer: any }[];
  violations?: any[];
}

export default function TakeExamPage() {
  const { id: examId } = useParams();
  const { session } = useAuth();
  const { theme } = useTheme();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Access State
  const [hasAccess, setHasAccess] = useState(false);
  const [accessPayload, setAccessPayload] = useState<{ password?: string; guestName?: string; guestSessionId?: string }>({});

  const fetchOrCreateSubmission = useCallback(async (payload: { password?: string; guestName?: string; guestSessionId?: string }) => {
    try {
      // Use public endpoint
      const headers: any = {};
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }
      
      const startRes = await axios.post(`/api/submissions/start/${examId}`, 
        { 
          password: payload.password,
          guestName: payload.guestName,
          guestSessionId: payload.guestSessionId
        }, 
        { headers }
      );
      const subId = startRes.data.id;

      // Pass guestSessionId to GET if present
      const subRes = await axios.get(`/api/submissions/${subId}${payload.guestSessionId ? `?guestSessionId=${payload.guestSessionId}` : ''}`, {
        headers
      });

      const data = subRes.data;
      if (data.status === 'SUBMITTED') {
        router.push(`/student/exams/${examId}/result/${subId}${payload.guestSessionId ? `?guestSessionId=${payload.guestSessionId}` : ''}`);
        return;
      }

      setSubmission(data);

      const initialAnswers: Record<string, any> = {};
      data.answers?.forEach((ans: any) => {
        initialAnswers[ans.questionId] = ans.studentAnswer;
      });
      setAnswers(initialAnswers);

      if (data.exam.isTimed && data.exam.durationValue) {
        const startTime = new Date(data.startTime).getTime();
        
        const unitMap: Record<string, number> = {
          MINUTE: 60 * 1000,
          HOUR: 60 * 60 * 1000,
          DAY: 24 * 60 * 60 * 1000,
          WEEK: 7 * 24 * 60 * 60 * 1000,
          MONTH: 30 * 24 * 60 * 60 * 1000,
        };
        const durationMs = data.exam.durationValue * (unitMap[data.exam.durationUnit || 'MINUTE'] || unitMap.MINUTE);
        const endTime = startTime + durationMs;

        const tick = () => {
          const now = Date.now();
          const diff = Math.max(0, Math.floor((endTime - now) / 1000));
          setTimeLeft(diff);
          if (diff <= 0) handleAutoSubmit(subId);
        };

        tick();
        timerRef.current = setInterval(tick, 1000);
      } else {
        setTimeLeft(null);
      }

      setLoading(false);
    } catch (err: any) {
      console.error('Failed to start exam:', err);
      alert(err.response?.data?.message || 'Không thể bắt đầu bài thi. Vui lòng thử lại.');
      router.push('/student/exams');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [examId, session, router]);

  useEffect(() => {
    if (hasAccess) {
      fetchOrCreateSubmission(accessPayload);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [hasAccess, accessPayload, fetchOrCreateSubmission]);

  const handleAccessGranted = (payload: { password?: string; guestName?: string; guestSessionId?: string }) => {
    setAccessPayload(payload);
    setHasAccess(true);
  };

  // Debounced autosave to reduce server load
  const debouncedAutosave = useCallback(
    debounce(async (subId: string, qId: string, ans: any) => {
      try {
        const headers: any = {};
        if (session?.access_token) headers['Authorization'] = `Bearer ${session.access_token}`;
        
        await axios.post(`/api/submissions/${subId}/autosave`, { 
          questionId: qId, 
          answer: ans,
          guestSessionId: accessPayload.guestSessionId
        }, { headers });
      } catch (err) {
        console.error('Autosave failed:', err);
      }
    }, 1000),
    [session, accessPayload]
  );

  const handleSelectAnswer = (questionId: string, answer: any) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
    if (submission) {
      debouncedAutosave(submission.id, questionId, answer);
    }
  };

  const handleAutoSubmit = async (subId?: string) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    const id = subId || submission?.id;
    if (!id) return;
    try {
      const headers: any = {};
      if (session?.access_token) headers['Authorization'] = `Bearer ${session.access_token}`;

      await axios.post(`/api/submissions/${id}/submit`, {
        guestSessionId: accessPayload.guestSessionId
      }, { headers });
      if (timerRef.current) clearInterval(timerRef.current);
      router.push(`/student/exams/${examId}/result/${id}${accessPayload.guestSessionId ? `?guestSessionId=${accessPayload.guestSessionId}` : ''}`);
    } catch (err) {
      console.error('Auto-submit failed:', err);
    }
  };

  const manualSubmit = async (thptData?: { candidateNumber: string; examCode: string }) => {
    if (!submission) return;
    setIsSubmitting(true);
    try {
      const headers: any = {};
      if (session?.access_token) headers['Authorization'] = `Bearer ${session.access_token}`;

      await axios.post(`/api/submissions/${submission.id}/submit`, {
        candidateNumber: thptData?.candidateNumber,
        examCode: thptData?.examCode,
        guestSessionId: accessPayload.guestSessionId
      }, { headers });
      
      if (timerRef.current) clearInterval(timerRef.current);
      router.push(`/student/exams/${examId}/result/${submission.id}${accessPayload.guestSessionId ? `?guestSessionId=${accessPayload.guestSessionId}` : ''}`);
    } catch (err) {
      alert('Nộp bài thất bại. Vui lòng thử lại.');
      setIsSubmitting(false);
    }
  };

  if (!hasAccess) {
    return <ExamAccessGuard publicId={examId as string} onAccessGranted={handleAccessGranted} />;
  }

  if (loading) {
    return (
      <div style={{ backgroundColor: 'var(--background)' }} className="min-h-screen flex flex-col items-center justify-center">
        <Loader2 style={{ color: 'var(--primary)' }} className="w-10 h-10 animate-spin mb-4" />
        <p style={{ color: 'var(--muted-foreground)' }} className="font-medium">Đang chuẩn bị đề thi...</p>
      </div>
    );
  }

  // Phương án B: Chuyển đổi Layout dựa trên mode của đề thi
  // Layout switching based on mode
  if (submission?.exam.mode === 'PRACTICE') {
    return (
      <PracticeExamLayout
        exam={submission.exam}
        questions={submission.exam.questions}
        onFinish={() => manualSubmit()}
      />
    );
  }

  if (submission?.exam.mode === 'THPTQG') {
    return (
      <THPTQGExamLayout
        exam={submission.exam}
        questions={submission.exam.questions}
        answers={answers}
        onAnswer={handleSelectAnswer}
        timeLeft={timeLeft || 0}
        onSubmit={manualSubmit}
        violations={submission.violations || []}
      />
    );
  }

  return (
    <StandardExamLayout
      exam={submission!.exam}
      questions={submission!.exam.questions}
      answers={answers}
      onAnswer={handleSelectAnswer}
      timeLeft={timeLeft || 0}
      onSubmit={() => manualSubmit()}
    />
  );
}
