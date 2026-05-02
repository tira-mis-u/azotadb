'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import axios from 'axios';
import {
  Trophy, CheckCircle2, XCircle, Clock,
  ArrowLeft, BarChart3, HelpCircle,
  ChevronDown, ChevronUp, Loader2, Zap, Target, Award, Printer
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { MarkdownRenderer } from '@/components/ui/markdown-renderer';

export default function ResultPage() {
  const { id: submissionId } = useParams();
  const { session } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submission, setSubmission] = useState<any>(null);
  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null);

  useEffect(() => {
    const fetchResult = async () => {
      if (!session?.access_token) return;
      try {
        const res = await axios.get(`/api/submissions/${submissionId}`, {
          headers: { Authorization: `Bearer ${session.access_token}` }
        });
        setSubmission(res.data);
      } catch (err) {
        console.error('Failed to fetch result:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchResult();
  }, [submissionId, session]);

  if (loading || !submission) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground">
        <div className="relative">
           <Loader2 className="w-16 h-16 text-primary animate-spin" />
           <div className="absolute inset-0 flex items-center justify-center">
              <Zap className="w-6 h-6 text-primary animate-pulse" />
           </div>
        </div>
        <p className="mt-8 text-xs font-black uppercase tracking-[0.3em] text-muted-foreground animate-pulse">Đang giải mã kết quả bài thi...</p>
      </div>
    );
  }

  const correctCount = submission.answers?.filter((a: any) => a.isCorrect).length || 0;
  const totalQuestions = submission.exam.questions.length;
  const accuracy = Math.round((correctCount / totalQuestions) * 100) || 0;
  const score = submission.score || 0;

  return (
    <div className="p-10 max-w-5xl mx-auto space-y-12 animate-in fade-in duration-700">
      {/* Header / Summary Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-card rounded-[3.5rem] p-12 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] border border-border text-center relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-3 bg-linear-to-r from-primary via-purple-500 to-success" />
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/10 rounded-full blur-3xl opacity-50" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-success/10 rounded-full blur-3xl opacity-50" />
        
        <motion.div 
          initial={{ rotate: -20, scale: 0.5 }}
          animate={{ rotate: 0, scale: 1 }}
          transition={{ type: 'spring', damping: 10 }}
          className="w-24 h-24 bg-primary/10 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-inner"
        >
          <Trophy className="w-12 h-12 text-primary drop-shadow-[0_0_15px_rgba(var(--primary-rgb),0.5)]" />
        </motion.div>

        <h1 className="text-4xl md:text-5xl font-black text-foreground mb-3 tracking-tighter uppercase">CHINH PHỤC THÀNH CÔNG!</h1>
        <p className="text-muted-foreground mb-12 font-black uppercase tracking-[0.2em] opacity-60">{submission.exam.title}</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="space-y-2">
            <p className="text-6xl font-black text-primary tracking-tighter leading-none">{score.toFixed(1)}</p>
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em]">TỔNG ĐIỂM HỆ 10</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="space-y-2 border-y md:border-y-0 md:border-x border-border/50 py-8 md:py-0">
            <p className="text-6xl font-black text-success tracking-tighter leading-none">{correctCount}<span className="text-2xl text-muted-foreground opacity-30">/{totalQuestions}</span></p>
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em]">CÂU TRẢ LỜI ĐÚNG</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="space-y-2">
            <p className="text-6xl font-black text-amber-500 tracking-tighter leading-none">{accuracy}%</p>
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em]">ĐỘ CHÍNH XÁC</p>
          </motion.div>
        </div>
      </motion.div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-6">
        <Link
          href="/student/exams"
          className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-card border border-border text-foreground font-black text-xs uppercase tracking-widest hover:bg-muted transition-all shadow-xl shadow-primary/5"
        >
          <ArrowLeft className="w-5 h-5" /> QUAY LẠI KHO ĐỀ
        </Link>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-3 px-10 py-4 rounded-2xl bg-primary text-primary-foreground font-black text-xs uppercase tracking-widest shadow-2xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all"
        >
          <Printer className="w-5 h-5" /> XUẤT KẾT QUẢ
        </button>
      </div>

      {/* Answer Review Section */}
      <div className="space-y-8 pt-6">
        <div className="flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
             <Target className="text-primary w-6 h-6" />
             <h2 className="text-2xl font-black text-foreground tracking-tighter uppercase">PHÂN TÍCH CHI TIẾT BÀI LÀM</h2>
          </div>
          <span className="hidden md:block text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] opacity-40">Bấm vào câu hỏi để xem giải thích</span>
        </div>

        <div className="grid gap-6">
          {submission.exam.questions.map((q: any, idx: number) => {
            const answer = submission.answers?.find((a: any) => a.questionId === q.id);
            const isCorrect = answer?.isCorrect;
            const isExpanded = expandedQuestion === q.id;

            return (
              <motion.div
                key={q.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className={cn(
                  "bg-card rounded-[2.5rem] border transition-all duration-500 overflow-hidden group",
                  isCorrect 
                    ? "border-success/30 hover:border-success/50 shadow-xl shadow-success/5" 
                    : "border-destructive/30 hover:border-destructive/50 shadow-xl shadow-destructive/5"
                )}
              >
                <button
                  onClick={() => setExpandedQuestion(isExpanded ? null : q.id)}
                  className="w-full flex items-center justify-between p-8 text-left"
                >
                  <div className="flex items-center gap-8 min-w-0">
                    <div className={cn(
                      "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-inner group-hover:scale-110 transition-transform",
                      isCorrect ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
                    )}>
                      {isCorrect ? <CheckCircle2 className="w-6 h-6" /> : <XCircle className="w-6 h-6" />}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] mb-2 flex items-center gap-2">
                        CÂU HỎI SỐ {idx + 1} • <span className={isCorrect ? "text-success" : "text-destructive"}>{isCorrect ? 'ĐÚNG' : 'SAI'}</span>
                      </p>
                      <div className="text-lg font-bold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                         <MarkdownRenderer content={q.content} />
                      </div>
                    </div>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center shrink-0">
                     {isExpanded ? <ChevronUp className="w-5 h-5 opacity-50" /> : <ChevronDown className="w-5 h-5 opacity-50" />}
                  </div>
                </button>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-border bg-muted/10"
                    >
                      <div className="p-10 space-y-8">
                        <div className="text-xl font-bold text-foreground leading-relaxed animate-in fade-in slide-in-from-top-2">
                           <MarkdownRenderer content={q.content} />
                        </div>

                        {q.type === 'MULTIPLE_CHOICE' && (
                          <div className="grid grid-cols-1 gap-4">
                            {(q.metadata as any).choices?.map((choice: any) => {
                              const isStudentChoice = answer?.studentAnswer?.includes(choice.id);
                              const isCorrectChoice = (q.metadata as any).correct_answers?.includes(choice.id);
                              
                              return (
                                <div
                                  key={choice.id}
                                  className={cn(
                                    "flex items-center gap-6 p-6 rounded-[1.75rem] border text-sm transition-all duration-300",
                                    isCorrectChoice 
                                      ? "bg-success/5 border-success/40 shadow-lg shadow-success/5" 
                                      : isStudentChoice
                                        ? "bg-destructive/5 border-destructive/40"
                                        : "bg-background border-border"
                                  )}
                                >
                                  <div className={cn(
                                    "w-10 h-10 rounded-xl flex items-center justify-center font-black shrink-0 shadow-inner",
                                    isCorrectChoice ? "bg-success text-white" : "bg-muted text-muted-foreground"
                                  )}>
                                    {choice.id}
                                  </div>
                                  <span className={cn("flex-1 font-bold", isCorrectChoice ? "text-foreground" : "text-muted-foreground")}>
                                     {choice.content}
                                  </span>
                                  {isCorrectChoice && <CheckCircle2 className="w-5 h-5 text-success animate-in zoom-in" />}
                                  {isStudentChoice && !isCorrectChoice && <XCircle className="w-5 h-5 text-destructive animate-in zoom-in" />}
                                  {isStudentChoice && (
                                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-4 bg-muted px-3 py-1 rounded-lg">BẠN CHỌN</span>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {q.type === 'ESSAY' && (
                          <div className="space-y-4">
                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.25em]">Phần tự luận của bạn:</p>
                            <div className="p-8 rounded-[2rem] bg-background border border-border text-base text-foreground font-medium leading-relaxed italic shadow-inner">
                              {answer?.studentAnswer || '(HỆ THỐNG KHÔNG GHI NHẬN CÂU TRẢ LỜI)'}
                            </div>
                          </div>
                        )}

                        {(q.metadata as any).explanation && (
                          <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-8 rounded-[2.5rem] bg-primary/5 border border-primary/20 relative overflow-hidden"
                          >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-2xl" />
                            <div className="flex items-center gap-3 mb-4">
                               <Award className="w-5 h-5 text-primary" />
                               <p className="text-[10px] font-black text-primary uppercase tracking-[0.25em]">Giải thích từ Hội đồng Chuyên môn:</p>
                            </div>
                            <p className="text-base text-foreground font-bold italic leading-loose opacity-90">
                              {(q.metadata as any).explanation}
                            </p>
                          </motion.div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
