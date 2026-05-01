'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Shield, Bell, Key, LogOut, 
  Save, Camera, CheckCircle2, Loader2, Mail,
  Smartphone, Globe, ExternalLink
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/ui/page-header';

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
    if (window.confirm('Bạn có chắc chắn muốn đăng xuất?')) {
      await logout();
      router.push('/login');
    }
  };

  return (
    <div style={{ padding: '32px 40px', maxWidth: 1100, margin: '0 auto' }}>
      <PageHeader 
        title="Cài đặt hệ thống" 
        description="Quản lý thông tin cá nhân, bảo mật và các tuỳ chỉnh tài khoản của bạn."
        backHref="/dashboard"
        breadcrumbs={[
          { label: 'Cài đặt' }
        ]}
      />

      <div className="flex flex-col lg:flex-row gap-10 items-start">
        {/* Navigation Sidebar */}
        <div style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }} className="w-full lg:w-72 shrink-0 rounded-[2rem] border p-4 shadow-sm">
          <div className="space-y-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    backgroundColor: isActive ? 'var(--accent)' : 'transparent',
                    color: isActive ? 'var(--primary)' : 'var(--muted-foreground)'
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all group hover:bg-gray-50 dark:hover:bg-gray-800/50`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-indigo-500' : 'text-gray-400 group-hover:text-gray-600'}`} />
                  {tab.label}
                  {isActive && <motion.div layoutId="active-tab" className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-500" />}
                </button>
              );
            })}
          </div>
          
          <div style={{ borderTop: '1px solid var(--border)' }} className="mt-4 pt-4">
            <button 
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all group"
            >
              <LogOut className="w-5 h-5 text-red-500 group-hover:scale-110 transition-transform" />
              Đăng xuất tài khoản
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }} className="flex-1 w-full rounded-[2.5rem] border shadow-sm overflow-hidden min-h-[600px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="p-8 md:p-12"
            >
              {activeTab === 'profile' && (
                <div className="space-y-10">
                  <div className="flex flex-col md:flex-row gap-10 items-center md:items-start pb-10 border-b border-gray-100 dark:border-gray-800">
                    <div className="relative group">
                      <div style={{ borderColor: 'var(--border)', backgroundColor: 'var(--background)' }} className="w-32 h-32 rounded-[2.5rem] border-4 flex items-center justify-center overflow-hidden shadow-2xl transition-transform group-hover:scale-105">
                         <span style={{ color: 'var(--primary)' }} className="text-4xl font-black">
                           {user?.email?.charAt(0).toUpperCase() || 'U'}
                         </span>
                      </div>
                      <button className="absolute -bottom-2 -right-2 p-3 bg-indigo-600 text-white rounded-2xl shadow-xl hover:bg-indigo-700 transition-all">
                        <Camera size={18} />
                      </button>
                    </div>
                    
                    <div className="text-center md:text-left space-y-2">
                       <h2 style={{ color: 'var(--foreground)' }} className="text-2xl font-black">Thông tin tài khoản</h2>
                       <p style={{ color: 'var(--muted-foreground)' }} className="text-sm font-medium">ID: <span className="font-mono text-[10px] bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">{user?.id?.substring(0, 8)}...</span></p>
                       <div className="flex flex-wrap justify-center md:justify-start gap-2 pt-2">
                         <span style={{ backgroundColor: 'var(--accent)', color: 'var(--primary)' }} className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-indigo-100 dark:border-indigo-900/30">
                            {activeRole === 'TEACHER' ? 'Giảng viên' : 'Học sinh'}
                         </span>
                         <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-600 border border-emerald-100 dark:bg-emerald-900/20 dark:border-emerald-800/30">
                            Đã xác thực
                         </span>
                       </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label style={{ color: 'var(--foreground)' }} className="text-xs font-black uppercase tracking-widest opacity-60 ml-1">Tên hiển thị</label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input 
                          type="text" 
                          defaultValue={user?.email?.split('@')[0]}
                          style={{ backgroundColor: 'var(--input)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                          className="w-full pl-12 pr-5 py-4 rounded-2xl border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-bold shadow-inner"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <label style={{ color: 'var(--foreground)' }} className="text-xs font-black uppercase tracking-widest opacity-60 ml-1">Địa chỉ Email</label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input 
                          type="email" 
                          value={user?.email || ''}
                          disabled
                          style={{ backgroundColor: 'var(--muted)', borderColor: 'var(--border)', color: 'var(--muted-foreground)' }}
                          className="w-full pl-12 pr-5 py-4 rounded-2xl border text-sm cursor-not-allowed font-bold"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'security' && (
                <div className="space-y-10">
                  <div>
                    <h2 style={{ color: 'var(--foreground)' }} className="text-2xl font-black mb-2">Mật khẩu & Bảo mật</h2>
                    <p style={{ color: 'var(--muted-foreground)' }} className="text-sm font-medium">Bảo vệ tài khoản của bạn bằng mật khẩu mạnh và các lớp bảo mật bổ sung.</p>
                  </div>

                  <div className="grid grid-cols-1 gap-6 max-w-lg">
                    <div className="space-y-3">
                      <label style={{ color: 'var(--foreground)' }} className="text-xs font-black uppercase tracking-widest opacity-60 ml-1">Mật khẩu hiện tại</label>
                      <input 
                        type="password" 
                        placeholder="••••••••"
                        style={{ backgroundColor: 'var(--input)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                        className="w-full px-5 py-4 rounded-2xl border text-base focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-black tracking-widest"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <label style={{ color: 'var(--foreground)' }} className="text-xs font-black uppercase tracking-widest opacity-60 ml-1">Mật khẩu mới</label>
                        <input 
                          type="password" 
                          placeholder="••••••••"
                          style={{ backgroundColor: 'var(--input)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                          className="w-full px-5 py-4 rounded-2xl border text-base focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-black tracking-widest"
                        />
                      </div>
                      <div className="space-y-3">
                        <label style={{ color: 'var(--foreground)' }} className="text-xs font-black uppercase tracking-widest opacity-60 ml-1">Xác nhận lại</label>
                        <input 
                          type="password" 
                          placeholder="••••••••"
                          style={{ backgroundColor: 'var(--input)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                          className="w-full px-5 py-4 rounded-2xl border text-base focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-black tracking-widest"
                        />
                      </div>
                    </div>
                  </div>

                  <div style={{ backgroundColor: 'var(--muted)', borderColor: 'var(--border)' }} className="p-6 rounded-3xl border flex items-center justify-between group cursor-pointer hover:border-indigo-400 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-white dark:bg-gray-800 flex items-center justify-center text-indigo-500 shadow-sm">
                         <Smartphone size={24} />
                      </div>
                      <div>
                         <p style={{ color: 'var(--foreground)' }} className="font-black text-sm">Bảo mật 2 lớp (2FA)</p>
                         <p style={{ color: 'var(--muted-foreground)' }} className="text-xs font-medium">Chưa kích hoạt</p>
                      </div>
                    </div>
                    <button className="text-xs font-black uppercase tracking-widest text-indigo-600 hover:underline">Thiết lập ngay</button>
                  </div>
                </div>
              )}

              {activeTab === 'notifications' && (
                <div className="space-y-10">
                  <div>
                    <h2 style={{ color: 'var(--foreground)' }} className="text-2xl font-black mb-2">Trung tâm thông báo</h2>
                    <p style={{ color: 'var(--muted-foreground)' }} className="text-sm font-medium">Tuỳ chỉnh cách bạn nhận thông báo từ các kỳ thi và kết quả.</p>
                  </div>

                  <div className="space-y-4">
                    {[
                      { label: 'Thông báo Email', desc: 'Nhận kết quả thi và thông báo qua địa chỉ email.' },
                      { label: 'Thông báo Trình duyệt', desc: 'Nhận thông báo đẩy ngay cả khi không mở tab.' },
                      { label: 'Cập nhật khóa học', desc: 'Thông báo khi giáo viên đăng bài thi mới.' },
                      { label: 'Nhắc nhở làm bài', desc: 'Thông báo khi bài thi sắp hết hạn tham gia.' }
                    ].map((item, idx) => (
                      <div key={idx} style={{ backgroundColor: 'var(--muted)', borderColor: 'var(--border)' }} className="p-6 rounded-3xl border flex items-center justify-between">
                         <div>
                            <p style={{ color: 'var(--foreground)' }} className="font-black text-sm">{item.label}</p>
                            <p style={{ color: 'var(--muted-foreground)' }} className="text-xs font-medium">{item.desc}</p>
                         </div>
                         <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" defaultChecked={idx === 0} className="sr-only peer" />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
                          </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Common Bottom Action Bar */}
              <div style={{ borderTop: '1px solid var(--border)' }} className="mt-12 pt-8 flex items-center justify-between">
                 <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-gray-400" />
                    <span style={{ color: 'var(--muted-foreground)' }} className="text-[10px] font-bold uppercase tracking-widest">Ngôn ngữ: Tiếng Việt</span>
                 </div>
                 
                 <div className="flex items-center gap-4">
                    <AnimatePresence>
                      {saved && (
                        <motion.div
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          className="flex items-center gap-2 text-xs font-black text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-4 py-2 rounded-xl"
                        >
                          <CheckCircle2 size={16} /> Đã lưu thành công!
                        </motion.div>
                      )}
                    </AnimatePresence>
                    
                    <button 
                      onClick={handleSave}
                      disabled={isSaving}
                      style={{ 
                        backgroundColor: 'var(--primary)', 
                        color: 'var(--primary-foreground)',
                        boxShadow: '0 10px 20px -5px rgba(99, 102, 241, 0.3)'
                      }}
                      className="flex items-center gap-2 px-8 py-3.5 rounded-2xl font-black text-sm transition-all hover:scale-105 active:scale-95 disabled:opacity-70"
                    >
                      {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                      {isSaving ? 'Đang cập nhật...' : 'Lưu cài đặt'}
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
