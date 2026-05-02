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
import { GraduationCap, Mail, Lock, User, Globe, Eye, EyeOff, ArrowRight, Check, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const registerSchema = z.object({
  username: z.string().min(2, 'Tên ít nhất 2 ký tự').max(30, 'Tên tối đa 30 ký tự'),
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(8, 'Mật khẩu ít nhất 8 ký tự'),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: 'Mật khẩu xác nhận không khớp',
  path: ['confirmPassword'],
});

type RegisterForm = z.infer<typeof registerSchema>;

const passwordRules = [
  { label: '8+ KÝ TỰ', test: (v: string) => v.length >= 8 },
  { label: 'CHỮ HOA', test: (v: string) => /[A-Z]/.test(v) },
  { label: 'CHỮ SỐ', test: (v: string) => /[0-9]/.test(v) },
];

export default function RegisterPage() {
  const { theme } = useTheme();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const [success, setSuccess] = useState(false);
  const { register: authRegister, loginWithGoogle } = useAuth();
  const router = useRouter();

  const { register, handleSubmit, watch, formState: { errors } } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    mode: 'onChange',
  });

  const passwordValue = watch('password', '');

  const onSubmit = async (data: RegisterForm) => {
    setIsLoading(true);
    setServerError('');
    try {
      await authRegister(data.email, data.password, data.username);
      setSuccess(true);
      setTimeout(() => router.push('/login'), 3000);
    } catch (err: any) {
      setServerError(err?.message || 'Đăng ký thất bại. Vui lòng thử lại.');
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

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md bg-card p-12 rounded-[3rem] border border-border shadow-2xl"
        >
          <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6 border border-success/20">
            <Check className="w-10 h-10 text-success" />
          </div>
          <h2 className="text-3xl font-black text-foreground mb-4 tracking-tighter uppercase">ĐĂNG KÝ THÀNH CÔNG!</h2>
          <p className="text-muted-foreground font-bold leading-relaxed">
            Chúng tôi đã gửi email xác nhận tới địa chỉ của bạn. Vui lòng kiểm tra hộp thư để kích hoạt tài khoản trước khi đăng nhập.
          </p>
          <div className="mt-8 flex items-center justify-center gap-3 text-primary font-black text-xs uppercase tracking-widest">
             <Loader2 className="w-4 h-4 animate-spin" />
             Chuyển hướng sau giây lát...
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-background selection:bg-primary/30">
      {/* Left Panel */}
      <div className={cn(
        "hidden lg:flex lg:w-2/5 relative overflow-hidden flex-col justify-center items-center p-16 transition-all duration-700",
        theme === 'neon' 
          ? "bg-linear-to-br from-[#020010] to-[#050018]" 
          : "bg-linear-to-br from-indigo-950 to-slate-950"
      )}>
        {/* Animated Orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40">
          <motion.div
            animate={{ scale: [1, 1.2, 1], rotate: [0, 45, 0] }}
            transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
            className="absolute top-1/4 -left-20 w-[400px] h-[400px] bg-primary/20 rounded-full blur-[100px]"
          />
          <motion.div
            animate={{ scale: [1.2, 1, 1.2], x: [0, 50, 0] }}
            transition={{ duration: 12, repeat: Infinity, ease: 'linear', delay: 3 }}
            className="absolute bottom-1/4 -right-20 w-[300px] h-[300px] bg-indigo-500/20 rounded-full blur-[100px]"
          />
        </div>

        <div className="relative z-10 text-center space-y-8 max-w-sm">
          <div className="w-20 h-20 bg-white/10 backdrop-blur-xl border border-white/20 rounded-[2rem] flex items-center justify-center mx-auto shadow-2xl">
            <GraduationCap className="w-10 h-10 text-white" />
          </div>
          <div>
             <h1 className="text-4xl font-black text-white mb-4 tracking-tighter uppercase leading-tight">Bắt đầu hành trình</h1>
             <p className="text-indigo-200 text-lg font-medium leading-relaxed opacity-90">
                Tham gia cộng đồng 50,000+ học viên đang chinh phục tri thức mỗi ngày cùng AzotaDB.
             </p>
          </div>
          
          <div className="pt-8 flex justify-center gap-2">
             <div className="w-2 h-2 rounded-full bg-white/20" />
             <div className="w-8 h-2 rounded-full bg-white" />
             <div className="w-2 h-2 rounded-full bg-white/20" />
          </div>
        </div>
      </div>

      {/* Right Panel - Register Form */}
      <div className="w-full lg:w-3/5 flex items-center justify-center p-8 bg-background relative overflow-hidden">
        {theme === 'neon' && (
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,255,255,0.03)_0%,transparent_70%)] pointer-events-none" />
        )}

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-[440px] py-12 relative z-10"
        >
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-xl shadow-primary/20">
              <GraduationCap className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="font-black text-2xl text-foreground tracking-tighter uppercase">AzotaDB</span>
          </div>

          <h2 className="text-4xl font-black text-foreground mb-2 tracking-tighter">Tạo tài khoản</h2>
          <p className="text-muted-foreground font-bold mb-10">Hoàn toàn miễn phí. Bắt đầu ngay trong 30 giây.</p>

          {/* Social Register */}
          <button
            onClick={handleGoogleLogin}
            disabled={googleLoading}
            className="w-full flex items-center justify-center gap-3 py-4 px-6 rounded-2xl bg-card border border-border text-foreground font-black text-xs uppercase tracking-widest transition-all hover:bg-muted hover:border-primary/30 shadow-sm disabled:opacity-50"
          >
            <Globe className="w-5 h-5 text-primary" />
            {googleLoading ? 'Đang kết nối...' : 'ĐĂNG KÝ VỚI GOOGLE'}
          </button>

          <div className="relative flex items-center gap-4 my-8">
            <div className="flex-1 h-px bg-border/60" />
            <span className="text-[10px] font-black text-muted-foreground tracking-[0.2em]">HOẶC</span>
            <div className="flex-1 h-px bg-border/60" />
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {/* Username */}
               <div className="space-y-2 md:col-span-2">
                  <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Tên hiển thị</label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <input
                      {...register('username')}
                      placeholder="Nguyễn Văn A"
                      className="w-full pl-12 pr-6 py-4 bg-background border border-border rounded-2xl font-bold text-sm focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all"
                    />
                  </div>
                  {errors.username && <p className="text-destructive text-xs font-bold mt-1 ml-1">{errors.username.message}</p>}
               </div>

               {/* Email */}
               <div className="space-y-2 md:col-span-2">
                  <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Email liên hệ</label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <input
                      {...register('email')}
                      type="email"
                      placeholder="name@example.com"
                      className="w-full pl-12 pr-6 py-4 bg-background border border-border rounded-2xl font-bold text-sm focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all"
                    />
                  </div>
                  {errors.email && <p className="text-destructive text-xs font-bold mt-1 ml-1">{errors.email.message}</p>}
               </div>

               {/* Password */}
               <div className="space-y-2">
                  <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Mật khẩu</label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <input
                      {...register('password')}
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      className="w-full pl-12 pr-12 py-4 bg-background border border-border rounded-2xl font-bold text-sm focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all"
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors">
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
               </div>

               {/* Confirm Password */}
               <div className="space-y-2">
                  <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Xác nhận</label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <input
                      {...register('confirmPassword')}
                      type={showConfirm ? 'text' : 'password'}
                      placeholder="••••••••"
                      className="w-full pl-12 pr-12 py-4 bg-background border border-border rounded-2xl font-bold text-sm focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all"
                    />
                    <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors">
                      {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
               </div>
            </div>

            {/* Password Rules */}
            {passwordValue && (
              <div className="flex flex-wrap gap-3 px-1">
                {passwordRules.map(({ label, test }) => (
                  <div key={label} className={cn(
                    "flex items-center gap-1.5 text-[9px] font-black tracking-widest px-2 py-1 rounded-md border transition-all",
                    test(passwordValue) ? "bg-success/10 text-success border-success/30" : "bg-muted text-muted-foreground border-border"
                  )}>
                    <div className={cn("w-1.5 h-1.5 rounded-full", test(passwordValue) ? "bg-success" : "bg-muted-foreground/30")} />
                    {label}
                  </div>
                ))}
              </div>
            )}

            {(errors.password || errors.confirmPassword) && (
               <p className="text-destructive text-xs font-bold px-1">
                  {errors.password?.message || errors.confirmPassword?.message}
               </p>
            )}

            {serverError && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                className="p-4 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-bold leading-relaxed">
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
                <>TẠO TÀI KHOẢN NGAY <ArrowRight className="w-5 h-5" /></>
              )}
            </button>

            <p className="text-center text-[10px] font-bold text-muted-foreground px-4 leading-relaxed uppercase tracking-tighter">
              Bằng cách đăng ký, bạn đồng ý với{' '}
              <Link href="/terms" className="text-primary hover:underline font-black">Điều khoản</Link>
              {' • '}
              <Link href="/privacy" className="text-primary hover:underline font-black">Chính sách bảo mật</Link>
            </p>
          </form>

          <p className="text-center text-sm font-bold text-muted-foreground mt-10">
            Đã có tài khoản?{' '}
            <Link href="/login" className="text-primary hover:underline font-black">
              ĐĂNG NHẬP NGAY
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
