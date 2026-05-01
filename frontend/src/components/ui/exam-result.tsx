'use client';

import React from 'react';
import { Button } from './button';
import { CheckCircle2, Award, ArrowLeft, Eye, MessageSquareQuote, BarChart3 } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface ExamResultProps {
  exam: any;
  submission: any;
  onViewDetails?: () => void;
}

export function ExamResult({ exam, submission, onViewDetails }: ExamResultProps) {
  const showScore = exam.allowScoreView;
  const showReview = exam.allowAnswerReview;
  
  const accuracy = submission.score && exam.maxScore 
    ? Math.round((submission.score / exam.maxScore) * 100) 
    : 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl w-full bg-white dark:bg-gray-950 rounded-[2.5rem] shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden"
      >
        <div className="p-12 text-center space-y-8">
          <div className="relative inline-block">
             <div className="absolute inset-0 bg-emerald-500 blur-3xl opacity-20 animate-pulse" />
             <div className="relative w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/40">
                <CheckCircle2 className="w-12 h-12 text-white" />
             </div>
          </div>

          <div>
             <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-2">Nộp bài thành công!</h1>
             <p className="text-gray-500 dark:text-gray-400">Hệ thống đã ghi nhận kết quả bài thi của bạn.</p>
          </div>

          {showScore ? (
            <div className="grid grid-cols-2 gap-4 py-8 border-y border-gray-100 dark:border-gray-800">
              <div className="space-y-1">
                 <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Điểm số</p>
                 <p className="text-5xl font-black text-indigo-600 dark:text-indigo-400">
                    {submission.score}
                    <span className="text-lg text-gray-300 dark:text-gray-600"> / {exam.maxScore}</span>
                 </p>
              </div>
              <div className="space-y-1">
                 <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Độ chính xác</p>
                 <p className="text-5xl font-black text-emerald-500">{accuracy}%</p>
              </div>
            </div>
          ) : (
            <div className="py-12 bg-gray-50 dark:bg-gray-900/50 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-800">
               <Award className="w-10 h-10 text-indigo-400 mx-auto mb-3" />
               <p className="text-sm font-bold text-gray-400 uppercase">Điểm số sẽ được công bố sau</p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Link href="/student/exams" className="flex-1">
              <Button variant="outline" className="w-full h-14 rounded-2xl gap-2 font-bold border-2">
                 <ArrowLeft className="w-5 h-5" /> Về trang chủ
              </Button>
            </Link>
            
            {showReview && (
              <Button 
                onClick={onViewDetails}
                className="flex-1 h-14 rounded-2xl gap-2 font-bold bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-500/30"
              >
                 <Eye className="w-5 h-5" /> Xem đáp án chi tiết
              </Button>
            )}
          </div>
        </div>

        {/* Footer Info */}
        <div className="bg-gray-50 dark:bg-gray-900/80 px-12 py-6 flex items-center justify-center gap-8 text-xs font-bold text-gray-400">
           <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" /> 
              THỐNG KÊ CHI TIẾT
           </div>
           <div className="flex items-center gap-2">
              <MessageSquareQuote className="w-4 h-4" />
              BÌNH LUẬN
           </div>
        </div>
      </motion.div>
    </div>
  );
}
