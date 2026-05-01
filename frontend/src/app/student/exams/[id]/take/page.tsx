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

interface Question {
  id: string;
  type: 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'TRUE_FALSE_GROUP' | 'ESSAY';
  content: string;
  metadata: any;
}

interface Exam {
  id: string;
  title: string;
  duration: number | null;
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
  const [password, setPassword] = useState('');
  const [showPasswordScreen, setShowPasswordScreen] = useState(false);
  const [isVerifyingPassword, setIsVerifyingPassword] = useState(false);
  const [passError, setPassError] = useState('');
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const fetchOrCreateSubmission = useCallback(async (examPassword?: string) => {
    if (!session?.access_token) return;
    try {
      setIsVerifyingPassword(true);
      setPassError('');
      
      const startRes = await axios.post(`/api/submissions/start/${examId}`, 
        { password: examPassword }, 
        { headers: { Authorization: `Bearer ${session.access_token}` } }
      );
      const subId = startRes.data.id;

      const subRes = await axios.get(`/api/submissions/${subId}`, {
        headers: { Authorization: `Bearer ${session.access_token}` }
      });

      const data = subRes.data;
      if (data.status === 'SUBMITTED') {
        router.push(`/student/exams/${examId}/result/${subId}`);
        return;
      }

      setSubmission(data);
      setShowPasswordScreen(false);

      const initialAnswers: Record<string, any> = {};
      data.answers?.forEach((ans: any) => {
        initialAnswers[ans.questionId] = ans.studentAnswer;
      });
      setAnswers(initialAnswers);

      if (data.exam.isTimed && data.exam.duration) {
        const startTime = new Date(data.startTime).getTime();
        const durationMs = data.exam.duration * 60 * 1000;
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
      if (err.response?.status === 403 || err.response?.status === 401) {
        setShowPasswordScreen(true);
        if (examPassword) setPassError('Mật khẩu không chính xác.');
        setLoading(false);
      } else {
        console.error('Failed to start exam:', err);
        alert('Không thể bắt đầu bài thi. Vui lòng thử lại.');
        router.push('/student/exams');
      }
    } finally {
      setIsVerifyingPassword(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [examId, session, router]);

  useEffect(() => {
    fetchOrCreateSubmission();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [fetchOrCreateSubmission]);

  const handleAutosave = async (questionId: string, answer: any) => {
    if (!submission) return;
    try {
      await axios.post(`/api/submissions/${submission.id}/autosave`, { questionId, answer }, {
        headers: { Authorization: `Bearer ${session!.access_token}` }
      });
    } catch (err) {
      console.error('Autosave failed:', err);
    }
  };

  const handleSelectAnswer = (questionId: string, answer: any) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
    handleAutosave(questionId, answer);
  };

  const handleAutoSubmit = async (subId?: string) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    const id = subId || submission?.id;
    if (!id) return;
    try {
      await axios.post(`/api/submissions/${id}/submit`, {}, {
        headers: { Authorization: `Bearer ${session!.access_token}` }
      });
      if (timerRef.current) clearInterval(timerRef.current);
      router.push(`/student/exams/${examId}/result/${id}`);
    } catch (err) {
      console.error('Auto-submit failed:', err);
    }
  };

  const manualSubmit = async (thptData?: { candidateNumber: string; examCode: string }) => {
    if (!submission) return;
    setIsSubmitting(true);
    try {
      await axios.post(`/api/submissions/${submission.id}/submit`, {
        candidateNumber: thptData?.candidateNumber,
        examCode: thptData?.examCode
      }, {
        headers: { Authorization: `Bearer ${session!.access_token}` }
      });
      if (timerRef.current) clearInterval(timerRef.current);
      router.push(`/student/exams/${examId}/result/${submission.id}`);
    } catch (err) {
      alert('Nộp bài thất bại. Vui lòng thử lại.');
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ backgroundColor: 'var(--background)' }} className="min-h-screen flex flex-col items-center justify-center">
        <Loader2 style={{ color: 'var(--primary)' }} className="w-10 h-10 animate-spin mb-4" />
        <p style={{ color: 'var(--muted-foreground)' }} className="font-medium">Đang chuẩn bị đề thi...</p>
      </div>
    );
  }

  if (showPasswordScreen) {
    return (
      <div style={{ backgroundColor: 'var(--background)' }} className="min-h-screen flex flex-col items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
          className="max-w-md w-full rounded-3xl p-8 shadow-2xl border space-y-8 text-center"
        >
           <div style={{ backgroundColor: 'var(--accent)', color: 'var(--primary)' }} className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-2">
              <Lock size={32} />
           </div>
           <div>
              <h2 style={{ color: 'var(--foreground)' }} className="text-2xl font-black">Bảo mật đề thi</h2>
              <p style={{ color: 'var(--muted-foreground)' }} className="text-sm mt-2">Vui lòng nhập mật khẩu được cung cấp bởi giáo viên để bắt đầu làm bài.</p>
           </div>
           
           <div className="space-y-4">
             <div className="relative">
               <input
                 type="password"
                 value={password}
                 onChange={(e) => setPassword(e.target.value)}
                 placeholder="Nhập mật khẩu"
                 style={{ 
                   backgroundColor: 'var(--input)', 
                   borderColor: passError ? '#ef4444' : 'var(--border)', 
                   color: 'var(--foreground)' 
                 }}
                 className="w-full px-6 py-4 rounded-2xl border text-center font-bold text-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                 autoFocus
                 onKeyDown={(e) => e.key === 'Enter' && password && fetchOrCreateSubmission(password)}
               />
               {passError && <p className="text-red-500 text-xs mt-2 font-bold">{passError}</p>}
             </div>

             <button
               onClick={() => fetchOrCreateSubmission(password)}
               disabled={isVerifyingPassword || !password}
               style={{ 
                 backgroundColor: 'var(--primary)', 
                 color: 'var(--primary-foreground)',
                 boxShadow: theme === 'neon' ? '0 0 20px var(--primary)' : 'none'
               }}
               className="w-full py-4 disabled:opacity-50 font-black rounded-2xl transition-all uppercase tracking-widest text-xs flex items-center justify-center gap-2"
             >
               {isVerifyingPassword ? <Loader2 size={16} className="animate-spin" /> : <ShieldCheck size={16} />}
               {isVerifyingPassword ? 'Đang xác thực...' : 'Bắt đầu ngay'}
             </button>

             <button 
               onClick={() => router.push('/student/exams')} 
               style={{ color: 'var(--muted-foreground)' }}
               className="flex items-center justify-center gap-2 w-full text-xs font-bold hover:text-indigo-600 uppercase tracking-widest transition-colors py-2"
             >
               <ArrowLeft size={14} />
               Quay lại danh sách
             </button>
           </div>
        </motion.div>
      </div>
    );
  }

  // Phương án B: Chuyển đổi Layout dựa trên mode của đề thi
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
