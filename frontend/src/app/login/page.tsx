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
import { cn } from '@/lib/utils';

const loginSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(6, 'Mật khẩu ít nhất 6 ký tự'),
});

type LoginForm = z.infer<typeof loginSchema>;

const features = [
  { icon: BookOpen, label: 'Kho đề thi đa dạng', desc: '1000+ đề từ các trường top' },
  { icon: BarChart3, label: 'Phân tích kết quả', desc: 'Theo dõi lộ trình học tập' },
  { icon: Users, label: 'Cộng đồng học tập', desc: 'Kết nối 50,000+ học viên' },
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
    <div className="min-h-screen flex bg-background selection:bg-primary/30">
      {/* Left Panel - Brand/Features */}
      <div className={cn(
        "hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col justify-between p-16 transition-all duration-700",
        theme === 'neon' 
          ? "bg-linear-to-br from-[#020010] to-[#050018]" 
          : "bg-linear-to-br from-slate-950 to-indigo-950"
      )}>
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-50">
          <motion.div
            animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0], x: [0, 100, 0] }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            className="absolute -top-32 -left-32 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px]"
          />
          <motion.div
            animate={{ scale: [1.2, 1, 1.2], rotate: [0, -60, 0], y: [0, 100, 0] }}
            transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
            className="absolute -bottom-32 -right-32 w-[400px] h-[400px] bg-cyan-500/10 rounded-full blur-[100px]"
          />
        </div>

        {/* Logo Section */}
        <div className="relative z-10 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="flex items-center gap-4 mb-3">
            <div className="w-12 h-12 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl flex items-center justify-center shadow-2xl">
              <GraduationCap className="w-7 h-7 text-white" />
            </div>
            <span className="text-white font-black text-2xl tracking-tighter uppercase">AzotaDB</span>
          </div>
          <p className="text-indigo-300 font-bold text-sm tracking-widest uppercase opacity-80">Smart Learning Ecosystem</p>
        </div>

        {/* Content Section */}
        <div className="relative z-10 max-w-lg">
          <motion.h1
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="text-5xl font-black text-white leading-[1.1] mb-6 tracking-tighter"
          >
            Nâng tầm kết quả học tập của bạn
          </motion.h1>
          <p className="text-indigo-200 text-xl mb-12 font-medium leading-relaxed opacity-90">
            Luyện đề thông minh, chấm bài tức thì và phân tích chuyên sâu năng lực mỗi ngày.
          </p>

          <div className="grid gap-4">
            {features.map(({ icon: Icon, label, desc }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="flex items-center gap-5 p-5 rounded-3xl bg-white/5 backdrop-blur-md border border-white/10 group hover:bg-white/10 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center shrink-0 shadow-inner group-hover:scale-110 transition-transform">
                  <Icon className="w-6 h-6 text-indigo-300" />
                </div>
                <div>
                  <p className="text-white font-black text-sm uppercase tracking-wide">{label}</p>
                  <p className="text-indigo-300/80 text-xs font-bold mt-0.5">{desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="relative z-10 flex items-center justify-between">
           <p className="text-indigo-500/50 text-[10px] font-black uppercase tracking-[0.2em]">© 2026 AzotaDB Corporation</p>
           <div className="flex gap-4 opacity-50">
              <div className="w-1.5 h-1.5 rounded-full bg-white" />
              <div className="w-1.5 h-1.5 rounded-full bg-white" />
              <div className="w-1.5 h-1.5 rounded-full bg-white" />
           </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-background relative overflow-hidden">
        {/* Subtle background glow for Neon theme */}
        {theme === 'neon' && (
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,255,255,0.05)_0%,transparent_70%)] pointer-events-none" />
        )}
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-[420px] relative z-10"
        >
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-xl shadow-primary/20">
              <GraduationCap className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="font-black text-2xl text-foreground tracking-tighter uppercase">AzotaDB</span>
          </div>

          <h2 className="text-4xl font-black text-foreground mb-2 tracking-tighter">Chào mừng trở lại!</h2>
          <p className="text-muted-foreground font-bold mb-10">Tiếp tục hành trình chinh phục tri thức của bạn.</p>

          {/* Social Login */}
          <button
            onClick={handleGoogleLogin}
            disabled={googleLoading}
            className="w-full flex items-center justify-center gap-3 py-4 px-6 rounded-2xl bg-card border border-border text-foreground font-black text-xs uppercase tracking-widest transition-all hover:bg-muted hover:border-primary/30 shadow-sm disabled:opacity-50"
          >
            <Globe className="w-5 h-5 text-primary" />
            {googleLoading ? 'Đang kết nối...' : 'Tiếp tục với Google'}
          </button>

          <div className="relative flex items-center gap-4 my-8">
            <div className="flex-1 h-px bg-border/60" />
            <span className="text-[10px] font-black text-muted-foreground tracking-[0.2em]">HOẶC</span>
            <div className="flex-1 h-px bg-border/60" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Email của bạn</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <input
                  {...register('email')}
                  type="email"
                  placeholder="name@example.com"
                  className="w-full pl-12 pr-6 py-4 bg-background border border-border rounded-2xl font-bold text-sm focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all placeholder:text-muted-foreground/60"
                />
              </div>
              {errors.email && <p className="text-destructive text-xs font-bold mt-1 ml-1">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest">Mật khẩu</label>
                <Link href="/forgot-password" size="sm" className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline">Quên mật khẩu?</Link>
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-12 py-4 bg-background border border-border rounded-2xl font-bold text-sm focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all placeholder:text-muted-foreground/60"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && <p className="text-destructive text-xs font-bold mt-1 ml-1">{errors.password.message}</p>}
            </div>

            {serverError && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-bold leading-relaxed"
              >
                {serverError}
              </motion.div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 py-4.5 px-6 rounded-2xl bg-primary text-primary-foreground font-black text-sm uppercase tracking-[0.1em] transition-all hover:scale-[1.02] shadow-2xl shadow-primary/30 disabled:opacity-50"
            >
              {isLoading ? (
                 <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>ĐĂNG NHẬP NGAY <ArrowRight className="w-5 h-5" /></>
              )}
            </button>
          </form>

          <p className="text-center text-sm font-bold text-muted-foreground mt-10">
            Chưa có tài khoản?{' '}
            <Link href="/register" className="text-primary hover:underline font-black">
              ĐĂNG KÝ MIỄN PHÍ
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}

function Loader2(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}
