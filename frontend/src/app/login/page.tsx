'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/components/providers/theme-provider';
import { GraduationCap, Mail, Lock, Globe, Eye, EyeOff, ArrowRight, BookOpen, BarChart3, Users } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(6, 'Mật khẩu ít nhất 6 ký tự'),
});

type LoginForm = z.infer<typeof loginSchema>;

const features = [
  { icon: BookOpen, label: 'Kho đề thi đa dạng', desc: '1000+ đề từ các trường' },
  { icon: BarChart3, label: 'Phân tích kết quả', desc: 'Theo dõi tiến độ học tập' },
  { icon: Users, label: 'Cộng đồng học tập', desc: 'Kết nối với 50,000+ học sinh' },
];

export default function LoginPage() {
  const { theme } = useTheme();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const { login, loginWithGoogle } = useAuth();
  const router = useRouter();

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    setServerError('');
    try {
      await login(data.email, data.password);
      router.push('/dashboard');
    } catch (err: any) {
      setServerError(err?.message || 'Đăng nhập thất bại. Kiểm tra lại email và mật khẩu.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    try {
      await loginWithGoogle();
    } catch (err: any) {
      setServerError(err?.message || 'Đăng nhập Google thất bại.');
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: 'var(--background)' }}>
      {/* Left Panel - Brand/Features */}
      <div 
        className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col justify-between p-12"
        style={{ 
          background: theme === 'neon' 
            ? 'linear-gradient(135deg, #020010, #050018)' 
            : 'linear-gradient(135deg, #0f172a, #1e1b4b)' 
        }}
      >
        {/* Animated blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={{ scale: [1, 1.2, 1], rotate: [0, 30, 0] }}
            transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -top-24 -left-24 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl"
          />
          <motion.div
            animate={{ scale: [1.2, 1, 1.2], rotate: [0, -20, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
            className="absolute -bottom-24 -right-24 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl"
          />
        </div>

        {/* Logo */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-white/10 backdrop-blur border border-white/20 rounded-xl flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <span className="text-white font-bold text-xl">AzotaDB</span>
          </div>
          <p className="text-indigo-300 text-sm">Hệ thống luyện đề thi thông minh</p>
        </div>

        {/* Main headline */}
        <div className="relative z-10">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl font-bold text-white leading-tight mb-4"
          >
            Nâng tầm kết quả học tập của bạn
          </motion.h1>
          <p className="text-indigo-300 text-lg mb-10">
            Luyện đề thi trực tuyến, chấm bài tự động, phân tích điểm yếu và cải thiện kỹ năng mỗi ngày.
          </p>

          {/* Feature list */}
          <div className="flex flex-col gap-4">
            {features.map(({ icon: Icon, label, desc }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.1 }}
                className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 backdrop-blur border border-white/10"
              >
                <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-indigo-300" />
                </div>
                <div>
                  <p className="text-white font-medium text-sm">{label}</p>
                  <p className="text-indigo-400 text-xs">{desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-indigo-500 text-xs">© 2026 AzotaDB. All rights reserved.</p>
      </div>

      {/* Right Panel - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6" style={{ backgroundColor: 'var(--background)' }}>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold" style={{ color: 'var(--foreground)' }}>AzotaDB</span>
          </div>

          <h2 className="text-3xl font-bold mb-1" style={{ color: 'var(--foreground)' }}>Chào mừng trở lại!</h2>
          <p style={{ color: 'var(--muted-foreground)' }} className="mb-8">Đăng nhập để tiếp tục hành trình học tập.</p>

          {/* Google Login */}
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={handleGoogleLogin}
            disabled={googleLoading}
            style={{ 
              backgroundColor: 'var(--card)', 
              borderColor: 'var(--border)', 
              color: 'var(--foreground)' 
            }}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border font-medium text-sm transition-all mb-6 shadow-sm disabled:opacity-60"
          >
            <Globe className="w-5 h-5" />
            {googleLoading ? 'Đang chuyển hướng...' : 'Tiếp tục với Google'}
          </motion.button>

          <div className="relative flex items-center gap-4 mb-6">
            <div className="flex-1 h-px" style={{ backgroundColor: 'var(--border)' }} />
            <span style={{ color: 'var(--muted-foreground)' }} className="text-xs font-medium">HOẶC</span>
            <div className="flex-1 h-px" style={{ backgroundColor: 'var(--border)' }} />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Email */}
            <div>
              <label style={{ color: 'var(--foreground)' }} className="block text-sm font-medium mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  {...register('email')}
                  type="email"
                  placeholder="name@example.com"
                  style={{ 
                    backgroundColor: 'var(--input)', 
                    borderColor: 'var(--border)', 
                    color: 'var(--foreground)' 
                  }}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-sm"
                />
              </div>
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label style={{ color: 'var(--foreground)' }} className="block text-sm font-medium">Mật khẩu</label>
                <Link href="/forgot-password" style={{ color: 'var(--primary)' }} className="text-xs hover:underline">Quên mật khẩu?</Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  style={{ 
                    backgroundColor: 'var(--input)', 
                    borderColor: 'var(--border)', 
                    color: 'var(--foreground)' 
                  }}
                  className="w-full pl-10 pr-10 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
            </div>

            {/* Server error */}
            {serverError && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', borderColor: 'rgba(239, 68, 68, 0.2)' }}
                className="p-3 rounded-xl border text-red-600 text-sm"
              >
                {serverError}
              </motion.div>
            )}

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              type="submit"
              disabled={isLoading}
              style={{ 
                backgroundColor: 'var(--primary)', 
                color: 'var(--primary-foreground)',
                boxShadow: theme === 'neon' ? '0 0 15px var(--primary)' : '0 4px 6px -1px rgba(99, 102, 241, 0.4)'
              }}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-medium text-sm transition-all disabled:opacity-60"
            >
              {isLoading ? (
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
              ) : (
                <>Đăng nhập <ArrowRight className="w-4 h-4" /></>
              )}
            </motion.button>
          </form>

          <p style={{ color: 'var(--muted-foreground)' }} className="text-center text-sm mt-6">
            Chưa có tài khoản?{' '}
            <Link href="/register" style={{ color: 'var(--primary)' }} className="font-medium hover:underline">
              Đăng ký ngay
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
