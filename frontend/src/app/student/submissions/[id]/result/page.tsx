'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import axios from 'axios';
import {
  Trophy, CheckCircle2, XCircle, Clock,
  ArrowLeft, RefreshCw, BarChart3, HelpCircle,
  ChevronDown, ChevronUp, Loader2
} from 'lucide-react';
import Link from 'next/link';

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
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
        <p className="text-gray-500 font-medium">Đang tải kết quả bài thi...</p>
      </div>
    );
  }

  const correctCount = submission.answers?.filter((a: any) => a.isCorrect).length || 0;
  const totalQuestions = submission.exam.questions.length;
  const accuracy = Math.round((correctCount / totalQuestions) * 100) || 0;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* Header / Summary Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-900 rounded-[2.5rem] p-10 shadow-xl shadow-indigo-500/5 border border-gray-100 dark:border-gray-800 text-center relative overflow-hidden mb-8"
      >
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500" />
        
        <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-900/30 rounded-3xl flex items-center justify-center mx-auto mb-6">
          <Trophy className="w-10 h-10 text-indigo-600" />
        </div>

        <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-2">Kết quả bài thi</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-10 font-medium">{submission.exam.title}</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex flex-col items-center">
            <p className="text-4xl font-black text-indigo-600 mb-1">{submission.score?.toFixed(1) || '0.0'}</p>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Tổng điểm</p>
          </div>
          <div className="flex flex-col items-center border-x border-gray-100 dark:border-gray-800">
            <p className="text-4xl font-black text-emerald-500 mb-1">{correctCount}/{totalQuestions}</p>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Số câu đúng</p>
          </div>
          <div className="flex flex-col items-center">
            <p className="text-4xl font-black text-amber-500 mb-1">{accuracy}%</p>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Độ chính xác</p>
          </div>
        </div>
      </motion.div>

      {/* Action Buttons */}
      <div className="flex items-center justify-center gap-4 mb-12">
        <Link
          href="/student/exams"
          className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 text-gray-600 dark:text-gray-300 font-bold text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-all shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" /> Quay lại danh sách
        </Link>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm transition-all shadow-lg shadow-indigo-500/25"
        >
          <BarChart3 className="w-4 h-4" /> In kết quả
        </button>
      </div>

      {/* Answer Review Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-gray-400" /> Xem lại bài làm
          </h2>
          <span className="text-xs text-gray-400 font-medium italic">Bấm vào câu hỏi để xem chi tiết</span>
        </div>

        {submission.exam.questions.map((q: any, idx: number) => {
          const answer = submission.answers?.find((a: any) => a.questionId === q.id);
          const isCorrect = answer?.isCorrect;
          const isExpanded = expandedQuestion === q.id;

          return (
            <div
              key={q.id}
              className={`bg-white dark:bg-gray-900 rounded-3xl border transition-all overflow-hidden ${
                isCorrect 
                  ? 'border-emerald-100 dark:border-emerald-900/30' 
                  : 'border-red-100 dark:border-red-900/30'
              }`}
            >
              <button
                onClick={() => setExpandedQuestion(isExpanded ? null : q.id)}
                className="w-full flex items-center justify-between p-6 text-left"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                    isCorrect 
                      ? 'bg-emerald-50 text-emerald-500 dark:bg-emerald-900/20' 
                      : 'bg-red-50 text-red-500 dark:bg-red-900/20'
                  }`}>
                    {isCorrect ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase mb-0.5">Câu {idx + 1}</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white line-clamp-1">{q.content}</p>
                  </div>
                </div>
                {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
              </button>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-gray-50 dark:border-gray-800"
                  >
                    <div className="p-6 space-y-4">
                      <div className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                        {q.content}
                      </div>

                      {q.type === 'MULTIPLE_CHOICE' && (
                        <div className="grid grid-cols-1 gap-2">
                          {(q.metadata as any).choices?.map((choice: any) => {
                            const isStudentChoice = answer?.studentAnswer?.includes(choice.id);
                            const isCorrectChoice = (q.metadata as any).correct_answers?.includes(choice.id);
                            
                            let bgColor = 'bg-gray-50 dark:bg-gray-800/50';
                            let borderColor = 'border-gray-100 dark:border-gray-800';
                            let icon = null;

                            if (isCorrectChoice) {
                              bgColor = 'bg-emerald-50 dark:bg-emerald-900/20';
                              borderColor = 'border-emerald-200 dark:border-emerald-800';
                              icon = <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />;
                            } else if (isStudentChoice && !isCorrectChoice) {
                              bgColor = 'bg-red-50 dark:bg-red-900/20';
                              borderColor = 'border-red-200 dark:border-red-800';
                              icon = <XCircle className="w-3.5 h-3.5 text-red-500" />;
                            }

                            return (
                              <div
                                key={choice.id}
                                className={`flex items-center gap-3 p-3 rounded-xl border text-xs transition-all ${bgColor} ${borderColor}`}
                              >
                                <div className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold shrink-0 ${
                                  isCorrectChoice ? 'bg-emerald-500 text-white' : 'bg-white dark:bg-gray-800 text-gray-400 border border-gray-100 dark:border-gray-700'
                                }`}>
                                  {choice.id}
                                </div>
                                <span className="flex-1 font-medium">{choice.content}</span>
                                {icon}
                                {isStudentChoice && <span className="text-[10px] font-bold text-gray-400 uppercase ml-2">Bài làm của bạn</span>}
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {q.type === 'ESSAY' && (
                        <div className="space-y-2">
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Bài làm của bạn:</p>
                          <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 text-sm text-gray-700 dark:text-gray-300">
                            {answer?.studentAnswer || '(Không có câu trả lời)'}
                          </div>
                        </div>
                      )}

                      {(q.metadata as any).explanation && (
                        <div className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800">
                          <p className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-1">Giải thích:</p>
                          <p className="text-xs text-indigo-700 dark:text-indigo-300 leading-relaxed">
                            {(q.metadata as any).explanation}
                          </p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}
