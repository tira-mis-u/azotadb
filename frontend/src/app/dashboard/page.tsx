'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/components/providers/theme-provider';
import useSWR from 'swr';
import axios from 'axios';
import {
  BookOpen, PlusCircle, Upload, BarChart3,
  ClipboardList, History, Bookmark, TrendingUp,
  Users, FileText, Zap, Clock, ChevronRight
} from 'lucide-react';
import { DashboardSkeleton } from '@/components/ui/dashboard-skeleton';
import {
  LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { cn } from '@/lib/utils';
import Link from 'next/link';

const fetcher = (url: string, token: string) =>
  axios.get(url, { headers: { Authorization: `Bearer ${token}` } }).then(res => res.data);

const StatCard = ({ icon: Icon, label, value, accentColor }: any) => {
  return (
    <motion.div
      whileHover={{ y: -3, scale: 1.01 }}
      className="bg-card border border-border p-5 rounded-2xl flex items-center gap-4 transition-all duration-300 shadow-sm group"
    >
      <div 
        className="w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-500 group-hover:rotate-3"
        style={{ backgroundColor: `${accentColor}10` }}
      >
        <Icon size={20} style={{ color: accentColor }} />
      </div>
      <div>
        <p className="text-2xl font-black text-foreground leading-none tracking-tight">{value}</p>
        <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mt-1 opacity-60">{label}</p>
      </div>
    </motion.div>
  );
};

const QuickAction = ({ icon: Icon, label, desc, href, accentColor }: any) => {
  return (
    <motion.div whileHover={{ y: -3, scale: 1.01 }}>
      <Link
        href={href}
        className="block bg-card border border-border p-5 rounded-2xl transition-all duration-300 shadow-sm group hover:border-primary/30"
      >
        <div 
          className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition-all duration-500 group-hover:scale-105"
          style={{ backgroundColor: `${accentColor}10` }}
        >
          <Icon size={18} style={{ color: accentColor }} />
        </div>
        <p className="text-xs font-black text-foreground uppercase tracking-tight mb-0.5">{label}</p>
        <p className="text-[9px] font-bold text-muted-foreground leading-relaxed uppercase tracking-widest opacity-60">{desc}</p>
      </Link>
    </motion.div>
  );
};

const SectionCard = ({ title, icon: Icon, children, className }: any) => {
  return (
    <div className={cn("bg-card border border-border rounded-2xl p-6 shadow-sm space-y-5", className)}>
      <div className="flex items-center justify-between pb-3 border-b border-border/50">
        <h3 className="flex items-center gap-2 text-[9px] font-black text-primary uppercase tracking-[0.2em]">
          <Icon size={14} />
          {title}
        </h3>
        <ChevronRight size={12} className="text-muted-foreground opacity-50" />
      </div>
      {children}
    </div>
  );
};

const activityData: any[] = [];
const studentProgressData: any[] = [];

const TeacherDashboard = ({ data }: any) => (
  <div className="space-y-10">
    <div className="space-y-4">
      <div className="flex items-center gap-2 ml-1">
        <Zap className="text-primary w-4 h-4" />
        <h2 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Thống kê tổng quan</h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard icon={FileText} label="Đề thi đã tạo" value={data?.stats?.exams || 0} accentColor="#6366f1" />
        <StatCard icon={Users} label="Lượt làm bài" value={data?.stats?.submissions || 0} accentColor="#8b5cf6" />
        <StatCard icon={Zap} label="Độ chính xác" value={`${data?.stats?.accuracyRate || '0.0'}%`} accentColor="#10b981" />
        <StatCard icon={TrendingUp} label="Điểm TB" value={data?.stats?.avgScore || '0.0'} accentColor="#f59e0b" />
      </div>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <SectionCard title="Hoạt động trong tuần" icon={BarChart3} className="lg:col-span-2">
        <div className="h-[250px] w-full pt-2">
          {activityData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activityData}>
                <defs>
                  <linearGradient id="colorSub" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: 'var(--muted-foreground)', fontWeight: 800 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: 'var(--muted-foreground)', fontWeight: 800 }} />
                <Tooltip contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, fontSize: 10 }} />
                <Area type="monotone" dataKey="submissions" stroke="var(--primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorSub)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground space-y-3 opacity-40">
              <BarChart3 size={32} strokeWidth={1} />
              <p className="text-[9px] font-black uppercase tracking-[0.2em]">Chưa có dữ liệu</p>
            </div>
          )}
        </div>
      </SectionCard>

      <SectionCard title="Đề thi mới nhất" icon={Clock}>
        <div className="space-y-3">
          {data?.recentActivity?.length > 0 ? data.recentActivity.map((item: any) => (
            <div key={item.id} className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 hover:bg-muted transition-colors group">
              <div className="w-1.5 h-1.5 rounded-full bg-primary" />
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-black text-foreground truncate uppercase tracking-tight">{item.title}</p>
                <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">{new Date(item.createdAt).toLocaleDateString('vi-VN')}</p>
              </div>
            </div>
          )) : (
            <div className="py-8 text-center space-y-2 opacity-30">
               <FileText className="mx-auto w-8 h-8" />
               <p className="text-[9px] font-black uppercase tracking-widest">Trống</p>
            </div>
          )}
        </div>
      </SectionCard>
    </div>

    <div className="space-y-4">
      <div className="flex items-center gap-2 ml-1">
        <PlusCircle className="text-primary w-4 h-4" />
        <h2 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Hành động nhanh</h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <QuickAction icon={PlusCircle} label="Tạo đề mới" desc="Soạn từ đầu" href="/teacher/create" accentColor="#6366f1" />
        <QuickAction icon={Upload} label="Upload & OCR" desc="Từ file đề" href="/teacher/upload" accentColor="#8b5cf6" />
        <QuickAction icon={ClipboardList} label="Quản lý đề" desc="Sửa & Publish" href="/teacher/exams" accentColor="#10b981" />
        <QuickAction icon={BookOpen} label="Ngân hàng câu" desc="Kho tri thức" href="/teacher/questions" accentColor="#f59e0b" />
      </div>
    </div>
  </div>
);

