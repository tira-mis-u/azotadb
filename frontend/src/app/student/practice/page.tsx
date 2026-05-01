'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Dumbbell, Target, Zap, Clock, ChevronRight, 
  BrainCircuit, Star, Flame, Award
} from 'lucide-react';
import Link from 'next/link';

// Topics for practice - Emptying to reflect real DB state
const topics: any[] = [];

export default function PracticePage() {
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [questionCount, setQuestionCount] = useState(10);

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-2xl md:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
            <Dumbbell className="w-8 h-8 text-indigo-500" />
            Khu vực Luyện tập
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2 text-base max-w-2xl">
            Tuỳ chỉnh bài luyện tập của bạn để cải thiện điểm số ở các chủ đề còn yếu.
          </p>
        </div>
        
        {/* Quick Stats */}
        <div className="flex items-center gap-4 bg-white dark:bg-gray-900 p-3 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-orange-50 dark:bg-orange-900/20 rounded-xl">
            <Flame className="w-5 h-5 text-orange-500" />
            <span className="font-bold text-orange-700 dark:text-orange-400">3 Ngày</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl">
            <Award className="w-5 h-5 text-indigo-500" />
            <span className="font-bold text-indigo-700 dark:text-indigo-400">1,250 XP</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Configuration */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Topic Selection */}
          <section className="bg-white dark:bg-gray-900 rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-gray-400" />
              1. Chọn chủ đề
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {topics.length > 0 ? (
                topics.map(topic => (
                  <button
                    key={topic.id}
                    onClick={() => setSelectedTopic(topic.id)}
                    className={`relative p-4 rounded-2xl border-2 text-left transition-all overflow-hidden ${
                      selectedTopic === topic.id 
                        ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-900/10' 
                        : 'border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700'
                    }`}
                  >
                    <div className={`absolute top-0 left-0 w-1.5 h-full ${topic.color}`} />
                    <h3 className="font-bold text-gray-900 dark:text-white mb-1 pl-2">{topic.name}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 pl-2">{topic.questions} câu hỏi có sẵn</p>
                    
                    {selectedTopic === topic.id && (
                      <motion.div layoutId="check" className="absolute top-4 right-4 text-indigo-500">
                        <Star className="w-5 h-5 fill-current" />
                      </motion.div>
                    )}
                  </button>
                ))
              ) : (
                <div className="col-span-full py-12 flex flex-col items-center justify-center text-gray-400 border border-dashed border-gray-200 dark:border-gray-800 rounded-2xl">
                  <Target className="w-8 h-8 mb-2 opacity-20" />
                  <p className="text-sm italic">Chưa có chủ đề luyện tập nào khả dụng</p>
                </div>
              )}
            </div>
          </section>

          {/* Settings Selection */}
          <section className="bg-white dark:bg-gray-900 rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-gray-400" />
              2. Tuỳ chỉnh độ dài
            </h2>
            <div className="flex flex-wrap gap-4">
              {[5, 10, 20, 50].map(num => (
                <button
                  key={num}
                  onClick={() => setQuestionCount(num)}
                  className={`px-6 py-3 rounded-2xl font-bold transition-all ${
                    questionCount === num
                      ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900 shadow-lg'
                      : 'bg-gray-50 text-gray-600 dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  {num} Câu
                </button>
              ))}
            </div>
          </section>
        </div>

        {/* Right Column - Actions */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-indigo-500 to-violet-600 rounded-3xl p-6 text-white shadow-xl shadow-indigo-500/20">
            <h2 className="text-xl font-bold mb-2">Sẵn sàng chưa?</h2>
            <p className="text-indigo-100 text-sm mb-6 line-clamp-3">
              Bạn đang chuẩn bị luyện tập {questionCount} câu hỏi về chủ đề {selectedTopic ? topics.find(t => t.id === selectedTopic)?.name : 'Ngẫu nhiên'}.
            </p>
            
            <button className="w-full py-4 bg-white text-indigo-600 font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-gray-50 transition-all hover:scale-[1.02] active:scale-95">
              <Zap className="w-5 h-5 fill-current" />
              Bắt đầu ngay
            </button>
          </div>

          {/* Smart Suggestions */}
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4 uppercase tracking-wider flex items-center gap-2">
              <BrainCircuit className="w-4 h-4 text-emerald-500" />
              AI Gợi ý
            </h3>
            <div className="space-y-4">
              <button className="w-full text-left p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/20 transition-all group">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-emerald-700 dark:text-emerald-400">Ôn tập điểm yếu</h4>
                  <ChevronRight className="w-4 h-4 text-emerald-500 group-hover:translate-x-1 transition-transform" />
                </div>
                <p className="text-xs text-emerald-600/70 dark:text-emerald-500/70 mt-1">20 câu hỏi xoáy vào các lỗi sai gần đây</p>
              </button>

              <button className="w-full text-left p-4 rounded-2xl bg-rose-50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-800/50 hover:bg-rose-100 dark:hover:bg-rose-900/20 transition-all group">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-rose-700 dark:text-rose-400">Thi thử ngẫu nhiên</h4>
                  <ChevronRight className="w-4 h-4 text-rose-500 group-hover:translate-x-1 transition-transform" />
                </div>
                <p className="text-xs text-rose-600/70 dark:text-rose-500/70 mt-1">Luyện tập như thi thật với mọi chủ đề</p>
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
