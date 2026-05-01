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
  Users, FileText, Zap, Clock
} from 'lucide-react';
import { DashboardSkeleton } from '@/components/ui/dashboard-skeleton';
import {
  LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

const fetcher = (url: string, token: string) =>
  axios.get(url, { headers: { Authorization: `Bearer ${token}` } }).then(res => res.data);

const StatCard = ({ icon: Icon, label, value, accentColor }: any) => {
  const { theme } = useTheme();
  return (
    <motion.div
      whileHover={{ y: -2, scale: 1.01 }}
      style={{
        backgroundColor: 'var(--card)',
        border: '1px solid var(--border)',
        borderRadius: 16,
        padding: '20px',
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        transition: 'all 0.2s ease',
        boxShadow: theme === 'neon' ? `0 0 20px ${accentColor}22` : '0 1px 3px rgba(0,0,0,0.06)',
      }}
    >
      <div style={{
        width: 48, height: 48, borderRadius: 12,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: `${accentColor}18`,
        border: theme === 'neon' ? `1px solid ${accentColor}44` : 'none',
        boxShadow: theme === 'neon' ? `0 0 10px ${accentColor}33` : 'none',
      }}>
        <Icon size={22} style={{ color: accentColor }} />
      </div>
      <div>
        <p style={{ fontSize: 26, fontWeight: 800, color: 'var(--foreground)', lineHeight: 1 }}>{value}</p>
        <p style={{ fontSize: 12, color: 'var(--muted-foreground)', marginTop: 4 }}>{label}</p>
      </div>
    </motion.div>
  );
};

const QuickAction = ({ icon: Icon, label, desc, href, accentColor }: any) => {
  const { theme } = useTheme();
  return (
    <motion.a
      href={href}
      whileHover={{ y: -3, scale: 1.02 }}
      style={{
        display: 'block',
        backgroundColor: 'var(--card)',
        border: '1px solid var(--border)',
        borderRadius: 16,
        padding: '20px',
        textDecoration: 'none',
        transition: 'all 0.2s ease',
        boxShadow: theme === 'neon' ? `0 0 15px ${accentColor}15` : 'none',
        cursor: 'pointer',
      }}
    >
      <div style={{
        width: 40, height: 40, borderRadius: 10,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: `${accentColor}18`,
        border: theme === 'neon' ? `1px solid ${accentColor}44` : 'none',
        marginBottom: 12,
        boxShadow: theme === 'neon' ? `0 0 10px ${accentColor}33` : 'none',
      }}>
        <Icon size={20} style={{ color: accentColor }} />
      </div>
      <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--foreground)', marginBottom: 3 }}>{label}</p>
      <p style={{ fontSize: 11, color: 'var(--muted-foreground)' }}>{desc}</p>
    </motion.a>
  );
};

const SectionCard = ({ title, icon: Icon, children }: any) => {
  const { theme } = useTheme();
  return (
    <div style={{
      backgroundColor: 'var(--card)',
      border: '1px solid var(--border)',
      borderRadius: 16,
      padding: '20px',
      boxShadow: theme === 'neon' ? '0 0 20px #00ffff08' : 'none',
    }}>
      <h3 style={{
        display: 'flex', alignItems: 'center', gap: 8,
        fontSize: 12, fontWeight: 700, color: 'var(--muted-foreground)',
        textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16
      }}>
        <Icon size={14} />
        {title}
      </h3>
      {children}
    </div>
  );
};

const activityData: any[] = [];
const studentProgressData: any[] = [];

