'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import useSWR from 'swr';
import axios from 'axios';
import { useParams, useRouter } from 'next/navigation';
import { PracticeEngine } from '@/components/ui/practice-engine';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, BookOpen, Flame } from 'lucide-react';
import Link from 'next/link';

const fetcher = (url: string, token: string) => 
  axios.get(url, { headers: { Authorization: `Bearer ${token}` } }).then(res => res.data);

export default function PracticePage() {
  const { session, loading: authLoading } = useAuth();
  const { id } = useParams();
  const router = useRouter();
  const [isFinished, setIsFinished] = useState(false);
  const [stats, setStats] = useState<any>(null);

  const { data: exam, error, isLoading } = useSWR(
    session?.access_token && id ? [`/api/exams/${id}`, session.access_token] : null,
    ([url, token]) => fetcher(url, token)
  );

  if (authLoading || isLoading) {
    return (
      <div className="p-8 max-w-4xl mx-auto space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-[500px] w-full rounded-3xl" />
      </div>
    );
  }

  if (error || !exam) {
    return (
      <div className="p-8 text-center text-red-500">
        Đã có lỗi xảy ra hoặc không tìm thấy đề thi.
      </div>
    );
  }

  const handleFinish = (finalStats: any) => {
    setStats(finalStats);
    setIsFinished(true);
  };

  if (isFinished) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white dark:bg-gray-900 p-8 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 text-center space-y-6">
          <div className="w-20 h-20 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mx-auto">
            <Flame className="w-10 h-10 text-orange-500" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-gray-900 dark:text-white">Hoàn thành luyện tập!</h2>
            <p className="text-gray-500 mt-2">Bạn đã hoàn thành bộ câu hỏi của đề này.</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4 py-6 border-y border-gray-100 dark:border-gray-800">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase">Câu đúng</p>
              <p className="text-3xl font-black text-emerald-500">{stats?.correct}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase">Max Streak</p>
              <p className="text-3xl font-black text-orange-500">{stats?.maxStreak}</p>
            </div>
          </div>

          <div className="space-y-3 pt-4">
            <button 
              onClick={() => { setIsFinished(false); setStats(null); }}
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-500/20"
            >
              Luyện tập lại
            </button>
            <Link href="/student/exams" className="block w-full py-4 border-2 border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-300 font-bold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all">
              Về trang chủ
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-10 px-6 py-4 flex items-center gap-4">
        <Link href={`/student/exams/${id}`} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors text-gray-500">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg">
            <BookOpen className="w-4 h-4 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-gray-900 dark:text-white line-clamp-1">{exam.title}</h1>
            <p className="text-xs text-gray-500">Chế độ luyện tập (Không tính điểm)</p>
          </div>
        </div>
      </div>

      {/* Engine */}
      <div className="py-8">
        <PracticeEngine questions={exam.questions} onFinish={handleFinish} />
      </div>
    </div>
  );
}
