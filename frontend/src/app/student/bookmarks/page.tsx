'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bookmark, Search, Filter, BookOpen, Star, 
  Trash2, Play, ChevronDown, CheckCircle2 
} from 'lucide-react';
import Link from 'next/link';
import { PageHeader } from '@/components/ui/page-header';
import { cn } from '@/lib/utils';

// Mock data for bookmarks - Emptying to reflect real DB state
const mockBookmarks: any[] = [];

export default function BookmarksPage() {
  const [searchTerm, setSearchTerm] = React.useState('');

  const filteredBookmarks = mockBookmarks.filter(b => 
    b.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.topic.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderEmpty = () => (
    <div className="py-24 flex flex-col items-center text-center space-y-6 animate-in zoom-in-95">
      <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-4 shadow-inner">
        <Bookmark className="w-10 h-10 text-muted-foreground opacity-30" />
      </div>
      <div className="space-y-2">
        <h2 className="text-2xl font-black text-foreground tracking-tighter uppercase">CHƯA CÓ CÂU HỎI ĐÃ LƯU</h2>
        <p className="text-[10px] font-black text-muted-foreground max-w-sm uppercase tracking-[0.2em] leading-loose opacity-60">HÃY ĐÁNH DẤU NHỮNG CÂU HỎI QUAN TRỌNG TRONG KHI LÀM BÀI ĐỂ ÔN TẬP LẠI TẠI ĐÂY.</p>
      </div>
      <Link
        href="/student/practice"
        className="mt-6 px-10 py-4 bg-primary text-primary-foreground font-black text-xs uppercase tracking-[0.2em] rounded-2xl hover:scale-105 transition-all shadow-xl shadow-primary/30"
      >
        BẮT ĐẦU LUYỆN TẬP
      </Link>
    </div>
  );

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <PageHeader 
        title="Câu hỏi đã lưu" 
        description="Quản lý và ôn tập lại những câu hỏi quan trọng bạn đã đánh dấu trong quá trình luyện tập."
        backHref="/dashboard"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Câu hỏi đã lưu' }
        ]}
        actions={
          <button className="flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-black text-sm uppercase tracking-widest rounded-2xl shadow-xl shadow-primary/20 transition-all hover:scale-105 active:scale-95">
            <Play className="w-5 h-5 fill-current" />
            ÔN TẬP NGAY ({mockBookmarks.length})
          </button>
        }
      />

      <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-2xl transition-all duration-500">
        <div className="p-8 border-b border-border/50 bg-card/50 backdrop-blur-xl">
          <div className="flex flex-col sm:flex-row items-center gap-4 group">
            <div className="relative w-full sm:flex-1">
              <Search className="w-5 h-5 absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <input
                type="text"
                placeholder="TÌM KIẾM NỘI DUNG CÂU HỎI ĐÃ LƯU..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-16 pr-8 py-5 bg-background border border-border rounded-2xl text-sm font-bold focus:ring-8 focus:ring-primary/5 focus:border-primary outline-none transition-all placeholder:text-muted-foreground/40 placeholder:font-black placeholder:uppercase placeholder:tracking-[0.15em] shadow-inner"
              />
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button className="flex items-center justify-center gap-3 px-8 py-5 bg-background border border-border text-foreground text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-muted hover:border-primary/40 transition-all shadow-sm w-full sm:w-auto">
                <Filter className="w-4 h-4 text-primary" /> MÔN HỌC <ChevronDown className="w-3 h-3 ml-1 opacity-50" />
              </button>
            </div>
          </div>
        </div>

        <div className="p-8 min-h-[500px]">
          <AnimatePresence mode="popLayout">
            {filteredBookmarks.length > 0 ? (
              <div className="space-y-6">
                {filteredBookmarks.map((bookmark, i) => (
                  <motion.div
                    key={bookmark.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.4, delay: i * 0.03 }}
                    className="group relative bg-card rounded-2xl p-6 border border-border hover:border-primary/40 hover:shadow-xl transition-all duration-300 overflow-hidden"
                  >
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="flex flex-col md:flex-row items-start justify-between gap-8">
                      <div className="flex-1 space-y-4 min-w-0">
                        <div className="flex flex-wrap items-center gap-3">
                          <span className="px-3 py-1 bg-primary/10 text-primary text-[9px] font-black uppercase tracking-widest rounded-lg border border-primary/20">
                            {bookmark.topic}
                          </span>
                          <span className={cn(
                            "px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded-lg border",
                            bookmark.difficulty === 'Dễ' 
                              ? 'bg-success/10 text-success border-success/30'
                              : 'bg-amber-500/10 text-amber-600 border-amber-500/30'
                          )}>
                            {bookmark.difficulty}
                          </span>
                        </div>
                        <h3 className="text-lg font-black text-foreground leading-tight tracking-tighter uppercase line-clamp-3">
                          {bookmark.content}
                        </h3>
                        <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">
                          <span className="flex items-center gap-2">
                            <BookOpen className="w-4 h-4 text-primary" />
                            {bookmark.examTitle}
                          </span>
                          <span className="w-1.5 h-1.5 rounded-full bg-border" />
                          <span>ĐÃ LƯU {new Date(bookmark.addedAt).toLocaleDateString('vi-VN')}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 w-full md:w-auto pt-6 md:pt-0 border-t border-border/50 md:border-0 relative z-10">
                        <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3.5 bg-muted hover:bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-sm">
                          <CheckCircle2 className="w-4 h-4" /> XEM ĐÁP ÁN
                        </button>
                        <button className="p-3.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl transition-all shadow-sm shrink-0">
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : renderEmpty()}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
