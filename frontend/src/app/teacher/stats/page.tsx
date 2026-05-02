'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, TrendingUp, Users, FileText, 
  Target, Award, Clock, ArrowUpRight, ArrowDownRight,
  PieChart, Activity
} from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import { cn } from '@/lib/utils';

export default function StatisticsPage() {
  const stats = [
    { label: 'TỔNG ĐỀ THI', value: '42', change: '+12%', icon: FileText, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: 'LƯỢT LÀM BÀI', value: '1,284', change: '+18%', icon: Users, color: 'text-purple-500', bg: 'bg-purple-500/10' },
    { label: 'ĐIỂM TRUNG BÌNH', value: '7.8', change: '-2%', icon: Target, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    { label: 'TỶ LỆ HOÀN THÀNH', value: '94%', change: '+5%', icon: Award, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-10 animate-in fade-in duration-500">
      <PageHeader 
        title="Phân tích & Thống kê" 
        description="Cái nhìn sâu sắc về hiệu suất giảng dạy và tiến độ học tập của học sinh qua các kỳ thi."
        backHref="/dashboard"
      />

      {/* Hero Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((item, i) => (
          <motion.div 
            key={item.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-card p-6 rounded-3xl border border-border shadow-xl hover-lift relative overflow-hidden group"
          >
            <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110", item.bg)}>
              <item.icon className={cn("w-6 h-6", item.color)} />
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{item.label}</p>
              <h3 className="text-3xl font-black text-foreground tracking-tighter">{item.value}</h3>
            </div>
            <div className={cn(
              "mt-4 flex items-center gap-1 text-[10px] font-black uppercase tracking-widest",
              item.change.startsWith('+') ? "text-emerald-500" : "text-destructive"
            )}>
              {item.change.startsWith('+') ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
              {item.change} <span className="text-muted-foreground ml-1">so với tháng trước</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Analysis Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-card rounded-3xl border border-border shadow-xl overflow-hidden flex flex-col">
          <div className="p-8 border-b border-border flex items-center justify-between bg-muted/20">
            <div className="flex items-center gap-3">
              <BarChart3 className="text-primary w-5 h-5" />
              <h3 className="text-sm font-black uppercase tracking-widest">Biểu đồ tăng trưởng (30 ngày)</h3>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 mr-4">
                <span className="w-3 h-3 rounded-full bg-primary" />
                <span className="text-[9px] font-black uppercase text-muted-foreground">Lượt thi</span>
              </div>
              <select className="bg-background border border-border px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest outline-none focus:border-primary">
                <option>THÁNG NÀY</option>
                <option>THÁNG TRƯỚC</option>
              </select>
            </div>
          </div>
          <div className="flex-1 p-10 flex flex-col justify-end min-h-[400px]">
            <div className="flex items-end justify-between h-64 gap-2">
              {[45, 62, 55, 80, 42, 90, 75, 60, 85, 100, 70, 88].map((val, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-3 group">
                  <motion.div 
                    initial={{ height: 0 }}
                    animate={{ height: `${val}%` }}
                    transition={{ duration: 1, delay: i * 0.05 }}
                    className="w-full bg-linear-to-t from-primary/20 to-primary rounded-t-lg group-hover:brightness-125 transition-all relative"
                  >
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-card border border-border px-2 py-1 rounded text-[8px] font-black opacity-0 group-hover:opacity-100 transition-opacity">
                      {val * 10}
                    </div>
                  </motion.div>
                  <span className="text-[8px] font-black text-muted-foreground">T{i+1}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-card rounded-3xl border border-border shadow-xl overflow-hidden flex flex-col">
          <div className="p-8 border-b border-border flex items-center gap-3 bg-muted/20">
            <PieChart className="text-primary w-5 h-5" />
            <h3 className="text-sm font-black uppercase tracking-widest">Phân bổ môn học</h3>
          </div>
          <div className="p-8 space-y-6 flex-1">
             {[
               { label: 'TOÁN HỌC', value: 45, color: 'bg-blue-500' },
               { label: 'VẬT LÝ', value: 25, color: 'bg-purple-500' },
               { label: 'HÓA HỌC', value: 20, color: 'bg-emerald-500' },
               { label: 'SINH HỌC', value: 10, color: 'bg-amber-500' },
             ].map((m) => (
               <div key={m.label} className="space-y-2">
                 <div className="flex justify-between items-end">
                    <span className="text-[10px] font-black uppercase tracking-widest">{m.label}</span>
                    <span className="text-xs font-black">{m.value}%</span>
                 </div>
                 <div className="h-2 bg-muted rounded-full overflow-hidden shadow-inner border border-border/50">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${m.value}%` }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                      className={cn("h-full rounded-full", m.color)}
                    />
                 </div>
               </div>
             ))}
             <div className="mt-12 p-6 bg-muted/30 rounded-2xl border border-border flex flex-col gap-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-center">Top đề thi hiệu quả nhất</p>
                <div className="space-y-3">
                   {[
                     { name: 'Kiểm tra 15p Hoá', score: '8.5', count: 120 },
                     { name: 'Ôn tập Toán 12', score: '7.2', count: 450 },
                     { name: 'Trắc nghiệm Vật Lý', score: '9.0', count: 85 }
                   ].map((exam, i) => (
                     <div key={i} className="flex items-center justify-between p-3 bg-card rounded-xl border border-border/50 text-[9px] font-bold">
                        <span className="truncate flex-1">{exam.name}</span>
                        <div className="flex items-center gap-3 ml-2">
                           <span className="text-primary">{exam.score}đ</span>
                           <span className="text-muted-foreground">{exam.count} lượt</span>
                        </div>
                     </div>
                   ))}
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
