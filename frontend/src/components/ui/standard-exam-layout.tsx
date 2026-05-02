'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, ChevronLeft, ChevronRight, Send, List, CheckCircle2, Zap, Target, Plus } from 'lucide-react';
import { QuestionRenderer } from './question-renderer';
import { cn } from '@/lib/utils';

interface StandardExamLayoutProps {
  exam: any;
  questions: any[];
  answers: Record<string, any>;
  onAnswer: (questionId: string, answer: any) => void;
  timeLeft: number;
  onSubmit: () => void;
}

export function StandardExamLayout({
  exam,
  questions,
  answers,
  onAnswer,
  timeLeft,
  onSubmit
}: StandardExamLayoutProps) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [showNav, setShowNav] = useState(false);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h > 0 ? `${h}:` : ''}${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const isLast = currentIdx === questions.length - 1;
  const isFirst = currentIdx === 0;

  const totalAnswered = Object.keys(answers).length;
  const progress = (totalAnswered / questions.length) * 100;

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground animate-in fade-in duration-700">
      {/* Header */}
      <header className="sticky top-0 z-40 h-20 px-8 flex items-center justify-between bg-card/80 backdrop-blur-2xl border-b border-border shadow-2xl shadow-primary/5">
        <div className="flex items-center gap-6 min-w-0">
          <div className="w-1 h-10 bg-primary rounded-full hidden md:block" />
          <div className="min-w-0">
            <h2 className="font-black text-lg md:text-xl truncate max-w-[200px] md:max-w-xl tracking-tighter uppercase leading-none">{exam.title}</h2>
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] mt-2 flex items-center gap-2">
               <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
               TIẾN ĐỘ: {totalAnswered}/{questions.length} CÂU CHUẨN
            </p>
          </div>
        </div>

        <div className="flex items-center gap-8">
          {exam.isTimed && (
            <div className={cn(
              "flex items-center gap-3 px-6 py-3 rounded-2xl font-mono font-black text-xl transition-all shadow-inner border border-border",
              timeLeft < 300 ? "text-destructive bg-destructive/10 border-destructive/20 animate-pulse" : "text-foreground bg-muted"
            )}>
              <Clock size={20} className={timeLeft < 300 ? "animate-spin" : ""} />
              {formatTime(timeLeft)}
            </div>
          )}
          <button
            onClick={() => {
              if (window.confirm('HỆ THỐNG XÁC NHẬN: BẠN CÓ CHẮC CHẮN MUỐN NỘP BÀI?')) {
                onSubmit();
              }
            }}
            className="hidden md:flex items-center gap-3 px-8 py-3 bg-primary text-primary-foreground rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all"
          >
            NỘP BÀI THI <Send size={16} />
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 overflow-hidden flex">
        {/* Sidebar Nav (Desktop) */}
        <aside className="hidden lg:flex flex-col w-96 shrink-0 p-8 border-r border-border bg-card/50 overflow-y-auto custom-scrollbar space-y-10">
          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
               <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Tiến trình</p>
               <p className="text-[10px] font-black text-primary uppercase tracking-widest">{Math.round(progress)}%</p>
            </div>
            <div className="h-3 bg-muted rounded-full overflow-hidden border border-border shadow-inner">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                className="h-full bg-linear-to-r from-primary to-indigo-400 transition-all duration-700"
              />
            </div>
          </div>

          <div className="space-y-6">
             <div className="flex items-center gap-2 px-1">
                <Target size={14} className="text-primary" />
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Danh mục câu hỏi</p>
             </div>
             <div className="grid grid-cols-5 gap-3">
               {questions.map((q, idx) => {
                 const isAnswered = !!answers[q.id];
                 const isActive = idx === currentIdx;
                 return (
                   <button
                     key={q.id}
                     onClick={() => setCurrentIdx(idx)}
                     className={cn(
                       "w-12 h-12 rounded-[1.25rem] flex items-center justify-center text-xs font-black transition-all border-2 relative overflow-hidden group",
                       isActive 
                         ? "bg-primary border-primary text-primary-foreground shadow-lg shadow-primary/30 scale-110 z-10" 
                         : isAnswered 
                           ? "bg-primary/5 border-primary/40 text-primary hover:bg-primary/10" 
                           : "bg-card border-border text-muted-foreground hover:border-primary/40"
                     )}
                   >
                     {isActive && <div className="absolute inset-0 bg-white/10 animate-pulse" />}
                     {idx + 1}
                     {isAnswered && !isActive && <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-primary" />}
                   </button>
                 );
               })}
             </div>
          </div>

          <div className="mt-auto p-6 bg-primary/5 border border-primary/20 rounded-[2rem] space-y-3">
             <div className="flex items-center gap-2 text-primary">
                <Zap size={16} />
                <span className="text-[10px] font-black uppercase tracking-widest">Ghi chú quan trọng</span>
             </div>
             <p className="text-[10px] font-bold text-muted-foreground uppercase leading-relaxed tracking-tight">Hệ thống tự động lưu nháp mỗi khi bạn chọn đáp án. Hãy yên tâm thực hiện bài thi.</p>
          </div>
        </aside>

        {/* Question Area */}
        <div className="flex-1 overflow-y-auto p-8 md:p-16 bg-background custom-scrollbar">
          <div className="max-w-4xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIdx}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ type: 'spring', damping: 20, stiffness: 100 }}
                className="bg-card p-10 md:p-16 rounded-[3.5rem] border border-border shadow-2xl relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-2 h-full bg-primary opacity-20" />
                
                <QuestionRenderer
                  question={questions[currentIdx]}
                  index={currentIdx + 1}
                  userAnswer={answers[questions[currentIdx].id]}
                  onAnswerChange={(ans) => onAnswer(questions[currentIdx].id, ans)}
                />

                <div className="flex items-center justify-between mt-16 pt-10 border-t border-border">
                  <button
                    onClick={() => setCurrentIdx(prev => Math.max(0, prev - 1))}
                    disabled={isFirst}
                    className="flex items-center gap-3 px-8 py-4 rounded-2xl text-sm font-black uppercase tracking-widest text-muted-foreground hover:text-foreground hover:bg-muted transition-all disabled:opacity-20"
                  >
                    <ChevronLeft size={20} /> QUAY LẠI
                  </button>
                  <button
                    onClick={() => {
                      if (isLast) {
                        if (window.confirm('HỆ THỐNG XÁC NHẬN: BẠN CÓ CHẮC CHẮN MUỐN NỘP BÀI?')) onSubmit();
                      } else {
                        setCurrentIdx(prev => prev + 1);
                      }
                    }}
                    className={cn(
                      "flex items-center gap-3 px-10 py-4 rounded-2xl text-sm font-black uppercase tracking-widest transition-all",
                      isLast 
                        ? "bg-primary text-primary-foreground shadow-2xl shadow-primary/30 hover:scale-105" 
                        : "bg-muted text-foreground hover:bg-primary hover:text-primary-foreground hover:shadow-xl hover:shadow-primary/20"
                    )}
                  >
                    {isLast ? 'NỘP BÀI NGAY' : 'TIẾP THEO'}
                    {!isLast && <ChevronRight size={20} />}
                  </button>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </main>

      {/* Mobile Actions Bar */}
      <div className="lg:hidden fixed bottom-8 inset-x-8 flex gap-4 z-40">
        <button 
          onClick={() => setShowNav(!showNav)}
          className="flex-1 h-16 bg-card border border-border rounded-2xl shadow-2xl flex items-center justify-center gap-3 font-black text-xs uppercase tracking-widest"
        >
          <List size={20} className="text-primary" /> LỘ TRÌNH
        </button>
        <button 
          onClick={() => {
            if (window.confirm('BẠN CÓ CHẮC CHẮN MUỐN NỘP BÀI?')) onSubmit();
          }}
          className="w-16 h-16 bg-primary text-primary-foreground rounded-2xl shadow-2xl flex items-center justify-center"
        >
          <Send size={24} />
        </button>
      </div>

      {/* Mobile Grid Overlap */}
      <AnimatePresence>
        {showNav && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowNav(false)}
              className="lg:hidden fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              className="lg:hidden fixed inset-x-0 bottom-0 z-50 p-10 bg-card rounded-t-[4rem] shadow-[0_-40px_100px_rgba(0,0,0,0.2)] border-t border-border"
            >
              <div className="flex items-center justify-between mb-8">
                <h3 className="font-black text-xs uppercase tracking-[0.25em] text-primary">Danh mục câu hỏi</h3>
                <button onClick={() => setShowNav(false)} className="p-3 bg-muted rounded-xl"><Plus size={20} className="rotate-45" /></button>
              </div>
              <div className="grid grid-cols-5 gap-3 overflow-y-auto max-h-[50vh] pb-10">
                {questions.map((q, idx) => {
                  const isAnswered = !!answers[q.id];
                  const isActive = idx === currentIdx;
                  return (
                    <button
                      key={q.id}
                      onClick={() => {
                        setCurrentIdx(idx);
                        setShowNav(false);
                      }}
                      className={cn(
                        "w-full aspect-square rounded-2xl flex items-center justify-center text-xs font-black transition-all border-2",
                        isActive 
                          ? "bg-primary border-primary text-primary-foreground shadow-lg" 
                          : isAnswered 
                            ? "bg-primary/10 border-primary/40 text-primary" 
                            : "bg-muted border-border text-muted-foreground"
                      )}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