const TeacherDashboard = ({ data }: any) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
    <div>
      <h2 style={{ fontSize: 15, fontWeight: 700, color: 'var(--foreground)', marginBottom: 16, opacity: 0.6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Thống kê tổng quan</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        <StatCard icon={FileText} label="Đề thi đã tạo" value={data?.stats?.exams || 0} accentColor="#6366f1" />
        <StatCard icon={Users} label="Lượt làm bài" value={data?.stats?.submissions || 0} accentColor="#8b5cf6" />
        <StatCard icon={Zap} label="Độ chính xác" value={`${data?.stats?.accuracyRate || '0.0'}%`} accentColor="#10b981" />
        <StatCard icon={TrendingUp} label="Điểm TB" value={data?.stats?.avgScore || '0.0'} accentColor="#f59e0b" />
      </div>
    </div>

    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
      <SectionCard title="Biểu đồ lượt làm bài (7 ngày)" icon={BarChart3}>
        <div style={{ height: 220 }}>
          {activityData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activityData}>
                <defs>
                  <linearGradient id="colorSub" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} />
                <Tooltip contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, color: 'var(--foreground)' }} />
                <Area type="monotone" dataKey="submissions" stroke="var(--primary)" strokeWidth={2.5} fillOpacity={1} fill="url(#colorSub)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--muted-foreground)', fontSize: 13, fontStyle: 'italic' }}>
              Chưa có dữ liệu hoạt động trong 7 ngày qua
            </div>
          )}
        </div>
      </SectionCard>

      <SectionCard title="Đề thi mới nhất" icon={Clock}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {data?.recentActivity?.length > 0 ? data.recentActivity.map((item: any) => (
            <div key={item.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, paddingBottom: 10, borderBottom: '1px solid var(--border)' }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--primary)', marginTop: 5, flexShrink: 0 }} />
              <div>
                <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--foreground)', lineHeight: 1.4 }}>{item.title}</p>
                <p style={{ fontSize: 11, color: 'var(--muted-foreground)', marginTop: 2 }}>{new Date(item.createdAt).toLocaleDateString('vi-VN')}</p>
              </div>
            </div>
          )) : (
            <p style={{ fontSize: 13, color: 'var(--muted-foreground)', fontStyle: 'italic', textAlign: 'center', padding: '24px 0' }}>Chưa có đề thi nào</p>
          )}
        </div>
      </SectionCard>
    </div>

    <div>
      <h2 style={{ fontSize: 15, fontWeight: 700, color: 'var(--foreground)', marginBottom: 16, opacity: 0.6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Thao tác nhanh</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        <QuickAction icon={PlusCircle} label="Tạo đề mới" desc="Soạn đề từ đầu" href="/teacher/create" accentColor="#6366f1" />
        <QuickAction icon={Upload} label="Upload & OCR" desc="Tải file đề lên" href="/teacher/upload" accentColor="#8b5cf6" />
        <QuickAction icon={ClipboardList} label="Quản lý đề thi" desc="Sửa, xoá, publish" href="/teacher/exams" accentColor="#10b981" />
        <QuickAction icon={BookOpen} label="Ngân hàng câu" desc="Quản lý câu hỏi" href="/teacher/questions" accentColor="#f59e0b" />
      </div>
    </div>
  </div>
);

const StudentDashboard = ({ data }: any) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
    <div>
      <h2 style={{ fontSize: 15, fontWeight: 700, color: 'var(--foreground)', marginBottom: 16, opacity: 0.6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tiến độ học tập</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        <StatCard icon={ClipboardList} label="Đề đã làm" value={data?.stats?.examsDone || 0} accentColor="#6366f1" />
        <StatCard icon={TrendingUp} label="Điểm trung bình" value={data?.stats?.avgScore || '0.0'} accentColor="#10b981" />
        <StatCard icon={Zap} label="Chuỗi ngày" value={`${data?.stats?.streak || 0} 🔥`} accentColor="#f59e0b" />
        <StatCard icon={Bookmark} label="Đã bookmark" value={data?.stats?.bookmarks || 0} accentColor="#8b5cf6" />
      </div>
    </div>

    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
      <SectionCard title="Xu hướng điểm số" icon={TrendingUp}>
        <div style={{ height: 200 }}>
          {studentProgressData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={studentProgressData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} />
                <YAxis axisLine={false} tickLine={false} domain={[0, 10]} tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} />
                <Tooltip contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, color: 'var(--foreground)' }} />
                <Line type="monotone" dataKey="score" stroke="#10b981" strokeWidth={2.5} dot={{ r: 4, fill: '#10b981', stroke: 'var(--card)', strokeWidth: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--muted-foreground)', fontSize: 13, fontStyle: 'italic' }}>
              Chưa có dữ liệu tiến độ học tập
            </div>
          )}
        </div>
      </SectionCard>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <SectionCard title="Đề thi gần đây" icon={Clock}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {data?.recentExams?.length > 0 ? data.recentExams.map((item: any) => (
              <div key={item.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, overflow: 'hidden' }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', flexShrink: 0 }} />
                  <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--foreground)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</span>
                </div>
                <p style={{ fontSize: 12, fontWeight: 700, color: '#10b981', flexShrink: 0 }}>{item.score}</p>
              </div>
            )) : (
              <p style={{ fontSize: 12, color: 'var(--muted-foreground)', fontStyle: 'italic' }}>Chưa có bài thi nào</p>
            )}
          </div>
        </SectionCard>
      </div>
    </div>

    <div>
      <h2 style={{ fontSize: 15, fontWeight: 700, color: 'var(--foreground)', marginBottom: 16, opacity: 0.6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tiếp tục hành trình</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        <QuickAction icon={ClipboardList} label="Vào thi" desc="Danh sách đề" href="/student/exams" accentColor="#6366f1" />
        <QuickAction icon={BookOpen} label="Luyện tập" desc="Câu ngẫu nhiên" href="/student/practice" accentColor="#8b5cf6" />
        <QuickAction icon={History} label="Lịch sử" desc="Kết quả làm bài" href="/student/history" accentColor="#10b981" />
        <QuickAction icon={Bookmark} label="Đã lưu" desc="Câu hỏi bookmark" href="/student/bookmarks" accentColor="#f59e0b" />
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
      <div style={{ padding: 32, textAlign: 'center', color: '#ef4444' }}>
        <p>Lỗi khi tải dữ liệu thống kê.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '32px 40px', maxWidth: 1400, margin: '0 auto' }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: 32 }}
      >
        <h1 style={{
          fontSize: 28, fontWeight: 900,
          color: 'var(--foreground)',
          letterSpacing: '-0.03em',
          lineHeight: 1.2,
        }}>
          Xin chào{user?.email ? `, ${user.email.split('@')[0]}` : ''}! 👋
        </h1>
        <p style={{ color: 'var(--muted-foreground)', marginTop: 6, fontSize: 14 }}>
          {activeRole === 'TEACHER'
            ? 'Bạn đang ở chế độ Giáo viên. Hãy theo dõi tình hình làm bài của học sinh.'
            : 'Bạn đang ở chế độ Học sinh. Hãy tiếp tục luyện tập để cải thiện điểm số!'}
        </p>
      </motion.div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeRole}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {activeRole === 'TEACHER' ? (
            <TeacherDashboard data={data} />
          ) : (
            <StudentDashboard data={data} />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