const StudentDashboard = ({ data }: any) => (
  <div className="space-y-10">
    <div className="space-y-4">
      <div className="flex items-center gap-2 ml-1">
        <TrendingUp className="text-primary w-4 h-4" />
        <h2 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Hành trình của bạn</h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard icon={ClipboardList} label="Đề đã làm" value={data?.stats?.examsDone || 0} accentColor="#6366f1" />
        <StatCard icon={TrendingUp} label="Điểm trung bình" value={data?.stats?.avgScore || '0.0'} accentColor="#10b981" />
        <StatCard icon={Zap} label="Chuỗi ngày" value={`${data?.stats?.streak || 0} 🔥`} accentColor="#f59e0b" />
        <StatCard icon={Bookmark} label="Đã lưu" value={data?.stats?.bookmarks || 0} accentColor="#8b5cf6" />
      </div>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <SectionCard title="Xu hướng điểm số" icon={TrendingUp} className="lg:col-span-2">
        <div className="h-[250px] w-full pt-2">
          {studentProgressData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={studentProgressData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: 'var(--muted-foreground)', fontWeight: 800 }} />
                <YAxis axisLine={false} tickLine={false} domain={[0, 10]} tick={{ fontSize: 9, fill: 'var(--muted-foreground)', fontWeight: 800 }} />
                <Tooltip contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12 }} />
                <Line type="monotone" dataKey="score" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981', stroke: 'var(--card)', strokeWidth: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground space-y-3 opacity-40">
              <TrendingUp size={32} strokeWidth={1} />
              <p className="text-[9px] font-black uppercase tracking-[0.2em]">Trống</p>
            </div>
          )}
        </div>
      </SectionCard>

      <SectionCard title="Bài làm gần đây" icon={Clock}>
        <div className="space-y-3">
          {data?.recentExams?.length > 0 ? data.recentExams.map((item: any) => (
            <div key={item.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/30 hover:bg-muted transition-colors">
              <div className="flex items-center gap-2 overflow-hidden">
                <div className="w-1.5 h-1.5 rounded-full bg-success" />
                <span className="text-[11px] font-black text-foreground truncate uppercase tracking-tight">{item.name}</span>
              </div>
              <p className="text-xs font-black text-success ml-4">{item.score}</p>
            </div>
          )) : (
            <div className="py-8 text-center space-y-2 opacity-30">
               <History className="mx-auto w-8 h-8" />
               <p className="text-[9px] font-black uppercase tracking-widest">Trống</p>
            </div>
          )}
        </div>
      </SectionCard>
    </div>

    <div className="space-y-4">
      <div className="flex items-center gap-2 ml-1">
        <Zap className="text-primary w-4 h-4" />
        <h2 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Truy cập nhanh</h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <QuickAction icon={ClipboardList} label="Vào thi" desc="Danh sách đề" href="/student/exams" accentColor="#6366f1" />
        <QuickAction icon={BookOpen} label="Luyện tập" desc="Câu ngẫu nhiên" href="/student/practice" accentColor="#8b5cf6" />
        <QuickAction icon={History} label="Lịch sử" desc="Kết quả thi" href="/student/history" accentColor="#10b981" />
        <QuickAction icon={Bookmark} label="Đã lưu" desc="Câu bookmark" href="/student/bookmarks" accentColor="#8b5cf6" />
      </div>
    </div>
  </div>
);

export default function DashboardPage() {
  const { user, activeRole, session, loading: authLoading } = useAuth();

  const { data, error, isLoading } = useSWR(
    session?.access_token ? ['/api/dashboard/stats', session.access_token] : null,
    ([url, token]) => fetcher(url, token)
  );

  if (authLoading || isLoading) return <DashboardSkeleton />;

  if (error) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center p-8 text-center space-y-3">
        <div className="w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center text-destructive">
           <Zap size={24} />
        </div>
        <h2 className="text-lg font-black uppercase tracking-tight">Lỗi kết nối</h2>
        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Không thể tải dữ liệu từ máy chủ.</p>
        <button onClick={() => window.location.reload()} className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-black text-[9px] uppercase tracking-widest shadow-sm">Thử lại</button>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-10 animate-in fade-in duration-700">
      <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="space-y-2 border-b border-border/50 pb-6">
        <div className="flex items-center gap-3">
           <div className="w-0.5 h-8 bg-primary rounded-full" />
           <div>
              <h1 className="text-2xl md:text-3xl font-black text-foreground tracking-tighter leading-none uppercase">
                Chào{user?.email ? `, ${user.email.split('@')[0]}` : ''}! 👋
              </h1>
              <p className="text-muted-foreground font-black text-[9px] uppercase tracking-[0.2em] mt-1.5 opacity-60">
                {activeRole === 'TEACHER' ? 'GIÁO VIÊN • HỆ THỐNG QUẢN TRỊ' : 'HỌC SINH • LỘ TRÌNH CHINH PHỤC'}
              </p>
           </div>
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        <motion.div key={activeRole} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
          {activeRole === 'TEACHER' ? <TeacherDashboard data={data} /> : <StudentDashboard data={data} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
