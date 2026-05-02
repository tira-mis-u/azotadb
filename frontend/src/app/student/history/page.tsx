'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { createClient } from '@/lib/supabase/client';
import useSWR from 'swr';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  History, Clock, Calendar, Search, Filter, 
  ArrowRight, Award, ChevronDown, BookOpen, Zap, Target
} from 'lucide-react';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { PageHeader } from '@/components/ui/page-header';
import { cn } from '@/lib/utils';

const fetcher = (url: string, token: string) => 
  axios.get(url, { headers: { Authorization: `Bearer ${token}` } }).then(res => res.data);

export default function StudentHistoryPage() {
  const { session, loading: authLoading } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  
  const { data: submissions, error, isLoading, mutate } = useSWR(
    session?.access_token ? ['/api/submissions/my/list', session.access_token] : null,
    ([url, token]) => fetcher(url, token)
  );

  useEffect(() => {
    if (!session?.access_token || !session?.user?.id) return;

    const supabase = createClient();
    const channel = supabase
      .channel('public:Submission')
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'Submission',
          filter: `userId=eq.${session.user.id}`
        },
        (payload: any) => {
          console.log('Realtime Submission Update:', payload);
          mutate(); // Refetch the submission list from backend
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session?.access_token, session?.user?.id, mutate]);

  const filteredSubmissions = submissions?.filter((s: any) => 
    s.exam?.title?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const isPageLoading = authLoading || isLoading;

  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'SUBMITTED': return 'bg-success/10 text-success border-success/30';
      case 'IN_PROGRESS': return 'bg-amber-500/10 text-amber-600 border-amber-500/30';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'SUBMITTED': return 'HOÀN THÀNH';
      case 'IN_PROGRESS': return 'ĐANG THỰC HIỆN';
      default: return status;
    }
  };

  // Sub-renderers for cleaner structure
  const renderLoading = () => (
    <div className="grid gap-6">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="bg-card rounded-2xl p-6 border border-border flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
          <div className="flex items-center gap-6 flex-1">
            <Skeleton className="w-16 h-16 rounded-xl shrink-0" />
            <div className="space-y-3 flex-1">
              <Skeleton className="h-7 w-3/4 rounded-lg" />
              <Skeleton className="h-5 w-1/2 rounded-md" />
            </div>
          </div>
          <div className="flex items-center gap-6">
            <Skeleton className="h-12 w-32 rounded-xl" />
            <Skeleton className="h-12 w-12 rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  );

  const renderError = () => (
    <div className="py-20 text-center space-y-6 animate-in zoom-in-95">
       <div className="w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-destructive/10">
          <Zap size={40} className="text-destructive animate-pulse" />
       </div>
       <div className="space-y-2">
         <h2 className="text-xl font-black uppercase tracking-tighter text-destructive">Lỗi tải dữ liệu</h2>
         <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Rất tiếc, chúng tôi không thể truy cập vào nhật ký học tập của bạn.</p>
       </div>
       <button onClick={() => window.location.reload()} className="mt-6 px-10 py-4 bg-destructive text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-destructive/20">Thử lại ngay</button>
    </div>
  );

  const renderEmpty = () => (
    <div className="py-24 flex flex-col items-center text-center space-y-6 animate-in zoom-in-95">
      <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-4">
        <History className="w-10 h-10 text-muted-foreground opacity-30" />
      </div>
      <div className="space-y-2">
        <h2 className="text-2xl font-black text-foreground tracking-tighter uppercase">NHẬT KÝ ĐANG TRỐNG</h2>
        <p className="text-[10px] font-black text-muted-foreground max-w-sm uppercase tracking-[0.2em] leading-loose opacity-60">BẠN CHƯA THỰC HIỆN BÀI THI NÀO. HÃY BẮT ĐẦU CHINH PHỤC CÁC THỬ THÁCH NGAY!</p>
      </div>
      <Link
        href="/student/exams"
        className="mt-6 px-10 py-4 bg-primary text-primary-foreground font-black text-xs uppercase tracking-[0.2em] rounded-2xl hover:scale-105 transition-all shadow-xl shadow-primary/30"
      >
        KHÁM PHÁ ĐỀ THI
      </Link>
    </div>
  );

  return (
    <div className="p-10 max-w-7xl mx-auto space-y-12 animate-in fade-in duration-700">
      <PageHeader 
        title="Nhật ký học tập" 
        description="Theo dõi hành trình chinh phục tri thức và phân tích kết quả từng bài thi của bạn."
        backHref="/dashboard"
        breadcrumbs={[
          { label: 'Lộ trình cá nhân', href: '/dashboard' },
          { label: 'Nhật ký học tập' }
        ]}
        actions={
          <div className="flex items-center gap-3 px-6 py-3 bg-card border border-border rounded-2xl shadow-xl shadow-primary/5">
             <Target className="text-primary w-5 h-5 animate-pulse" />
             <span className="text-[10px] font-black text-foreground uppercase tracking-[0.2em]">{filteredSubmissions.length} BÀI THI ĐÃ LÀM</span>
          </div>
        }
      />

      <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-2xl transition-all duration-500">
        <div className="p-8 border-b border-border/50 bg-card/50 backdrop-blur-xl">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="relative flex-1 group w-full">
              <Search className="w-6 h-6 absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-all duration-300" />
              <input
                type="text"
                placeholder="TÌM KIẾM THEO TÊN ĐỀ THI, NGÀY THÁNG..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-16 pr-8 py-5 bg-background border border-border rounded-2xl text-sm font-bold focus:ring-8 focus:ring-primary/5 focus:border-primary outline-none transition-all placeholder:text-muted-foreground/40 placeholder:font-black placeholder:uppercase placeholder:tracking-[0.15em] shadow-inner"
              />
            </div>
            <button className="flex items-center justify-center gap-4 px-10 py-5 bg-background border border-border text-foreground text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-muted hover:border-primary/40 transition-all shadow-sm shrink-0">
              <Filter className="w-5 h-5 text-primary" /> LỌC TRẠNG THÁI <ChevronDown className="w-4 h-4 opacity-50" />
            </button>
          </div>
        </div>

        <div className="p-8 min-h-[500px]">
          {isPageLoading ? renderLoading() : (error ? renderError() : (
            filteredSubmissions.length > 0 ? (
              <div className="grid gap-6">
                <AnimatePresence mode="popLayout">
                  {filteredSubmissions.map((sub: any, i: number) => (
                    <motion.div
                      key={sub.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.4, delay: i * 0.03 }}
                      className="group bg-card rounded-2xl p-6 border border-border hover:border-primary/40 hover:shadow-xl transition-all duration-300 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden"
                    >
                      <div className="absolute top-0 left-0 w-1.5 h-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="flex items-center gap-6 flex-1 min-w-0">
                        <div className="w-16 h-16 rounded-xl bg-muted flex items-center justify-center text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground group-hover:rotate-6 transition-all duration-300 shrink-0 shadow-inner">
                          <BookOpen className="w-8 h-8" />
                        </div>
                        <div className="space-y-2 flex-1 min-w-0">
                          <h3 className="font-black text-lg text-foreground group-hover:text-primary transition-colors line-clamp-1 tracking-tighter uppercase leading-tight">
                            {sub.exam?.title || 'BÀI THI KHÔNG XÁC ĐỊNH'}
                          </h3>
                          <div className="flex flex-wrap items-center gap-4 text-[9px] font-black uppercase tracking-[0.15em] text-muted-foreground opacity-60 group-hover:opacity-100 transition-opacity">
                            <span className="flex items-center gap-2">
                              <Calendar className="w-3.5 h-3.5 text-primary" />
                              {new Date(sub.startTime).toLocaleDateString('vi-VN')}
                            </span>
                            <span className="flex items-center gap-2">
                              <Clock className="w-3.5 h-3.5 text-primary" />
                              {sub.exam?.durationValue} {sub.exam?.durationUnit || 'PHÚT'}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between w-full md:w-auto gap-6 pt-4 md:pt-0 border-t border-border/50 md:border-0">
                        <div className="flex flex-col md:items-end gap-2">
                          <span className={cn(
                            "px-3 py-1 text-[8px] font-black uppercase tracking-[0.2em] rounded-lg border",
                            getStatusStyles(sub.status)
                          )}>
                            {getStatusText(sub.status)}
                          </span>
                          {sub.status === 'SUBMITTED' && (
                            <span className="flex items-center gap-2 text-xl font-black text-foreground tracking-tighter">
                              <Award className="w-5 h-5 text-amber-500" /> {sub.score?.toFixed(1)} <span className="text-[9px] text-muted-foreground font-black uppercase tracking-widest opacity-40">ĐIỂM</span>
                            </span>
                          )}
                        </div>
                        {sub.status === 'SUBMITTED' ? (
                          <Link
                            href={`/student/submissions/${sub.id}/result`}
                            className="flex items-center justify-center w-12 h-12 rounded-xl bg-muted text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-all shadow-sm group/btn border border-border/50"
                          >
                            <ArrowRight className="w-6 h-6 group-hover/btn:translate-x-1 transition-transform" />
                          </Link>
                        ) : (
                          <Link
                            href={`/student/exams/${sub.examId}/take`}
                            className="px-6 py-3 bg-primary text-primary-foreground text-[9px] font-black uppercase tracking-[0.2em] rounded-xl shadow-lg shadow-primary/20 hover:scale-105 transition-all"
                          >
                            TIẾP TỤC
                          </Link>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            ) : renderEmpty()
          ))}
        </div>
      </div>
    </div>
  );
}
