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
    <aside
      className="app-sidebar w-64 shrink-0 h-screen sticky top-0 flex flex-col"
      style={{ backgroundColor: 'var(--sidebar-bg)', borderRight: '1px solid var(--sidebar-border)' }}
    >
      {/* Logo */}
      <div style={{ padding: '20px', borderBottom: '1px solid var(--sidebar-border)', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
          width: 36, height: 36,
          background: theme === 'neon' ? 'linear-gradient(135deg, #00ffff, #0080ff)' : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
          borderRadius: 10,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: theme === 'neon' ? '0 0 15px #00ffff55' : 'none',
          flexShrink: 0
        }}>
          <GraduationCap size={18} color="#fff" />
        </div>
        <div>
          <p style={{ fontWeight: 800, fontSize: 14, color: 'var(--foreground)', letterSpacing: '-0.02em' }}>AzotaDB</p>
          <p style={{ fontSize: 11, color: 'var(--muted-foreground)' }}>Luyện đề thông minh</p>
        </div>
      </div>

      {/* Theme Switcher */}
      <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--sidebar-border)' }}>
        <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>Giao diện</p>
        <div style={{
          display: 'flex',
          gap: 4,
          background: 'var(--muted)',
          padding: 4,
          borderRadius: 10,
          border: '1px solid var(--border)'
        }}>
          {THEMES.map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => setTheme(id)}
              title={label}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 4,
                padding: '6px 4px',
                borderRadius: 7,
                border: 'none',
                cursor: 'pointer',
                fontSize: 10,
                fontWeight: 700,
                transition: 'all 0.2s ease',
                background: theme === id
                  ? id === 'neon'
                    ? 'linear-gradient(135deg, #00ffff22, #0080ff22)'
                    : 'var(--card)'
                  : 'transparent',
                color: theme === id
                  ? id === 'neon' ? '#00ffff' : 'var(--primary)'
                  : 'var(--muted-foreground)',
                boxShadow: theme === id
                  ? id === 'neon' ? '0 0 10px #00ffff33' : '0 1px 4px rgba(0,0,0,0.1)'
                  : 'none',
              }}
            >
              <Icon size={13} />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Role Toggle */}
      <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--sidebar-border)' }}>
        <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>Chế độ</p>
        <button
          onClick={handleRoleSwitch}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 14px',
            borderRadius: 10,
            border: `1px solid ${isTeacher ? '#7c3aed44' : '#4f46e544'}`,
            background: isTeacher
              ? theme === 'neon' ? '#7c3aed11' : 'rgba(109,40,217,0.07)'
              : theme === 'neon' ? '#00ffff11' : 'rgba(99,102,241,0.07)',
            color: 'var(--foreground)',
            cursor: 'pointer',
            fontSize: 13,
            fontWeight: 600,
            transition: 'all 0.2s ease',
          }}
        >
          <span>{isTeacher ? '🎓 Giáo viên' : '📚 Học sinh'}</span>
          <span style={{ fontSize: 11, color: 'var(--muted-foreground)' }}>Chuyển →</span>
        </button>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '12px', overflowY: 'auto' }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeRole}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 8 }}
            transition={{ duration: 0.15 }}
            style={{ display: 'flex', flexDirection: 'column', gap: 2 }}
          >
            {menu.map(({ href, icon: Icon, label }) => {
              const isActive = pathname === href || pathname.startsWith(href + '/');
              return (
                <Link
                  key={href}
                  href={href}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '9px 12px',
                    borderRadius: 10,
                    textDecoration: 'none',
                    fontSize: 13,
                    fontWeight: isActive ? 700 : 500,
                    transition: 'all 0.15s ease',
                    background: isActive
                      ? theme === 'neon'
                        ? 'linear-gradient(135deg, #00ffff15, #0080ff10)'
                        : 'var(--accent)'
                      : 'transparent',
                    color: isActive
                      ? theme === 'neon' ? '#00ffff' : 'var(--primary)'
                      : 'var(--muted-foreground)',
                    boxShadow: isActive && theme === 'neon' ? '0 0 10px #00ffff22' : 'none',
                    borderLeft: isActive
                      ? `3px solid ${theme === 'neon' ? '#00ffff' : 'var(--primary)'}`
                      : '3px solid transparent',
                  }}
                >
                  <Icon size={16} style={{ flexShrink: 0 }} />
                  <span style={{ flex: 1 }}>{label}</span>
                  {isActive && <ChevronRight size={12} />}
                </Link>
              );
            })}
          </motion.div>
        </AnimatePresence>
      </nav>

      {/* User Profile */}
      <div style={{ padding: '12px 16px', borderTop: '1px solid var(--sidebar-border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'linear-gradient(135deg, #6366f1, #a78bfa)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 800, fontSize: 14, flexShrink: 0,
            boxShadow: theme === 'neon' ? '0 0 10px #6366f155' : 'none',
          }}>
            {user?.email?.[0]?.toUpperCase() ?? 'U'}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--foreground)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.email ?? 'User'}
            </p>
            <p style={{ fontSize: 11, color: 'var(--muted-foreground)' }}>
              {activeRole === 'TEACHER' ? 'Giáo viên' : 'Học sinh'}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 6 }}>
          <Link
            href="/settings"
            style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
              padding: '7px 0', borderRadius: 8, border: '1px solid var(--border)',
              textDecoration: 'none', fontSize: 11, fontWeight: 600, color: 'var(--muted-foreground)',
              background: 'transparent', transition: 'all 0.15s',
            }}
          >
            <Settings size={13} />
            Cài đặt
          </Link>
          <button
            onClick={handleLogout}
            style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
              padding: '7px 0', borderRadius: 8, border: '1px solid #ef444422',
              fontSize: 11, fontWeight: 600, color: '#ef4444',
              background: 'transparent', cursor: 'pointer', transition: 'all 0.15s',
            }}
          >
            <LogOut size={13} />
            Đăng xuất
          </button>
        </div>
      </div>
    </aside>
  );
}
