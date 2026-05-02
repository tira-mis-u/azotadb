import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import axios from 'axios';
import { Loader2, Lock, UserCircle, LogIn, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ExamAccessGuardProps {
  publicId: string;
  onAccessGranted: (payload: { password?: string; guestName?: string; guestSessionId?: string }) => void;
}

interface PublicExam {
  id: string;
  publicId: string;
  title: string;
  requiresPassword: boolean;
  requireLogin: boolean;
}

export function ExamAccessGuard({ publicId, onAccessGranted }: ExamAccessGuardProps) {
  const { session, loading: authLoading } = useAuth();
  const router = useRouter();
  const [exam, setExam] = useState<PublicExam | null>(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<'LOADING' | 'LOGIN_REQUIRED' | 'GUEST_INFO' | 'PASSWORD' | 'GRANTING'>('LOADING');

  // Form states
  const [guestName, setGuestName] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (authLoading) return;
    fetchExamInfo();
  }, [publicId, authLoading]);

  const fetchExamInfo = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/exams/public/${publicId}`);
      const examData = res.data;
      setExam(examData);
      evaluateAccess(examData);
    } catch (err) {
      console.error('Failed to fetch exam public info', err);
      alert('Không tìm thấy bài thi hoặc bài thi chưa được công khai.');
      router.push('/student/exams');
    } finally {
      setLoading(false);
    }
  };

  const evaluateAccess = (examData: PublicExam) => {
    if (examData.requireLogin && !session?.access_token) {
      setStep('LOGIN_REQUIRED');
      return;
    }

    if (!session?.access_token) {
      // Guest flow
      const savedName = localStorage.getItem('guestName');
      if (!savedName) {
        setStep('GUEST_INFO');
        return;
      } else {
        setGuestName(savedName);
      }
    }

    if (examData.requiresPassword) {
      setStep('PASSWORD');
      return;
    }

    grantAccess(guestName, '');
  };

  const handleGuestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim()) return;
    localStorage.setItem('guestName', guestName.trim());
    
    if (exam?.requiresPassword) {
      setStep('PASSWORD');
    } else {
      grantAccess(guestName.trim(), '');
    }
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;
    grantAccess(guestName, password);
  };

  const grantAccess = (name: string, pass: string) => {
    setStep('GRANTING');
    let guestSessionId = localStorage.getItem('guestSessionId');
    if (!guestSessionId) {
      // Simple random ID for guest session
      guestSessionId = Math.random().toString(36).substring(2, 15);
      localStorage.setItem('guestSessionId', guestSessionId);
    }

    onAccessGranted({
      password: pass,
      guestName: session ? undefined : name,
      guestSessionId: session ? undefined : guestSessionId,
    });
  };

  if (loading || authLoading || step === 'LOADING' || step === 'GRANTING') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
        <p className="font-medium text-muted-foreground uppercase tracking-widest text-xs">
          {step === 'GRANTING' ? 'Đang chuẩn bị đề thi...' : 'Đang kiểm tra quyền truy cập...'}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full rounded-3xl p-8 shadow-2xl border border-border bg-card text-center relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary/50 to-indigo-500/50" />
        
        {step === 'LOGIN_REQUIRED' && (
          <div className="space-y-6">
            <div className="w-20 h-20 bg-destructive/10 text-destructive rounded-3xl flex items-center justify-center mx-auto">
              <Lock size={32} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-foreground uppercase tracking-tight">Yêu cầu đăng nhập</h2>
              <p className="text-sm mt-2 text-muted-foreground">Giáo viên yêu cầu bạn phải có tài khoản để làm bài thi này. Vui lòng đăng nhập để tiếp tục.</p>
            </div>
            <button
              onClick={() => router.push(`/auth/login?callbackUrl=/student/exams/${publicId}/take`)}
              className="w-full py-4 bg-primary text-primary-foreground rounded-2xl font-black uppercase tracking-widest text-xs hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3 shadow-xl shadow-primary/20"
            >
              <LogIn size={18} /> Đăng nhập ngay
            </button>
          </div>
        )}

        {step === 'GUEST_INFO' && (
          <form onSubmit={handleGuestSubmit} className="space-y-6">
            <div className="w-20 h-20 bg-primary/10 text-primary rounded-3xl flex items-center justify-center mx-auto">
              <UserCircle size={32} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-foreground uppercase tracking-tight">Thông tin thí sinh</h2>
              <p className="text-sm mt-2 text-muted-foreground">Bạn đang tham gia với tư cách khách. Vui lòng nhập họ tên để giáo viên ghi nhận kết quả.</p>
            </div>
            <input
              type="text"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              placeholder="Nhập họ và tên của bạn..."
              className="w-full px-6 py-4 rounded-2xl border border-border bg-background text-center font-bold text-base focus:ring-4 focus:ring-primary/20 focus:border-primary transition-all outline-none uppercase"
              autoFocus
            />
            <button
              type="submit"
              disabled={!guestName.trim()}
              className="w-full py-4 bg-primary text-primary-foreground rounded-2xl font-black uppercase tracking-widest text-xs hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100 shadow-xl shadow-primary/20"
            >
              Tiếp tục
            </button>
          </form>
        )}

        {step === 'PASSWORD' && (
          <form onSubmit={handlePasswordSubmit} className="space-y-6">
            <div className="w-20 h-20 bg-amber-500/10 text-amber-500 rounded-3xl flex items-center justify-center mx-auto">
              <Lock size={32} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-foreground uppercase tracking-tight">Bảo mật đề thi</h2>
              <p className="text-sm mt-2 text-muted-foreground">Đề thi này được bảo vệ bằng mật khẩu. Vui lòng nhập mật khẩu do giáo viên cung cấp.</p>
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Nhập mật khẩu..."
              className="w-full px-6 py-4 rounded-2xl border border-border bg-background text-center font-bold text-2xl tracking-[0.5em] focus:ring-4 focus:ring-primary/20 focus:border-primary transition-all outline-none"
              autoFocus
            />
            <button
              type="submit"
              disabled={!password}
              className="w-full py-4 bg-primary text-primary-foreground rounded-2xl font-black uppercase tracking-widest text-xs hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100 shadow-xl shadow-primary/20 flex items-center justify-center gap-2"
            >
              <Lock size={16} /> Mở khóa đề thi
            </button>
          </form>
        )}

        <button 
          type="button"
          onClick={() => router.push('/student/exams')} 
          className="flex items-center justify-center gap-2 w-full text-[10px] font-black text-muted-foreground hover:text-primary uppercase tracking-widest transition-colors mt-6 py-2"
        >
          <ArrowLeft size={14} /> Trở về danh sách
        </button>
      </motion.div>
    </div>
  );
}
