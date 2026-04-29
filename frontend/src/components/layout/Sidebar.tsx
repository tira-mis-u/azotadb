'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  BookOpen, LayoutDashboard, ClipboardList, History, Bookmark,
  PlusCircle, FileText, BarChart3, Database, Upload,
  GraduationCap, ChevronRight, LogOut, Settings
} from 'lucide-react';

const studentMenu = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Tổng quan' },
  { href: '/student/exams', icon: ClipboardList, label: 'Danh sách đề thi' },
  { href: '/student/practice', icon: BookOpen, label: 'Luyện tập' },
  { href: '/student/history', icon: History, label: 'Lịch sử làm bài' },
  { href: '/student/bookmarks', icon: Bookmark, label: 'Câu đã bookmark' },
];

const teacherMenu = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Tổng quan' },
  { href: '/teacher/exams', icon: FileText, label: 'Quản lý đề thi' },
  { href: '/teacher/create', icon: PlusCircle, label: 'Tạo đề mới' },
  { href: '/teacher/questions', icon: Database, label: 'Ngân hàng câu hỏi' },
  { href: '/teacher/upload', icon: Upload, label: 'Upload & OCR' },
  { href: '/teacher/stats', icon: BarChart3, label: 'Thống kê' },
];

export default function Sidebar() {
  const { user, activeRole, switchRole, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const menu = activeRole === 'TEACHER' ? teacherMenu : studentMenu;
  const isTeacher = activeRole === 'TEACHER';

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const handleRoleSwitch = async () => {
    const newRole = isTeacher ? 'STUDENT' : 'TEACHER';
    await switchRole(newRole as any);
  };

  return (
    <aside className="w-64 shrink-0 h-screen sticky top-0 flex flex-col bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800">
      {/* Logo */}
      <div className="flex items-center gap-3 p-5 border-b border-gray-100 dark:border-gray-800">
        <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center shrink-0">
          <GraduationCap className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="font-bold text-gray-900 dark:text-white text-sm">AzotaDB</p>
          <p className="text-xs text-gray-400">Luyện đề thông minh</p>
        </div>
      </div>

      {/* Role Toggle */}
      <div className="p-4 border-b border-gray-100 dark:border-gray-800">
        <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-2">Chế độ hiện tại</p>
        <button
          onClick={handleRoleSwitch}
          className={`w-full flex items-center justify-between p-3 rounded-xl transition-all text-sm font-medium
            ${isTeacher
              ? 'bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-800'
              : 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800'
            }`}
        >
          <span>{isTeacher ? '🎓 Giáo viên' : '📚 Học sinh'}</span>
          <span className="text-xs opacity-60">Chuyển →</span>
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeRole}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 8 }}
            transition={{ duration: 0.15 }}
            className="space-y-1"
          >
            {menu.map(({ href, icon: Icon, label }) => {
              const isActive = pathname === href || pathname.startsWith(href + '/');
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group
                    ${isActive
                      ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                    }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300'}`} />
                  {label}
                  {isActive && <ChevronRight className="w-3 h-3 ml-auto text-indigo-400" />}
                </Link>
              );
            })}
          </motion.div>
        </AnimatePresence>
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-400 to-purple-400 flex items-center justify-center text-white text-sm font-bold shrink-0">
            {user?.email?.[0]?.toUpperCase() ?? 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user?.email ?? 'User'}</p>
            <p className="text-xs text-gray-400">{activeRole === 'TEACHER' ? 'Giáo viên' : 'Học sinh'}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href="/settings" className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all">
            <Settings className="w-3.5 h-3.5" /> Cài đặt
          </Link>
          <button
            onClick={handleLogout}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
          >
            <LogOut className="w-3.5 h-3.5" /> Đăng xuất
          </button>
        </div>
      </div>
    </aside>
  );
}
