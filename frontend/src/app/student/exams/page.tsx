'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { createClient } from '@/lib/supabase/client';
import { useTheme } from '@/components/providers/theme-provider';
import useSWR from 'swr';
import axios from 'axios';
import {
  Search, Clock, BookOpen, ArrowRight,
  Filter, Calendar, Star, Info, BookMarked, Zap, ChevronRight, GraduationCap
} from 'lucide-react';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { PageHeader } from '@/components/ui/page-header';
import { cn } from '@/lib/utils';

interface StudentExam {
  id: string;
  publicId: string;
  title: string;
  description: string;
  durationValue: number;
  durationUnit?: string;
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

  const { data: exams, error, isLoading, mutate } = useSWR<StudentExam[]>(
    session?.access_token ? ['/api/exams', session.access_token] : null,
    // @ts-ignore
    ([url, token]) => fetcher(url, token)
  );

  useEffect(() => {
    if (!session?.access_token) return;

    const supabase = createClient();
    const channel = supabase
      .channel('public:Exam')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'Exam' },
        (payload) => {
          console.log('Realtime Exam Update:', payload);
          mutate(); // Refetch the exams list from backend
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session?.access_token, mutate]);

  const filteredExams = exams?.filter((e: StudentExam) =>
    e.title.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const isPageLoading = authLoading || isLoading;

  return (
    <div className="p-10 max-w-7xl mx-auto space-y-12 animate-in fade-in duration-700">
      <PageHeader 
        title="Kho tàng đề thi" 
        description="Khám phá và chinh phục hàng ngàn đề thi chất lượng cao được thiết kế riêng cho bạn."
        backHref="/dashboard"
        breadcrumbs={[
          { label: 'Hành trình học tập', href: '/dashboard' },
          { label: 'Danh mục đề thi' }
        ]}
        actions={
          <div className="flex items-center gap-2 px-6 py-3 bg-primary/10 border border-primary/20 rounded-2xl">
             <Zap className="text-primary w-5 h-5 animate-pulse" />
             <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">{filteredExams.length} ĐỀ THI SẴN SÀNG</span>
          </div>
        }
      />

      {/* Filters & Content Integration */}
      <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-2xl transition-all duration-500">
        <div className="p-8 border-b border-border/50 bg-card/50 backdrop-blur-xl">
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="relative flex-1 group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-muted-foreground group-focus-within:text-primary transition-all duration-300" />
              <input
                type="text"
                placeholder="TÌM KIẾM ĐỀ THI, MÔN HỌC, CHỦ ĐỀ..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-16 pr-8 py-5 bg-background border border-border rounded-2xl text-sm font-bold focus:ring-8 focus:ring-primary/5 focus:border-primary outline-none transition-all placeholder:text-muted-foreground/40 placeholder:font-black placeholder:uppercase placeholder:tracking-[0.15em] shadow-inner"
              />
            </div>
            <div className="flex gap-4">
               <button className="flex items-center justify-center gap-3 px-10 py-5 bg-background border border-border text-foreground text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-muted hover:border-primary/40 transition-all shadow-sm shrink-0">
                 <Filter className="w-5 h-5 text-primary" /> BỘ LỌC
               </button>
               <button className="p-5 bg-background border border-border text-muted-foreground rounded-2xl hover:bg-primary/10 hover:text-primary transition-all shadow-sm shrink-0">
                 <Calendar className="w-6 h-6" />
               </button>
            </div>
          </div>
        </div>

        <div className="p-10 min-h-[400px]">
          {/* Error / Empty State Handling */}
          {error && !exams && (
            <div className="py-20 text-center space-y-6 animate-in zoom-in-95">
              <div className="w-20 h-20 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mx-auto shadow-inner border border-destructive/10">
                 <Zap size={40} className="animate-pulse" />
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-black uppercase tracking-tighter">Mất kết nối máy chủ</h2>
                <p className="font-bold opacity-60 uppercase text-[10px] tracking-widest">Hệ thống đang gặp sự cố kỹ thuật hoặc bạn chưa đăng nhập.</p>
              </div>
              <button onClick={() => window.location.reload()} className="px-10 py-4 bg-destructive text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-destructive/20 hover:scale-105 transition-all">Thử lại ngay</button>
            </div>
          )}

          {!error && !isPageLoading && filteredExams.length === 0 && (
            <div className="py-24 flex flex-col items-center text-center space-y-6">
              <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4 animate-glimmer">
                <BookOpen className="w-12 h-12 text-muted-foreground opacity-30" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-black text-foreground tracking-tighter uppercase">Chưa có đề thi nào</h2>
                <p className="text-[10px] font-black text-muted-foreground max-w-md uppercase tracking-[0.2em] leading-loose opacity-60">HIỆN TẠI KHO TÀNG ĐỀ THI ĐANG ĐƯỢC CẬP NHẬT. QUAY LẠI SAU NHÉ!</p>
              </div>
            </div>
          )}

          {/* List Content */}
          {isPageLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-card rounded-2xl p-8 border border-border space-y-6 shadow-sm">
                  <div className="flex items-center justify-between">
                    <Skeleton className="w-16 h-16 rounded-xl" />
                    <Skeleton className="w-24 h-8 rounded-lg" />
                  </div>
                  <div className="space-y-4">
                     <Skeleton className="h-8 w-full rounded-lg" />
                     <Skeleton className="h-16 w-full rounded-lg" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredExams.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              <AnimatePresence mode="popLayout">
                {filteredExams.map((exam: StudentExam, i: number) => (
                  <motion.div
                    key={exam.id}
                    initial={{ opacity: 0, scale: 0.98, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: i * 0.03 }}
                    className={cn(
                      "group bg-card rounded-2xl p-8 border border-border hover:border-primary/40 hover:shadow-2xl transition-all duration-300 flex flex-col relative overflow-hidden",
                      theme === 'neon' && "hover:shadow-primary/20 animate-glimmer"
                    )}
                  >
                    {/* Visual Flair */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-linear-to-br from-primary/20 to-transparent rounded-bl-[6rem] -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-700 blur-xl opacity-30" />
                    <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-success/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                    {/* Card Header */}
                    <div className="flex items-start justify-between mb-8 relative z-10">
                      <div className="w-16 h-16 rounded-[1.5rem] bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground group-hover:rotate-6 transition-all duration-500 shadow-inner">
                        <GraduationCap className="w-8 h-8" />
                      </div>
                      <div className="flex flex-col items-end gap-3">
                        {exam.mode === 'THPTQG' && (
                          <span className="text-[10px] font-black uppercase tracking-[0.2em] px-4 py-1.5 bg-purple-500/10 text-purple-600 border border-purple-500/20 rounded-xl">
                            PHÒNG THI THPTQG
                          </span>
                        )}
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 text-amber-600 rounded-xl border border-amber-500/20 shadow-sm">
                          <Star className="w-4 h-4 fill-current animate-pulse" />
                          <span className="text-xs font-black uppercase tracking-widest">4.9/5.0</span>
                        </div>
                      </div>
                    </div>

                    {/* Title & Description */}
                    <h3 className="text-2xl font-black text-foreground mb-4 line-clamp-2 leading-tight tracking-tighter group-hover:text-primary transition-colors duration-300">
                      {exam.title}
                    </h3>
                    <p className="text-sm font-bold text-muted-foreground mb-10 line-clamp-2 leading-relaxed flex-1 opacity-80 group-hover:opacity-100">
                      {exam.description || 'KHÁM PHÁ BỘ CÂU HỎI ĐẶC SẮC ĐƯỢC BIÊN SOẠN CÔNG PHU DÀNH CHO NHỮNG CHIẾN BINH THỰC THỤ.'}
                    </p>

                    {/* Meta info */}
                    <div className="grid grid-cols-2 gap-4 mb-8">
                      <div className="flex items-center gap-3 p-4 rounded-2xl bg-muted/50 border border-border/50 group-hover:border-primary/20 transition-all">
                        <Clock className="w-5 h-5 text-primary shrink-0" /> 
                        <div className="flex flex-col min-w-0">
                           <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest leading-none">THỜI GIAN</span>
                           <span className="text-xs font-black text-foreground mt-1 truncate">{exam.isTimed ? `${exam.durationValue} ${exam.durationUnit || 'PHÚT'}` : 'KHÔNG GIỚI HẠN'}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-4 rounded-2xl bg-muted/50 border border-border/50 group-hover:border-primary/20 transition-all">
                        <BookMarked className="w-5 h-5 text-success shrink-0" /> 
                        <div className="flex flex-col min-w-0">
                           <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest leading-none">CÂU HỎI</span>
                           <span className="text-xs font-black text-foreground mt-1 truncate">{exam._count?.questions ?? exam.questions?.length ?? '?'} CÂU CHUẨN</span>
                        </div>
                      </div>
                    </div>

                    {/* Dual CTA */}
                    <div className="flex gap-4 pt-8 border-t border-border relative z-10">
                      <Link
                        href={`/student/practice/${exam.id}`}
                        className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest bg-muted text-foreground border border-border hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-all"
                      >
                        <Zap className="w-4 h-4" /> LUYỆN TẬP
                      </Link>
                      <Link
                        href={`/student/exams/${exam.publicId || exam.id}/take`}
                        className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest bg-primary text-primary-foreground transition-all hover:scale-105 shadow-2xl shadow-primary/30 group-hover:shadow-primary/50"
                      >
                        BẮT ĐẦU <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
