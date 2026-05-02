'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Shield, Bell, LogOut, 
  Save, Camera, CheckCircle2, Loader2, Mail,
  Smartphone, Globe, Zap, ChevronRight
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/ui/page-header';
import { cn } from '@/lib/utils';

export default function SettingsPage() {
  const { user, activeRole, logout } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('profile');
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const tabs = [
    { id: 'profile', label: 'Tài khoản', icon: User },
    { id: 'security', label: 'Bảo mật', icon: Shield },
    { id: 'notifications', label: 'Thông báo', icon: Bell },
  ];

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }, 1200);
  };

  const handleLogout = async () => {
    if (window.confirm('HỆ THỐNG XÁC NHẬN: BẠN CÓ CHẮC CHẮN MUỐN ĐĂNG XUẤT?')) {
      await logout();
      router.push('/login');
    }
  };

  return (
    <div className="p-10 max-w-7xl mx-auto space-y-12 animate-in fade-in duration-700">
      <PageHeader 
        title="Cài đặt hệ thống" 
        description="Quản lý và tinh chỉnh các thiết lập cá nhân, bảo mật cho tài khoản AzotaDB của bạn."
        backHref="/dashboard"
        breadcrumbs={[
          { label: 'Cá nhân hóa', href: '#' },
          { label: 'Cài đặt hệ thống' }
        ]}
        actions={
          <div className="flex items-center gap-3 px-6 py-3 bg-card border border-border rounded-2xl shadow-xl shadow-primary/5">
             <Zap className="text-primary w-5 h-5 animate-pulse" />
             <span className="text-[10px] font-black text-foreground uppercase tracking-[0.2em]">CẬP NHẬT LẦN CUỐI: VỪA XONG</span>
          </div>
        }
      />

      <div className="flex flex-col lg:flex-row gap-12 items-start">
        {/* Navigation Sidebar */}
        <div className="w-full lg:w-80 shrink-0 space-y-6">
          <div className="bg-card border border-border rounded-[2.5rem] p-6 shadow-2xl shadow-primary/5 space-y-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-sm font-black uppercase tracking-widest transition-all group",
                    isActive 
                      ? "bg-primary text-primary-foreground shadow-xl shadow-primary/20" 
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <Icon className={cn("w-5 h-5 transition-transform group-hover:scale-110", isActive ? "text-primary-foreground" : "text-muted-foreground")} />
                  {tab.label}
                  {isActive && <ChevronRight className="ml-auto w-4 h-4 opacity-50" />}
                </button>
              );
            })}
            
            <div className="pt-6 mt-4 border-t border-border">
              <button 
                onClick={handleLogout}
                className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-sm font-black uppercase tracking-widest text-destructive hover:bg-destructive/10 transition-all group"
              >
                <LogOut className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
                ĐĂNG XUẤT
              </button>
            </div>
          </div>

          <div className="bg-primary/5 border border-primary/10 rounded-[2.5rem] p-8 space-y-4">
             <h4 className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Hệ sinh thái Azota</h4>
             <p className="text-[10px] font-bold text-muted-foreground leading-loose uppercase tracking-widest opacity-70">AzotaDB là nền tảng quản lý ngân hàng câu hỏi và luyện thi thông minh hàng đầu Việt Nam.</p>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 w-full bg-card border border-border rounded-[3rem] shadow-2xl shadow-primary/5 overflow-hidden min-h-[600px] flex flex-col relative">
          <div className="absolute top-0 left-0 w-full h-2 bg-linear-to-r from-primary to-indigo-500 opacity-20" />
          
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="p-10 md:p-16 flex-1 flex flex-col"
            >
              {activeTab === 'profile' && (
                <div className="space-y-12">
                  <div className="flex flex-col md:flex-row gap-12 items-center md:items-start pb-12 border-b border-border">
                    <div className="relative group">
                      <div className="w-40 h-40 rounded-[3rem] border-8 border-background bg-card flex items-center justify-center overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.1)] transition-transform group-hover:scale-105 duration-500">
                         <span className="text-5xl font-black text-primary">
                           {user?.email?.charAt(0).toUpperCase() || 'U'}
                         </span>
                      </div>
                      <button className="absolute -bottom-2 -right-2 p-4 bg-primary text-primary-foreground rounded-2xl shadow-2xl hover:scale-110 transition-all border-4 border-card">
                        <Camera size={20} />
                      </button>
                    </div>
                    
                    <div className="text-center md:text-left space-y-4">
                       <h2 className="text-4xl font-black tracking-tighter text-foreground uppercase leading-none">Thông tin tài khoản</h2>
                       <p className="text-xs font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2 justify-center md:justify-start">
                          IDENTIFIER: <span className="font-mono text-primary bg-primary/10 px-3 py-1 rounded-xl">{user?.id?.substring(0, 12)}...</span>
                       </p>
                       <div className="flex flex-wrap justify-center md:justify-start gap-3 pt-2">
                         <span className="px-5 py-2 bg-primary/10 text-primary rounded-xl text-[10px] font-black uppercase tracking-widest border border-primary/20">
                            {activeRole === 'TEACHER' ? 'GIẢNG VIÊN HỆ THỐNG' : 'HỌC SINH CHUYÊN CẦN'}
                         </span>
                         <span className="px-5 py-2 bg-success/10 text-success rounded-xl text-[10px] font-black uppercase tracking-widest border border-success/20">
                            XÁC THỰC DANH TÍNH
                         </span>
                       </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-2">Tên hiển thị công khai</label>
                      <div className="relative group">
                        <User className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-all" />
                        <input 
                          type="text" 
                          defaultValue={user?.email?.split('@')[0]}
                          className="w-full pl-16 pr-8 py-5 rounded-[1.5rem] border border-border bg-background text-base font-black text-foreground focus:ring-8 focus:ring-primary/5 transition-all shadow-inner"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-2">Địa chỉ Email liên hệ</label>
                      <div className="relative">
                        <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground opacity-40" />
                        <input 
                          type="email" 
                          value={user?.email || ''}
                          disabled
                          className="w-full pl-16 pr-8 py-5 rounded-[1.5rem] border border-border bg-muted text-base font-black text-muted-foreground cursor-not-allowed opacity-60"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'security' && (
                <div className="space-y-12">
                  <div className="space-y-2">
                    <h2 className="text-4xl font-black tracking-tighter text-foreground uppercase">Mật khẩu & Bảo mật</h2>
                    <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest opacity-60">XÂY DỰNG LỚP PHÒNG THỦ VỮNG CHẮC CHO DỮ LIỆU CỦA BẠN.</p>
                  </div>

                  <div className="grid grid-cols-1 gap-8 max-w-2xl">
                    <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-2">Mật khẩu hiện tại</label>
                      <input 
                        type="password" 
                        placeholder="••••••••••••"
                        className="w-full px-8 py-5 rounded-[1.5rem] border border-border bg-background text-lg font-black tracking-[0.5em] focus:ring-8 focus:ring-primary/5 transition-all shadow-inner"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-2">Mật khẩu mới</label>
                        <input 
                          type="password" 
                          placeholder="••••••••••••"
                          className="w-full px-8 py-5 rounded-[1.5rem] border border-border bg-background text-lg font-black tracking-[0.5em] focus:ring-8 focus:ring-primary/5 transition-all shadow-inner"
                        />
                      </div>
                      <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-2">Xác nhận mật khẩu</label>
                        <input 
                          type="password" 
                          placeholder="••••••••••••"
                          className="w-full px-8 py-5 rounded-[1.5rem] border border-border bg-background text-lg font-black tracking-[0.5em] focus:ring-8 focus:ring-primary/5 transition-all shadow-inner"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="p-8 rounded-[2.5rem] border border-border bg-muted/30 flex flex-col md:flex-row items-center justify-between gap-6 group cursor-pointer hover:border-primary/40 transition-all shadow-sm">
                    <div className="flex items-center gap-6">
                      <div className="w-16 h-16 rounded-2xl bg-background flex items-center justify-center text-primary shadow-xl border border-border group-hover:scale-110 transition-transform">
                         <Smartphone size={32} />
                      </div>
                      <div>
                         <p className="font-black text-sm uppercase tracking-tight text-foreground">Xác thực 2 yếu tố (2FA)</p>
                         <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mt-1 opacity-60">CHƯA KÍCH HOẠT • ĐỀ XUẤT BẬT NGAY</p>
                      </div>
                    </div>
                    <button className="px-8 py-3 bg-card border border-border rounded-xl text-[10px] font-black uppercase tracking-[0.2em] text-primary hover:bg-primary hover:text-primary-foreground transition-all">Thiết lập ngay</button>
                  </div>
                </div>
              )}

              {activeTab === 'notifications' && (
                <div className="space-y-12">
                  <div className="space-y-2">
                    <h2 className="text-4xl font-black tracking-tighter text-foreground uppercase">Trung tâm thông báo</h2>
                    <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest opacity-60">QUẢN LÝ CÁCH THỨC HỆ THỐNG GIAO TIẾP VỚI BẠN.</p>
                  </div>

                  <div className="grid gap-6">
                    {[
                      { label: 'THÔNG BÁO QUA EMAIL', desc: 'NHẬN KẾT QUẢ VÀ BÁO CÁO ĐỊNH KỲ QUA HÒM THƯ.' },
                      { label: 'THÔNG BÁO ĐẨY (PUSH)', desc: 'NHẬN TIN NHẮN TỨC THÌ TRÊN TRÌNH DUYỆT.' },
                      { label: 'CẬP NHẬT ĐỀ THI', desc: 'THÔNG BÁO KHI CÓ ĐỀ THI MỚI ĐƯỢC CÔNG BỐ.' },
                      { label: 'NHẮC NHỞ HỌC TẬP', desc: 'CÁC THÔNG BÁO NHẮC NHỞ LUYỆN TẬP HÀNG NGÀY.' }
                    ].map((item, idx) => (
                      <div key={idx} className="p-8 rounded-[2rem] border border-border bg-muted/20 flex items-center justify-between group hover:border-primary/20 transition-all">
                         <div className="space-y-1">
                            <p className="font-black text-sm text-foreground tracking-tight">{item.label}</p>
                            <p className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.25em] opacity-60">{item.desc}</p>
                         </div>
                         <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" defaultChecked={idx === 0} className="sr-only peer" />
                            <div className="w-14 h-7 bg-muted rounded-full border border-border peer-checked:bg-primary transition-all after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-7" />
                          </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Bottom Action Bar */}
              <div className="mt-auto pt-12 border-t border-border flex flex-col md:flex-row items-center justify-between gap-8">
                 <div className="flex items-center gap-3 opacity-60">
                    <Globe className="w-5 h-5 text-primary" />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em]">LANGUAGE: VIETNAMESE (INTL)</span>
                 </div>
                 
                 <div className="flex items-center gap-6">
                    <AnimatePresence>
                      {saved && (
                        <motion.div
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          className="flex items-center gap-3 text-[10px] font-black text-success bg-success/10 px-6 py-3 rounded-2xl border border-success/20 uppercase tracking-widest"
                        >
                          <CheckCircle2 size={16} /> Dữ liệu đã được cập nhật!
                        </motion.div>
                      )}
                    </AnimatePresence>
                    
                    <button 
                      onClick={handleSave}
                      disabled={isSaving}
                      className="flex items-center gap-4 px-12 py-5 bg-primary text-primary-foreground rounded-[1.75rem] font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                    >
                      {isSaving ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
                      {isSaving ? 'ĐANG ĐỒNG BỘ...' : 'LƯU THAY ĐỔI'}
                    </button>
                 </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
