'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bookmark, Search, Filter, BookOpen, Star, 
  Trash2, Play, ChevronDown, CheckCircle2 
} from 'lucide-react';
import Link from 'next/link';

// Mock data for bookmarks - Emptying to reflect real DB state
const mockBookmarks: any[] = [];

export default function BookmarksPage() {
  const [searchTerm, setSearchTerm] = React.useState('');

  const filteredBookmarks = mockBookmarks.filter(b => 
    b.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.topic.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
            <Bookmark className="w-8 h-8 text-indigo-500 fill-indigo-500/20" />
            Câu hỏi đã lưu
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2 text-base max-w-2xl">
            Quản lý các câu hỏi bạn đã đánh dấu để ôn tập lại trước kỳ thi.
          </p>
        </div>
        
        <button className="flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-lg shadow-indigo-500/25 transition-all hover:scale-[1.02] active:scale-95">
          <Play className="w-4 h-4 fill-current" />
          Ôn tập ngay ({mockBookmarks.length})
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-center gap-4 bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
        <div className="relative w-full sm:flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm theo nội dung, môn học..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800/50 border border-transparent dark:border-gray-700 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 text-sm font-medium rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all w-full sm:w-auto">
            <Filter className="w-4 h-4" /> Môn học <ChevronDown className="w-3 h-3 ml-1" />
          </button>
          <button className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 text-sm font-medium rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all w-full sm:w-auto">
            <Star className="w-4 h-4" /> Độ khó <ChevronDown className="w-3 h-3 ml-1" />
          </button>
        </div>
      </div>

      {/* List */}
      <div className="space-y-4">
        <AnimatePresence>
          {filteredBookmarks.length > 0 ? (
            filteredBookmarks.map((bookmark, i) => (
              <motion.div
                key={bookmark.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2, delay: i * 0.05 }}
                className="group relative bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800 hover:border-indigo-200 dark:hover:border-indigo-800 hover:shadow-xl hover:shadow-indigo-500/5 transition-all overflow-hidden"
              >
                {/* Left Accent line */}
                <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="flex flex-col md:flex-row items-start justify-between gap-6">
                  {/* Content */}
                  <div className="flex-1 space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-1 bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 text-[10px] font-bold uppercase tracking-wider rounded-lg border border-indigo-100 dark:border-indigo-800/50">
                        {bookmark.topic}
                      </span>
                      <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg border ${
                        bookmark.difficulty === 'Dễ' 
                          ? 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/20 dark:border-emerald-800'
                          : 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-900/20 dark:border-amber-800'
                      }`}>
                        {bookmark.difficulty}
                      </span>
                    </div>

                    <h3 className="text-base md:text-lg font-bold text-gray-900 dark:text-white leading-relaxed">
                      {bookmark.content}
                    </h3>

                    <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 font-medium">
                      <span className="flex items-center gap-1.5">
                        <BookOpen className="w-4 h-4 text-gray-400" />
                        {bookmark.examTitle}
                      </span>
                      <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-700" />
                      <span>Đã lưu {new Date(bookmark.addedAt).toLocaleDateString('vi-VN')}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 md:opacity-0 group-hover:opacity-100 transition-opacity w-full md:w-auto pt-4 md:pt-0 border-t border-gray-50 dark:border-gray-800 md:border-0">
                    <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:hover:bg-indigo-900/50 dark:text-indigo-400 text-sm font-bold rounded-xl transition-colors">
                      <CheckCircle2 className="w-4 h-4" /> Xem đáp án
                    </button>
                    <button className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors shrink-0">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="bg-white dark:bg-gray-900 rounded-3xl p-12 border border-dashed border-gray-200 dark:border-gray-800 flex flex-col items-center text-center">
              <Bookmark className="w-12 h-12 text-gray-300 mb-4" />
              <p className="text-gray-500 dark:text-gray-400 font-medium">Bạn chưa lưu câu hỏi nào.</p>
              <Link
                href="/student/practice"
                className="mt-6 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-indigo-500/25 transition-all"
              >
                Vào khu luyện tập
              </Link>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
