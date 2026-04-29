'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import {
  BookOpen, PlusCircle, Upload, BarChart3,
  ClipboardList, History, Bookmark, TrendingUp,
  Users, FileText, Zap, Clock
} from 'lucide-react';

const StatCard = ({ icon: Icon, label, value, color }: any) => (
  <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 flex items-center gap-4">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
      <Icon className="w-6 h-6" />
    </div>
    <div>
      <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
      <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
    </div>
  </div>
);

const QuickAction = ({ icon: Icon, label, desc, href, color }: any) => (
  <a
    href={href}
    className="group bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 hover:border-indigo-200 dark:hover:border-indigo-700 hover:shadow-md transition-all"
  >
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color} group-hover:scale-110 transition-transform`}>
      <Icon className="w-5 h-5" />
    </div>
    <p className="font-semibold text-gray-900 dark:text-white text-sm mb-1">{label}</p>
    <p className="text-xs text-gray-400">{desc}</p>
  </a>
);

const TeacherDashboard = () => (
  <div className="space-y-6">
    <div>
      <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Thống kê nhanh</h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={FileText} label="Đề thi đã tạo" value="12" color="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400" />
        <StatCard icon={Users} label="Lượt làm bài" value="348" color="bg-violet-50 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400" />
        <StatCard icon={BookOpen} label="Câu hỏi" value="256" color="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400" />
        <StatCard icon={TrendingUp} label="Điểm trung bình" value="7.4" color="bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400" />
      </div>
    </div>

    <div>
      <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Thao tác nhanh</h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <QuickAction icon={PlusCircle} label="Tạo đề mới" desc="Soạn đề từ đầu" href="/teacher/create" color="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600" />
        <QuickAction icon={Upload} label="Upload & OCR" desc="Tải file đề lên" href="/teacher/upload" color="bg-violet-50 dark:bg-violet-900/30 text-violet-600" />
        <QuickAction icon={BarChart3} label="Xem thống kê" desc="Phân tích kết quả" href="/teacher/stats" color="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600" />
        <QuickAction icon={BookOpen} label="Ngân hàng câu" desc="Quản lý câu hỏi" href="/teacher/questions" color="bg-amber-50 dark:bg-amber-900/30 text-amber-600" />
      </div>
    </div>

    <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800">
      <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
        <Clock className="w-4 h-4 text-gray-400" /> Hoạt động gần đây
      </h3>
      <div className="space-y-3">
        {['Đề thi Toán 12 - Chương 1', 'Đề thi Vật lý - Dao động', 'Đề thi Hóa học - Este'].map((item, i) => (
          <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 dark:border-gray-800 last:border-0">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-indigo-400" />
              <span className="text-sm text-gray-700 dark:text-gray-300">{item}</span>
            </div>
            <span className="text-xs text-gray-400">{i + 1} ngày trước</span>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const StudentDashboard = () => (
  <div className="space-y-6">
    <div>
      <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Tiến độ học tập</h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={ClipboardList} label="Đề đã làm" value="24" color="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400" />
        <StatCard icon={TrendingUp} label="Điểm trung bình" value="8.1" color="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400" />
        <StatCard icon={Zap} label="Chuỗi ngày" value="7 🔥" color="bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400" />
        <StatCard icon={Bookmark} label="Đã bookmark" value="18" color="bg-violet-50 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400" />
      </div>
    </div>

    <div>
      <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Tiếp tục luyện tập</h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <QuickAction icon={BookOpen} label="Luyện tập" desc="Câu hỏi ngẫu nhiên" href="/student/practice" color="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600" />
        <QuickAction icon={ClipboardList} label="Thi ngay" desc="Danh sách đề" href="/student/exams" color="bg-violet-50 dark:bg-violet-900/30 text-violet-600" />
        <QuickAction icon={History} label="Xem lại" desc="Lịch sử làm bài" href="/student/history" color="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600" />
        <QuickAction icon={Bookmark} label="Bookmark" desc="Câu đã lưu" href="/student/bookmarks" color="bg-amber-50 dark:bg-amber-900/30 text-amber-600" />
      </div>
    </div>

    <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800">
      <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
        <Clock className="w-4 h-4 text-gray-400" /> Đề thi gần đây
      </h3>
      <div className="space-y-3">
        {[
          { name: 'Đề thi Toán THPTQG 2024', score: '8.5', time: '2 giờ trước' },
          { name: 'Đề thi Vật lý - Luyện 1', score: '7.0', time: '1 ngày trước' },
          { name: 'Đề thi Hóa học - Đề 3', score: '9.0', time: '3 ngày trước' },
        ].map((item, i) => (
          <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 dark:border-gray-800 last:border-0">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="text-sm text-gray-700 dark:text-gray-300">{item.name}</span>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-emerald-600">{item.score}</p>
              <p className="text-xs text-gray-400">{item.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default function DashboardPage() {
  const { user, activeRole, loading } = useAuth();

  if (loading) {
    return (
      <div className="p-8 space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 bg-gray-100 dark:bg-gray-800 rounded-2xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl font-bold text-gray-900 dark:text-white"
        >
          Xin chào{user?.email ? `, ${user.email.split('@')[0]}` : ''}! 👋
        </motion.h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          {activeRole === 'TEACHER'
            ? 'Bạn đang ở chế độ Giáo viên. Tạo và quản lý đề thi của mình.'
            : 'Bạn đang ở chế độ Học sinh. Hãy tiếp tục luyện tập hôm nay!'}
        </p>
      </div>

      {/* Dynamic Dashboard based on activeRole */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeRole}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.2 }}
        >
          {activeRole === 'TEACHER' ? <TeacherDashboard /> : <StudentDashboard />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
