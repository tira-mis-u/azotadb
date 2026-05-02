'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  BookOpen, LayoutDashboard, ClipboardList, History, Bookmark,
  PlusCircle, FileText, BarChart3, Database, Upload,
  GraduationCap, ChevronRight, LogOut, Settings, Sun, Moon, Zap
} from 'lucide-react';
import { useTheme } from '@/components/providers/theme-provider';
import { cn } from '@/lib/utils';

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

const THEMES = [
  { id: 'light' as const, icon: Sun, label: 'Sáng' },
  { id: 'dark' as const, icon: Moon, label: 'Tối' },
  { id: 'neon' as const, icon: Zap, label: 'Neon' },
];

export default function Sidebar() {
  const { user, activeRole, switchRole, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();
  const router = useRouter();

  const menu = activeRole === 'TEACHER' ? teacherMenu : studentMenu;
  const isTeacher = activeRole === 'TEACHER';

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const handleRoleSwitch = async () => {
    await switchRole((isTeacher ? 'STUDENT' : 'TEACHER') as any);
  };

  return (
    <aside className="w-64 shrink-0 h-screen sticky top-0 flex flex-col bg-card border-r border-border transition-colors duration-300">
      {/* Logo */}
      <div className="p-5 border-b border-border flex items-center gap-3">
        <div className={cn(
          "w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-500 shadow-sm",
          theme === 'neon' 
            ? "bg-linear-to-br from-cyan-400 to-blue-600 shadow-[0_0_15px_rgba(0,255,255,0.4)]" 
            : "bg-linear-to-br from-indigo-600 to-purple-600"
        )}>
          <GraduationCap size={18} className="text-white" />
        </div>
        <div className="overflow-hidden">
          <p className="font-extrabold text-sm text-foreground tracking-tight leading-none">QuizzOrz</p>
          <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider mt-1">Luyện đề thông minh</p>
        </div>
      </div>

      {/* Theme Switcher */}
      <div className="p-4 border-b border-border">
        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2.5 px-1">Giao diện</p>
        <div className="flex gap-1 bg-muted p-1 rounded-xl border border-border shadow-inner">
          {THEMES.map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => setTheme(id)}
              title={label}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[10px] font-bold transition-all duration-200",
                theme === id
                  ? "bg-card text-primary shadow-sm ring-1 ring-border/50"
                  : "text-muted-foreground hover:text-foreground hover:bg-background/50"
              )}
            >
              <Icon size={13} className={cn("transition-transform", theme === id && "scale-110")} />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Role Toggle */}
      <div className="p-4 border-b border-border">
        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2.5 px-1">Chế độ</p>
        <button
          onClick={handleRoleSwitch}
          className={cn(
            "w-full flex items-center justify-between p-3 rounded-xl border font-bold text-sm transition-all duration-200 group",
            isTeacher 
              ? "border-purple-500/20 bg-purple-500/5 hover:bg-purple-500/10 text-foreground" 
              : "border-indigo-500/20 bg-indigo-500/5 hover:bg-indigo-500/10 text-foreground"
          )}
        >
          <span className="flex items-center gap-2">
             <span className="text-base">{isTeacher ? '🎓' : '📚'}</span>
             {isTeacher ? 'Giáo viên' : 'Học sinh'}
          </span>
          <span className="text-[10px] text-primary font-black uppercase tracking-tighter opacity-0 group-hover:opacity-100 transition-opacity">Chuyển →</span>
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 overflow-y-auto space-y-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeRole}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 8 }}
            transition={{ duration: 0.15 }}
            className="flex flex-col gap-1"
          >
            {menu.map(({ href, icon: Icon, label }) => {
              const isActive = pathname === href || pathname.startsWith(href + '/');
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 group",
                    isActive
                      ? "sidebar-item-active"
                      : "text-foreground font-medium hover:bg-muted hover:text-primary"
                  )}
                >
                  <Icon 
                    size={18} 
                    className={cn(
                      "flex-shrink-0 transition-colors", 
                      isActive ? "text-primary" : "text-muted-foreground group-hover:text-primary"
                    )} 
                  />
                  <span className="flex-1">{label}</span>
                  {isActive && <ChevronRight size={14} className="animate-in fade-in slide-in-from-left-1" />}
                </Link>
              );
            })}
          </motion.div>
        </AnimatePresence>
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-border bg-background/30">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-xl bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-sm shadow-md flex-shrink-0">
            {user?.email?.[0]?.toUpperCase() ?? 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-foreground truncate leading-tight">
              {user?.email ?? 'User'}
            </p>
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-0.5">
              {activeRole === 'TEACHER' ? 'Giáo viên' : 'Học sinh'}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Link
            href="/settings"
            className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg border border-border text-[11px] font-bold text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
          >
            <Settings size={14} />
            Cài đặt
          </Link>
          <button
            onClick={handleLogout}
            className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg border border-destructive/20 text-[11px] font-bold text-destructive hover:bg-destructive/10 transition-all"
          >
            <LogOut size={14} />
            Thoát
          </button>
        </div>
      </div>
    </aside>
  );
}
