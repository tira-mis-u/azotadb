'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, ChevronLeft, ChevronRight, Send, List, CheckCircle2 } from 'lucide-react';
import { QuestionRenderer } from './question-renderer';

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
    <div style={{ backgroundColor: 'var(--background)', color: 'var(--foreground)' }} className="min-h-screen flex flex-col">
      {/* Header */}
      <header 
        style={{ backgroundColor: 'var(--card)', borderBottom: '1px solid var(--border)' }}
        className="sticky top-0 z-30 h-16 px-6 flex items-center justify-between shadow-sm"
      >
        <div className="flex items-center gap-4">
          <h2 className="font-bold text-sm md:text-base truncate max-w-[200px] md:max-w-md">{exam.title}</h2>
          <div style={{ backgroundColor: 'var(--muted)', color: 'var(--primary)' }} className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold">
            <List size={14} />
            {totalAnswered}/{questions.length} câu
          </div>
        </div>

        <div className="flex items-center gap-6">
          {exam.isTimed && (
            <div 
              style={{ color: timeLeft < 300 ? '#ef4444' : 'var(--foreground)' }}
              className={`flex items-center gap-2 font-mono font-bold text-lg ${timeLeft < 300 ? 'animate-pulse' : ''}`}
            >
              <Clock size={18} />
              {formatTime(timeLeft)}
            </div>
          )}
          <button
            onClick={() => {
              if (window.confirm('Bạn có chắc chắn muốn nộp bài?')) {
                onSubmit();
              }
            }}
            style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}
            className="flex items-center gap-2 px-5 py-2 rounded-xl font-bold text-sm shadow-lg shadow-indigo-500/20 transition-all hover:scale-105"
          >
            Nộp bài
            <Send size={14} />
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 overflow-hidden flex flex-col lg:flex-row">
        {/* Sidebar Nav (Desktop) */}
        <aside 
          style={{ backgroundColor: 'var(--card)', borderRight: '1px solid var(--border)' }}
          className="hidden lg:flex flex-col w-72 shrink-0 p-6 overflow-y-auto"
        >
          <div className="mb-6">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Tiến độ làm bài</p>
            <div style={{ backgroundColor: 'var(--muted)' }} className="h-2 rounded-full overflow-hidden">
              <div 
                style={{ width: `${progress}%`, backgroundColor: 'var(--primary)' }} 
                className="h-full transition-all duration-500"
              />
            </div>
            <p className="text-[10px] text-right mt-1.5 font-bold">{Math.round(progress)}%</p>
          </div>

          <div className="grid grid-cols-5 gap-2">
            {questions.map((q, idx) => {
              const isAnswered = !!answers[q.id];
              const isActive = idx === currentIdx;
              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentIdx(idx)}
                  style={{
                    backgroundColor: isActive ? 'var(--primary)' : isAnswered ? 'var(--accent)' : 'var(--muted)',
                    color: isActive ? 'var(--primary-foreground)' : isAnswered ? 'var(--primary)' : 'var(--muted-foreground)',
                    borderColor: isActive ? 'var(--primary)' : 'transparent'
                  }}
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold transition-all border-2"
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>
        </aside>

        {/* Question Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-12">
          <div className="max-w-3xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIdx}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
                className="p-6 md:p-10 rounded-3xl border shadow-sm"
              >
                <QuestionRenderer
                  question={questions[currentIdx]}
                  index={currentIdx + 1}
                  userAnswer={answers[questions[currentIdx].id]}
                  onAnswerChange={(ans) => onAnswer(questions[currentIdx].id, ans)}
                />

                <div className="flex items-center justify-between mt-12 pt-8 border-t border-gray-100 dark:border-gray-800">
                  <button
                    onClick={() => setCurrentIdx(prev => Math.max(0, prev - 1))}
                    disabled={isFirst}
                    style={{ color: isFirst ? 'var(--muted-foreground)' : 'var(--foreground)' }}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all disabled:opacity-30"
                  >
                    <ChevronLeft size={18} />
                    Quay lại
                  </button>
                  <button
                    onClick={() => {
                      if (isLast) {
                        if (window.confirm('Bạn có chắc chắn muốn nộp bài?')) onSubmit();
                      } else {
                        setCurrentIdx(prev => prev + 1);
                      }
                    }}
                    style={{ 
                      backgroundColor: isLast ? 'var(--primary)' : 'transparent',
                      color: isLast ? 'var(--primary-foreground)' : 'var(--foreground)'
                    }}
                    className="flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-bold transition-all"
                  >
                    {isLast ? 'Nộp bài' : 'Tiếp theo'}
                    {!isLast && <ChevronRight size={18} />}
                  </button>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </main>

      {/* Mobile Nav Toggle */}
      <button 
        onClick={() => setShowNav(!showNav)}
        style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}
        className="lg:hidden fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-2xl flex items-center justify-center z-40"
      >
        <List />
      </button>

      {/* Mobile Grid Overlap */}
      <AnimatePresence>
        {showNav && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            style={{ backgroundColor: 'var(--card)' }}
            className="lg:hidden fixed inset-x-0 bottom-0 z-50 p-6 rounded-t-[40px] shadow-[0_-20px_50px_rgba(0,0,0,0.15)] border-t border-gray-100 dark:border-gray-800"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-black text-sm uppercase tracking-widest">Danh sách câu hỏi</h3>
              <button onClick={() => setShowNav(false)} className="p-2 text-gray-400">Đóng</button>
            </div>
            <div className="grid grid-cols-6 gap-2 overflow-y-auto max-h-[50vh] pb-6">
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
                    style={{
                      backgroundColor: isActive ? 'var(--primary)' : isAnswered ? 'var(--accent)' : 'var(--muted)',
                      color: isActive ? 'var(--primary-foreground)' : isAnswered ? 'var(--primary)' : 'var(--muted-foreground)',
                    }}
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-xs font-bold transition-all"
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
