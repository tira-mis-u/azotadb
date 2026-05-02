'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Dumbbell, Target, Zap, Clock, ChevronRight, 
  BrainCircuit, Star, Flame, Award
} from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import { cn } from '@/lib/utils';

// Topics for practice - Emptying to reflect real DB state
const topics: any[] = [];

export default function PracticePage() {
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [questionCount, setQuestionCount] = useState(10);

  return (
    <div className="p-10 max-w-7xl mx-auto space-y-12 animate-in fade-in duration-700">
      <PageHeader 
        title="Khu vực Luyện tập" 
        description="Tuỳ chỉnh bài luyện tập cá nhân hóa để cải thiện điểm số ở các chủ đề còn yếu."
        backHref="/dashboard"
        breadcrumbs={[
          { label: 'Lộ trình cá nhân', href: '/dashboard' },
          { label: 'Khu vực Luyện tập' }
        ]}
        actions={
          <div className="flex items-center gap-4 bg-card border border-border p-2 rounded-2xl shadow-xl shadow-primary/5">
            <div className="flex items-center gap-2 px-4 py-2 bg-orange-500/10 rounded-xl">
              <Flame className="w-5 h-5 text-orange-500" />
              <span className="text-[10px] font-black text-orange-600 uppercase tracking-widest">3 Ngày</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-xl">
              <Award className="w-5 h-5 text-primary" />
              <span className="text-[10px] font-black text-primary uppercase tracking-widest">1,250 XP</span>
            </div>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Configuration */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Topic Selection */}
          <section className="bg-card rounded-3xl p-8 border border-border shadow-xl overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-primary/10 transition-all" />
            <h2 className="text-sm font-black text-foreground mb-6 flex items-center gap-3 uppercase tracking-[0.2em]">
              <Target className="w-5 h-5 text-primary" />
              1. Chọn chủ đề chinh phục
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {topics.length > 0 ? (
                topics.map(topic => (
                  <button
                    key={topic.id}
                    onClick={() => setSelectedTopic(topic.id)}
                    className={cn(
                      "relative p-6 rounded-2xl border-2 text-left transition-all overflow-hidden",
                      selectedTopic === topic.id 
                        ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10' 
                        : 'border-border bg-background hover:border-primary/30 hover:bg-muted/50'
                    )}
                  >
                    <div className={cn("absolute top-0 left-0 w-1.5 h-full", topic.color)} />
                    <h3 className="font-black text-base text-foreground mb-1 pl-2 tracking-tight uppercase">{topic.name}</h3>
                    <p className="text-[10px] font-bold text-muted-foreground pl-2 uppercase tracking-widest opacity-60">{topic.questions} câu hỏi chuẩn</p>
                    
                    {selectedTopic === topic.id && (
                      <motion.div layoutId="check" className="absolute top-6 right-6 text-primary">
                        <Star className="w-5 h-5 fill-current animate-pulse" />
                      </motion.div>
                    )}
                  </button>
                ))
              ) : (
                <div className="col-span-full py-20 flex flex-col items-center justify-center text-muted-foreground border-4 border-dashed border-border rounded-3xl bg-muted/20">
                  <Target className="w-12 h-12 mb-4 opacity-20" />
                  <p className="text-[10px] font-black uppercase tracking-[0.2em]">Hệ thống đang chuẩn bị dữ liệu chủ đề</p>
                </div>
              )}
            </div>
          </section>

          {/* Settings Selection */}
          <section className="bg-card rounded-3xl p-8 border border-border shadow-xl relative overflow-hidden">
            <h2 className="text-sm font-black text-foreground mb-6 flex items-center gap-3 uppercase tracking-[0.2em]">
              <Clock className="w-5 h-5 text-primary" />
              2. Tuỳ chỉnh cường độ
            </h2>
            <div className="flex flex-wrap gap-4">
              {[5, 10, 20, 50].map(num => (
                <button
                  key={num}
                  onClick={() => setQuestionCount(num)}
                  className={cn(
                    "px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all",
                    questionCount === num
                      ? 'bg-primary text-primary-foreground shadow-2xl shadow-primary/30 scale-105'
                      : 'bg-background text-muted-foreground border border-border hover:border-primary/40 hover:text-primary'
                  )}
                >
                  {num} Câu hỏi
                </button>
              ))}
            </div>
          </section>
        </div>

        {/* Right Column - Actions */}
        <div className="space-y-8">
          <div className="bg-linear-to-br from-primary to-primary/80 rounded-3xl p-8 text-primary-foreground shadow-2xl shadow-primary/30 relative overflow-hidden group">
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
            <h2 className="text-2xl font-black mb-2 tracking-tighter uppercase">Sẵn sàng chinh phục?</h2>
            <p className="text-primary-foreground/70 text-[10px] font-bold mb-8 uppercase tracking-widest leading-loose">
              Bạn đang chuẩn bị luyện tập {questionCount} câu hỏi về chủ đề {selectedTopic ? topics.find(t => t.id === selectedTopic)?.name : 'NGẪU NHIÊN'}.
            </p>
            
            <button className="w-full py-5 bg-white text-primary font-black text-xs uppercase tracking-[0.2em] rounded-2xl flex items-center justify-center gap-3 hover:scale-105 active:scale-95 transition-all shadow-xl">
              <Zap className="w-5 h-5 fill-current" />
              BẮT ĐẦU NGAY
            </button>
          </div>

          {/* Smart Suggestions */}
          <div className="bg-card rounded-3xl p-8 border border-border shadow-xl relative overflow-hidden">
            <h3 className="text-[10px] font-black text-foreground mb-6 uppercase tracking-[0.2em] flex items-center gap-3 opacity-60">
              <BrainCircuit className="w-5 h-5 text-success" />
              Gợi ý từ QuizzOrz AI
            </h3>
            <div className="space-y-4">
              <button className="w-full text-left p-6 rounded-2xl bg-success/5 border border-success/10 hover:border-success/30 hover:bg-success/10 transition-all group">
                <div className="flex justify-between items-center mb-1">
                  <h4 className="font-black text-success text-xs uppercase tracking-widest">Ôn tập điểm yếu</h4>
                  <ChevronRight className="w-4 h-4 text-success group-hover:translate-x-1 transition-transform" />
                </div>
                <p className="text-[9px] font-bold text-success/60 uppercase tracking-widest leading-none">20 câu hỏi xoáy vào các lỗi sai gần đây</p>
              </button>

              <button className="w-full text-left p-6 rounded-2xl bg-primary/5 border border-primary/10 hover:border-primary/30 hover:bg-primary/10 transition-all group">
                <div className="flex justify-between items-center mb-1">
                  <h4 className="font-black text-primary text-xs uppercase tracking-widest">Thi thử ngẫu nhiên</h4>
                  <ChevronRight className="w-4 h-4 text-primary group-hover:translate-x-1 transition-transform" />
                </div>
                <p className="text-[9px] font-bold text-primary/60 uppercase tracking-widest leading-none">Luyện tập như thi thật với mọi chủ đề</p>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
