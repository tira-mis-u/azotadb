'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/components/providers/theme-provider';
import useSWR from 'swr';
import axios from 'axios';
import {
  Search, Clock, BookOpen, ArrowRight,
  Filter, Calendar, Star, Info, BookMarked, Zap
} from 'lucide-react';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';

interface StudentExam {
  id: string;
  title: string;
  description: string;
  duration: number;
  isTimed: boolean;
  createdAt: string;
  mode: 'STANDARD' | 'THPTQG';
  _count?: {
    questions: number;
  };
  questions?: any[];
}

const fetcher = (url: string, token: string) => 
  axios.get(url, { headers: { Authorization: `Bearer ${token}` } }).then(res => res.data);

export default function StudentExamsPage() {
  const { session, loading: authLoading } = useAuth();
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');

  const { data: exams, error, isLoading } = useSWR<StudentExam[]>(
    session?.access_token ? ['/api/exams', session.access_token] : null,
    // @ts-ignore
    ([url, token]) => fetcher(url, token)
  );

  const filteredExams = exams?.filter((e: StudentExam) =>
    e.title.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const isPageLoading = authLoading || isLoading;

  return (
    <div style={{ padding: '32px 40px', maxWidth: 1200, margin: '0 auto' }}>
      {/* Header */}
      <div className="mb-8">
        <h1 style={{ color: 'var(--foreground)' }} className="text-2xl md:text-3xl font-bold tracking-tight">Khám phá đề thi</h1>
        <p style={{ color: 'var(--muted-foreground)' }} className="text-sm md:text-base mt-2">Tìm kiếm và thử sức với hàng ngàn đề thi từ cộng đồng.</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
          <input
            type="text"
            placeholder="Tìm kiếm tên đề thi, môn học..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ 
              backgroundColor: 'var(--card)', 
              borderColor: 'var(--border)', 
              color: 'var(--foreground)' 
            }}
            className="w-full pl-12 pr-4 py-3.5 rounded-2xl border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 shadow-sm transition-all"
          />
        </div>
        <button 
          style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
          className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl border text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-all shadow-sm shrink-0"
        >
          <Filter className="w-4 h-4" /> Lọc kết quả
        </button>
      </div>

      {/* Error state */}
      {error && (
        <div 
          style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', borderColor: 'rgba(239, 68, 68, 0.2)', color: '#ef4444' }}
          className="p-8 text-center rounded-2xl border"
        >
          <p>Lỗi khi tải danh sách đề thi. Vui lòng thử lại sau.</p>
        </div>
      )}

      {/* List */}
      {isPageLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div 
              key={i} 
              style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
              className="rounded-3xl p-6 border space-y-4"
            >
              <div className="flex items-center justify-between mb-4">
                <Skeleton className="w-12 h-12 rounded-2xl" />
                <Skeleton className="w-10 h-4 rounded-md" />
              </div>
              <Skeleton className="h-6 w-3/4 rounded-md" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-full rounded-md" />
                <Skeleton className="h-4 w-2/3 rounded-md" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredExams.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredExams.map((exam: StudentExam, i: number) => (
              <motion.div
                key={exam.id}
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2, delay: i * 0.05 }}
                style={{ 
                  backgroundColor: 'var(--card)', 
                  borderColor: 'var(--border)',
                  boxShadow: theme === 'neon' ? '0 0 15px rgba(0, 255, 255, 0.05)' : 'none'
                }}
                className="group rounded-3xl p-6 border hover:border-indigo-200 dark:hover:border-indigo-800 hover:shadow-xl transition-all flex flex-col"
              >
                {/* Card Header */}
                <div className="flex items-start justify-between mb-4">
                  <div 
                    style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-foreground)' }}
                    className="w-12 h-12 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform"
                  >
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <div className="flex items-center gap-2">
                    {exam.mode === 'THPTQG' && (
                      <span 
                        style={{ backgroundColor: 'rgba(168, 85, 247, 0.1)', color: '#a855f7', borderColor: 'rgba(168, 85, 247, 0.2)' }}
                        className="text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-lg border"
                      >
                        THPTQG
                      </span>
                    )}
                    <div 
                      style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}
                      className="flex items-center gap-1 px-2 py-1 rounded-lg"
                    >
                      <Star className="w-3.5 h-3.5 fill-current" />
                      <span className="text-xs font-bold">4.8</span>
                    </div>
                  </div>
                </div>

                {/* Title & Description */}
                <h3 
                  style={{ color: 'var(--foreground)' }}
                  className="font-bold mb-2 line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors"
                >
                  {exam.title}
                </h3>
                <p style={{ color: 'var(--muted-foreground)' }} className="text-sm mb-4 line-clamp-2 leading-relaxed flex-1">
                  {exam.description || 'Chưa có mô tả cho đề thi này.'}
                </p>

                {/* Meta info */}
                <div style={{ color: 'var(--muted-foreground)' }} className="flex items-center gap-4 mb-5 text-xs font-medium">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" /> {exam.isTimed ? `${exam.duration} phút` : 'Không giới hạn'}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <BookMarked className="w-3.5 h-3.5" /> {exam._count?.questions ?? exam.questions?.length ?? '?'} câu
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" /> {new Date(exam.createdAt).toLocaleDateString('vi-VN')}
                  </div>
                </div>

                {/* Dual CTA */}
                <div style={{ borderTop: '1px solid var(--border)' }} className="flex gap-2 pt-4">
                  <Link
                    href={`/student/practice/${exam.id}`}
                    style={{ 
                      backgroundColor: 'rgba(249, 115, 22, 0.1)', 
                      color: '#f97316', 
                      borderColor: 'rgba(249, 115, 22, 0.2)' 
                    }}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm hover:brightness-110 transition-all border"
                  >
                    <Zap className="w-4 h-4" /> Luyện tập
                  </Link>
                  <Link
                    href={`/student/exams/${exam.id}/take`}
                    style={{ 
                      backgroundColor: 'var(--primary)', 
                      color: 'var(--primary-foreground)',
                      boxShadow: theme === 'neon' ? '0 0 10px var(--primary)' : 'none'
                    }}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm transition-all"
                  >
                    Làm bài <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
          className="rounded-3xl p-12 border border-dashed flex flex-col items-center text-center"
        >
          <div style={{ backgroundColor: 'var(--muted)' }} className="w-16 h-16 rounded-full flex items-center justify-center mb-4">
            <Info className="w-8 h-8 text-gray-400" />
          </div>
          <p style={{ color: 'var(--foreground)' }} className="font-medium">Không tìm thấy đề thi nào phù hợp.</p>
          <button
            onClick={() => setSearchQuery('')}
            style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-foreground)' }}
            className="mt-4 px-4 py-2 text-sm font-bold rounded-xl hover:brightness-110 transition-colors"
          >
            Xoá bộ lọc tìm kiếm
          </button>
        </motion.div>
      )}
    </div>
  );
}
