'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import useSWR from 'swr';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  History, Clock, Calendar, Search, Filter, 
  ArrowRight, Award, ChevronDown, BookOpen 
} from 'lucide-react';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';

const fetcher = (url: string, token: string) => 
  axios.get(url, { headers: { Authorization: `Bearer ${token}` } }).then(res => res.data);

export default function StudentHistoryPage() {
  const { session, loading: authLoading } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  
  const { data: submissions, error, isLoading } = useSWR(
    session?.access_token ? ['/api/submissions/my/list', session.access_token] : null,
    ([url, token]) => fetcher(url, token)
  );

  const filteredSubmissions = submissions?.filter((s: any) => 
    s.exam?.title?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const isPageLoading = authLoading || isLoading;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SUBMITTED': return 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800/50';
      case 'IN_PROGRESS': return 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400 border-amber-100 dark:border-amber-800/50';
      default: return 'bg-gray-50 text-gray-600 dark:bg-gray-900/20 dark:text-gray-400 border-gray-100 dark:border-gray-800/50';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'SUBMITTED': return 'Đã nộp bài';
      case 'IN_PROGRESS': return 'Đang làm';
      default: return status;
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
            <History className="w-8 h-8 text-indigo-500" />
            Lịch sử làm bài
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2 text-base max-w-2xl">
            Theo dõi chi tiết tất cả các bài kiểm tra bạn đã thực hiện và xem lại đáp án.
          </p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-center gap-4 bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
        <div className="relative w-full sm:flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm tên đề thi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800/50 border border-transparent dark:border-gray-700 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 text-sm font-medium rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all w-full sm:w-auto">
            <Filter className="w-4 h-4" /> Trạng thái <ChevronDown className="w-3 h-3 ml-1" />
          </button>
        </div>
      </div>

      {/* Content */}
      {isPageLoading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-900 rounded-2xl p-4 md:p-6 border border-gray-100 dark:border-gray-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="flex items-start gap-4">
                <Skeleton className="w-12 h-12 rounded-xl shrink-0" />
                <div className="space-y-2">
                  <Skeleton className="h-5 w-48 rounded-md" />
                  <Skeleton className="h-4 w-32 rounded-md" />
                </div>
              </div>
              <div className="flex items-center gap-4 w-full md:w-auto">
                <Skeleton className="h-10 w-24 rounded-xl" />
                <Skeleton className="h-10 w-10 rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="p-8 text-center text-red-500 bg-red-50 dark:bg-red-900/10 rounded-2xl border border-red-100 dark:border-red-900/30">
          <p>Lỗi khi tải lịch sử. Vui lòng thử lại sau.</p>
        </div>
      ) : filteredSubmissions.length > 0 ? (
        <div className="space-y-4">
          <AnimatePresence>
            {filteredSubmissions.map((sub: any, i: number) => (
              <motion.div
                key={sub.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2, delay: i * 0.05 }}
                className="group bg-white dark:bg-gray-900 rounded-2xl p-4 md:p-6 border border-gray-100 dark:border-gray-800 hover:border-indigo-200 dark:hover:border-indigo-800 hover:shadow-lg hover:shadow-indigo-500/5 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
              >
                <div className="flex items-start gap-4 flex-1">
                  <div className="w-12 h-12 rounded-xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-400 group-hover:bg-indigo-50 group-hover:text-indigo-500 dark:group-hover:bg-indigo-900/30 transition-colors shrink-0">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white mb-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1">
                      {sub.exam?.title || 'Đề thi không xác định'}
                    </h3>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-gray-400 font-medium">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(sub.startTime).toLocaleDateString('vi-VN')} {new Date(sub.startTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {sub.exam?.duration} phút
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between w-full md:w-auto gap-4 pt-4 md:pt-0 border-t border-gray-50 dark:border-gray-800 md:border-0">
                  <div className="flex flex-col md:items-end gap-1">
                    <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg border ${getStatusColor(sub.status)}`}>
                      {getStatusText(sub.status)}
                    </span>
                    {sub.status === 'SUBMITTED' && (
                      <span className="flex items-center gap-1 text-sm font-bold text-amber-600">
                        <Award className="w-4 h-4" /> {sub.score?.toFixed(1)} Điểm
                      </span>
                    )}
                  </div>
                  
                  {sub.status === 'SUBMITTED' ? (
                    <Link
                      href={`/student/submissions/${sub.id}/result`}
                      className="flex items-center justify-center w-10 h-10 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 dark:hover:text-white transition-all shadow-sm group/btn"
                    >
                      <ArrowRight className="w-5 h-5 group-hover/btn:-rotate-45 transition-transform" />
                    </Link>
                  ) : (
                    <Link
                      href={`/student/exams/${sub.examId}/take`}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl shadow-sm transition-all"
                    >
                      Tiếp tục
                    </Link>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-900 rounded-3xl p-12 border border-dashed border-gray-200 dark:border-gray-800 flex flex-col items-center text-center">
          <History className="w-12 h-12 text-gray-300 mb-4" />
          <p className="text-gray-500 dark:text-gray-400 font-medium">Bạn chưa thực hiện bài thi nào.</p>
          <Link
            href="/student/exams"
            className="mt-6 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-indigo-500/25 transition-all"
          >
            Tìm đề thi ngay
          </Link>
        </div>
      )}
    </div>
  );
}
