'use client';

import React, { useState, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import useSWR, { mutate } from 'swr';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { DataTable } from '@/components/ui/data-table';
import { QuestionEditor } from '@/components/teacher/question-editor';
import { MarkdownRenderer } from '@/components/ui/markdown-renderer';
import { PageHeader } from '@/components/ui/page-header';
import { 
  Plus, Search, Filter, MoreHorizontal, 
  Eye, Edit, Trash2, Tag, BookOpen, X, CheckCircle2, XCircle, Save, Loader2, Zap
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface ExamMetadata {
  choices?: { id: string; content: string }[];
  correct_answers?: string[];
  correct_answer?: boolean;
  explanation?: string;
  topic?: string;
}

interface ExamRef {
  title: string;
}

interface Question {
  id: string;
  content: string;
  type: 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'TRUE_FALSE_GROUP' | 'ESSAY';
  points: number;
  metadata: ExamMetadata;
  exam?: ExamRef;
}

const fetcher = (url: string, token: string) => 
  axios.get(url, { headers: { Authorization: `Bearer ${token}` } }).then(res => res.data);

export default function QuestionBankPage() {
  const { session, loading: authLoading } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [viewingQuestion, setViewingQuestion] = useState<Question | null>(null);
  
  // Local state for the editor data
  const [tempQuestionData, setTempQuestionData] = useState<any>(null);

  const swrKey = session?.access_token ? ['/api/exams/teacher/questions', session.access_token] : null;

  const { data: questions, error, isLoading } = useSWR<Question[]>(
    swrKey,
    // @ts-ignore
    ([url, token]) => fetcher(url, token)
  );

  const filteredQuestions = questions?.filter((q: Question) => 
    q.content.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleOpenCreate = () => {
    setEditingQuestion(null);
    setTempQuestionData(null);
    setIsEditorOpen(true);
  };

  const handleOpenEdit = (question: any) => {
    setEditingQuestion(question);
    setTempQuestionData(null);
    setIsEditorOpen(true);
  };

  const handleFinalSave = async () => {
    if (!session?.access_token || !tempQuestionData) return;
    setIsSaving(true);
    try {
      if (editingQuestion) {
        await axios.patch(`/api/exams/teacher/questions/${editingQuestion.id}`, {
          content: tempQuestionData.content,
          type: tempQuestionData.type,
          metadata: {
            choices: tempQuestionData.choices,
            correct_answers: tempQuestionData.correct_answers,
            correct_answer: tempQuestionData.correct_answer,
            explanation: tempQuestionData.explanation || ''
          }
        }, { headers: { Authorization: `Bearer ${session.access_token}` } });
      } else {
        // Handle create new if needed
      }
      mutate(swrKey);
      setIsEditorOpen(false);
    } catch (err) {
      console.error('Failed to save question:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Xoá câu hỏi này? Hành động không thể hoàn tác.')) return;
    try {
      await axios.delete(`/api/exams/teacher/questions/${id}`, {
        headers: { Authorization: `Bearer ${session!.access_token}` }
      });
      mutate(swrKey);
    } catch (err) {
      alert('Không thể xoá câu hỏi.');
    }
  };

  const columns = [
    {
      header: 'Nội dung câu hỏi',
      accessorKey: 'content',
      cell: (row: Question) => (
        <div className="max-w-[300px] md:max-w-[500px]">
          <div className="text-sm font-bold text-foreground line-clamp-2 leading-relaxed">
            <MarkdownRenderer content={row.content} />
          </div>
          <div className="flex items-center gap-2 mt-3">
            <span className="inline-flex items-center gap-1 text-[9px] uppercase font-black tracking-widest text-primary bg-primary/10 border border-primary/20 px-3 py-1 rounded-xl shadow-xs">
              {row.type.replace(/_/g, ' ')}
            </span>
            <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-muted-foreground bg-muted px-3 py-1 rounded-xl border border-border">
              <Tag className="w-3 h-3" /> {row.metadata?.topic || 'CHUNG'}
            </span>
          </div>
        </div>
      ),
    },
    {
      header: 'Nguồn đề',
      accessorKey: 'exam.title',
      cell: (row: Question) => (
        <div className="flex items-center gap-3 text-xs text-muted-foreground font-black uppercase tracking-tight">
          <div className="w-8 h-8 rounded-xl bg-success/10 flex items-center justify-center shrink-0">
             <BookOpen className="w-4 h-4 text-success" />
          </div>
          <span className="truncate max-w-[150px]">{row.exam?.title || '—'}</span>
        </div>
      ),
    },
    {
      header: 'Điểm',
      accessorKey: 'points',
      cell: (row: Question) => (
        <span className="text-xs font-black text-amber-600 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-xl">{row.points}Đ</span>
      ),
    },
    {
      header: 'Đáp án',
      accessorKey: 'correct',
      cell: (row: Question) => {
        const meta = row.metadata;
        if (row.type === 'MULTIPLE_CHOICE') {
          const correct = meta?.correct_answers?.join(', ');
          return <span className="text-[10px] font-black text-success bg-success/10 border border-success/20 px-3 py-1 rounded-xl uppercase tracking-widest">{correct}</span>;
        }
        if (row.type === 'TRUE_FALSE') {
          return meta?.correct_answer === true
            ? <span className="flex items-center gap-1.5 text-[10px] font-black text-success uppercase tracking-widest bg-success/10 px-3 py-1 rounded-xl border border-success/20"><CheckCircle2 className="w-3.5 h-3.5" />ĐÚNG</span>
            : <span className="flex items-center gap-1.5 text-[10px] font-black text-destructive uppercase tracking-widest bg-destructive/10 px-3 py-1 rounded-xl border border-destructive/20"><XCircle className="w-3.5 h-3.5" />SAI</span>;
        }
        return <span className="text-[10px] text-muted-foreground italic font-black uppercase tracking-widest">TỰ LUẬN</span>;
      }
    },
    {
      header: 'Thao tác',
      accessorKey: 'actions',
      cell: (row: Question) => (
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setViewingQuestion(row)}
            className="p-3 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-2xl transition-all duration-300"
          >
            <Eye className="w-4.5 h-4.5" />
          </button>
          <button 
            onClick={() => handleOpenEdit(row)}
            className="p-3 text-muted-foreground hover:text-blue-500 hover:bg-blue-500/10 rounded-2xl transition-all duration-300"
          >
            <Edit className="w-4.5 h-4.5" />
          </button>
          <button 
            onClick={() => handleDelete(row.id)}
            className="p-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-2xl transition-all duration-300"
          >
            <Trash2 className="w-4.5 h-4.5" />
          </button>
        </div>
      ),
    },
  ];

  if (authLoading || isLoading) {
    return (
      <div className="p-10 space-y-10 animate-in fade-in duration-700">
        <div className="space-y-4">
          <Skeleton className="h-6 w-48 rounded-full" />
          <Skeleton className="h-12 w-80 rounded-2xl" />
        </div>
        <div className="flex items-center justify-between">
          <Skeleton className="h-16 w-[500px] rounded-[2rem]" />
          <Skeleton className="h-16 w-52 rounded-[2rem]" />
        </div>
        <Skeleton className="h-[600px] w-full rounded-3xl" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-700">
      {/* Integrated Header & Toolbar */}
      <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-2xl transition-all duration-500">
        <div className="p-10 pb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-10">
            <div className="space-y-2">
              <h1 className="text-3xl font-black text-foreground tracking-tighter uppercase leading-none">Ngân hàng câu hỏi</h1>
              <p className="text-sm font-bold text-muted-foreground opacity-70 uppercase tracking-widest leading-relaxed">
                Quản lý hệ thống <span className="text-primary font-black">{questions?.length || 0}</span> câu hỏi thông minh của bạn
              </p>
            </div>
            <button 
              onClick={handleOpenCreate}
              className="flex items-center justify-center gap-3 px-10 py-5 bg-primary text-primary-foreground text-xs font-black rounded-2xl transition-all hover:scale-105 shadow-2xl shadow-primary/30 uppercase tracking-[0.2em]"
            >
              <Plus className="w-5 h-5" /> THÊM CÂU HỎI MỚI
            </button>
          </div>

          <div className="flex flex-col lg:flex-row items-center gap-6">
            <div className="relative flex-1 w-full group">
              <Search className="w-6 h-6 absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-all duration-300" />
              <input
                type="text"
                placeholder="TÌM KIẾM NỘI DUNG, CHỦ ĐỀ HOẶC ĐÁP ÁN..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-16 pr-8 py-5 bg-background border border-border rounded-[2rem] text-sm font-bold focus:ring-8 focus:ring-primary/5 focus:border-primary outline-none transition-all placeholder:text-muted-foreground/40 placeholder:font-black placeholder:uppercase placeholder:tracking-[0.15em] shadow-inner"
              />
            </div>
            <div className="flex items-center gap-4 w-full lg:w-auto">
              <button className="flex-1 lg:flex-none flex items-center justify-center gap-3 px-10 py-5 bg-card border border-border text-foreground text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-muted hover:border-primary/40 transition-all shadow-sm">
                <Filter className="w-5 h-5 text-primary" /> BỘ LỌC
              </button>
              <button className="p-5 bg-muted/50 border border-border rounded-2xl text-muted-foreground hover:bg-primary/10 hover:text-primary transition-all shadow-sm">
                <MoreHorizontal className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>

        {/* DataTable Container directly below toolbar */}
        <div className="border-t border-border/50">
          <DataTable
            columns={columns}
            data={filteredQuestions}
            isLoading={isLoading}
            emptyMessage="Không tìm thấy câu hỏi nào phù hợp với tiêu chí tìm kiếm."
          />
        </div>
      </div>

      {/* Editor Modal Overlay */}
      <AnimatePresence>
        {isEditorOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/90 backdrop-blur-3xl p-6 md:p-12 flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.9, y: 100 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 100 }}
              className="bg-background w-full h-full rounded-[4rem] shadow-[0_0_120px_rgba(0,0,0,0.2)] overflow-hidden flex flex-col border border-border"
            >
              <div className="flex items-center justify-between px-12 py-8 border-b border-border bg-card shrink-0">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary shadow-inner">
                    {editingQuestion ? <Edit size={32} /> : <Plus size={32} />}
                  </div>
                  <div>
                    <h3 className="font-black text-3xl text-foreground tracking-tighter uppercase leading-none">
                      {editingQuestion ? 'Hiệu chỉnh câu hỏi' : 'Tạo mới câu hỏi'}
                    </h3>
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] mt-3 flex items-center gap-2">
                       <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                       Tự động lưu nháp • Realtime Sync
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <button
                    onClick={handleFinalSave}
                    disabled={isSaving}
                    className="flex items-center gap-3 px-10 py-4 bg-primary text-primary-foreground rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                  >
                    {isSaving ? <Loader2 className="animate-spin" /> : <Save size={20} />}
                    LƯU THAY ĐỔI
                  </button>
                  <button
                    onClick={() => setIsEditorOpen(false)}
                    className="p-5 bg-muted hover:bg-destructive hover:text-white rounded-2xl transition-all shadow-inner"
                  >
                    <Plus className="w-6 h-6 rotate-45" />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-hidden p-10">
                <QuestionEditor
                  initialValue={editingQuestion
                    ? `${editingQuestion.content}\n\n${(editingQuestion.metadata?.choices || []).map((c: any) => 
                        `${editingQuestion.metadata?.correct_answers?.includes(c.id) ? '*' : ''}${c.id}. ${c.content}`
                      ).join('\n')}`
                    : ''
                  }
                  onChange={(parsed, raw) => setTempQuestionData(parsed)}
                  isLoading={isSaving}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Preview Modal */}
      <AnimatePresence>
        {viewingQuestion && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/90 backdrop-blur-2xl flex items-center justify-center p-8"
            onClick={() => setViewingQuestion(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 50 }}
              onClick={e => e.stopPropagation()}
              className="bg-card rounded-[3.5rem] shadow-[0_0_80px_rgba(0,0,0,0.15)] border border-border max-w-4xl w-full max-h-[85vh] overflow-hidden flex flex-col transition-all duration-500"
            >
              <div className="flex items-center justify-between p-10 border-b border-border bg-muted/20">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-1 bg-primary rounded-full" />
                  <h3 className="font-black text-2xl text-foreground tracking-tighter uppercase">XEM TRƯỚC CHI TIẾT</h3>
                </div>
                <button
                  onClick={() => setViewingQuestion(null)}
                  className="p-4 bg-muted hover:bg-primary/10 hover:text-primary rounded-2xl transition-all"
                >
                  <Plus className="w-6 h-6 rotate-45" />
                </button>
              </div>
              <div className="p-12 overflow-y-auto space-y-10 custom-scrollbar">
                <div className="text-2xl font-bold text-foreground leading-relaxed animate-in fade-in slide-in-from-bottom-2">
                  <MarkdownRenderer content={viewingQuestion.content} />
                </div>
                
                {viewingQuestion.type === 'MULTIPLE_CHOICE' && (
                  <div className="grid grid-cols-1 gap-4">
                    {viewingQuestion.metadata?.choices?.map((c: any, idx) => {
                      const isCorrect = viewingQuestion.metadata?.correct_answers?.includes(c.id);
                      return (
                        <motion.div 
                          key={c.id} 
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          className={cn(
                            "flex items-center gap-6 p-6 rounded-[1.75rem] border transition-all duration-500 group",
                            isCorrect 
                              ? "border-success/40 bg-success/5 shadow-lg shadow-success/5" 
                              : "border-border bg-background hover:border-primary/20"
                          )}
                        >
                          <span className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black shadow-inner transition-all",
                            isCorrect ? "bg-success text-white scale-110 shadow-lg shadow-success/20" : "bg-muted text-muted-foreground group-hover:text-primary"
                          )}>{c.id}</span>
                          <span className={cn("text-base font-bold", isCorrect ? "text-foreground" : "text-muted-foreground group-hover:text-foreground")}>{c.content}</span>
                          {isCorrect && <CheckCircle2 className="w-6 h-6 text-success ml-auto animate-in zoom-in" />}
                        </motion.div>
                      );
                    })}
                  </div>
                )}
                
                {(viewingQuestion.type === 'TRUE_FALSE' || viewingQuestion.type === 'TRUE_FALSE_GROUP') && (
                   <div className="space-y-4">
                      {viewingQuestion.type === 'TRUE_FALSE' ? (
                        <div className={cn(
                          "flex items-center gap-4 p-6 rounded-[2rem] border font-black text-base uppercase tracking-[0.2em] shadow-xl",
                          viewingQuestion.metadata?.correct_answer 
                            ? "text-success bg-success/10 border-success/30 shadow-success/10" 
                            : "text-destructive bg-destructive/10 border-destructive/30 shadow-destructive/10"
                        )}>
                          {viewingQuestion.metadata?.correct_answer ? <CheckCircle2 className="w-7 h-7" /> : <XCircle className="w-7 h-7" />}
                          ĐÁP ÁN ĐÚNG: {viewingQuestion.metadata?.correct_answer ? 'ĐÚNG' : 'SAI'}
                        </div>
                      ) : (
                        <div className="grid gap-4">
                           {/* Render statements if needed */}
                           <p className="text-xs font-black text-muted-foreground uppercase tracking-widest opacity-50 italic">Dữ liệu dạng câu hỏi tổ hợp Đúng/Sai</p>
                        </div>
                      )}
                   </div>
                )}
                
                {viewingQuestion.metadata?.explanation && (
                  <div className="p-8 bg-primary/5 border border-primary/20 rounded-[2.5rem] text-sm leading-relaxed relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-10 -mt-10 blur-2xl group-hover:bg-primary/10 transition-all" />
                    <span className="font-black text-primary uppercase tracking-[0.25em] block mb-4 flex items-center gap-2">
                       <Zap className="w-4 h-4" /> Giải thích chuyên sâu:
                    </span>
                    <div className="text-foreground/90 font-bold italic text-base leading-loose">
                       {viewingQuestion.metadata.explanation}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
