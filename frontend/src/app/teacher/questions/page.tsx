'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import useSWR, { mutate } from 'swr';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { DataTable } from '@/components/ui/data-table';
import { QuestionEditor } from '@/components/teacher/question-editor';
import { MarkdownRenderer } from '@/components/ui/markdown-renderer';
import { 
  Loader2, Plus, Search, Filter, MoreHorizontal, 
  Eye, Edit, Trash2, Tag, BookOpen, X, CheckCircle2, XCircle
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

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
  type: 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'ESSAY';
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
    setIsEditorOpen(true);
  };

  const handleOpenEdit = (question: any) => {
    setEditingQuestion(question);
    setIsEditorOpen(true);
  };

  const handleSave = async (parsedQuestion: any, rawContent: string) => {
    if (!session?.access_token) return;
    setIsSaving(true);
    try {
      if (editingQuestion) {
        await axios.patch(`/api/exams/teacher/questions/${editingQuestion.id}`, {
          content: parsedQuestion.content,
          type: parsedQuestion.type,
          metadata: {
            choices: parsedQuestion.choices,
            correct_answers: parsedQuestion.correct_answers,
            correct_answer: parsedQuestion.correct_answer,
            explanation: parsedQuestion.explanation || ''
          }
        }, { headers: { Authorization: `Bearer ${session.access_token}` } });
      }
      // Note: Creating standalone questions requires an exam context in this architecture.
      // For now we only support editing existing questions from this page.
      mutate(swrKey);
      setIsEditorOpen(false);
    } catch (err) {
      console.error('Failed to save question:', err);
      alert('Không thể lưu câu hỏi. Vui lòng thử lại.');
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
          <div className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2">
            <MarkdownRenderer content={row.content} />
          </div>
          <div className="flex items-center gap-2 mt-1.5">
            <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded-md">
              {row.type === 'MULTIPLE_CHOICE' ? 'Trắc nghiệm' : row.type === 'TRUE_FALSE' ? 'Đúng/Sai' : 'Tự luận'}
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-md">
              <Tag className="w-3 h-3" /> {row.metadata?.topic || 'Chung'}
            </span>
          </div>
        </div>
      ),
    },
    {
      header: 'Nguồn đề',
      accessorKey: 'exam.title',
      cell: (row: Question) => (
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <BookOpen className="w-4 h-4 text-emerald-500 shrink-0" />
          <span className="truncate max-w-[150px]">{row.exam?.title || '—'}</span>
        </div>
      ),
    },
    {
      header: 'Điểm',
      accessorKey: 'points',
      cell: (row: Question) => (
        <span className="text-sm font-bold text-amber-600 bg-amber-50 dark:bg-amber-900/20 px-2 py-0.5 rounded-lg">{row.points}</span>
      ),
    },
    {
      header: 'Đáp án',
      accessorKey: 'correct',
      cell: (row: Question) => {
        const meta = row.metadata;
        if (row.type === 'MULTIPLE_CHOICE') {
          const correct = meta?.correct_answers?.join(', ');
          return <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded-lg">{correct}</span>;
        }
        if (row.type === 'TRUE_FALSE') {
          return meta?.correct_answer === true
            ? <span className="flex items-center gap-1 text-xs font-bold text-emerald-600"><CheckCircle2 className="w-3.5 h-3.5" />Đúng</span>
            : <span className="flex items-center gap-1 text-xs font-bold text-red-500"><XCircle className="w-3.5 h-3.5" />Sai</span>;
        }
        return <span className="text-xs text-gray-400">Tự luận</span>;
      }
    },
    {
      header: 'Thao tác',
      accessorKey: 'actions',
      cell: (row: Question) => (
        <div className="flex items-center gap-1">
          <button 
            onClick={() => setViewingQuestion(row)}
            className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button 
            onClick={() => handleOpenEdit(row)}
            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button 
            onClick={() => handleDelete(row.id)}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  if (authLoading || isLoading) {
    return (
      <div className="p-8 space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-[300px]" />
          <Skeleton className="h-10 w-32" />
        </div>
        <Skeleton className="h-[400px] w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Ngân hàng câu hỏi</h1>
          <p className="text-sm text-gray-500 mt-1">Quản lý tổng cộng <span className="font-bold text-indigo-600">{questions?.length || 0}</span> câu hỏi từ tất cả đề thi.</p>
        </div>
        <button 
          onClick={handleOpenCreate}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-indigo-500/25"
        >
          <Plus className="w-4 h-4" /> Thêm câu hỏi
        </button>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row items-center gap-4 justify-between bg-gray-50/50 dark:bg-gray-900/50">
          <div className="relative w-full sm:w-96">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm nội dung câu hỏi..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
            />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button className="flex items-center justify-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 text-sm font-medium rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all w-full sm:w-auto">
              <Filter className="w-4 h-4" /> Bộ lọc
            </button>
            <button className="p-2 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all">
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Data Table */}
        <div className="p-4">
          <DataTable
            columns={columns}
            data={filteredQuestions}
            emptyMessage="Không tìm thấy câu hỏi nào."
          />
        </div>
      </div>

      {/* Question Editor Modal */}
      <AnimatePresence>
        {isEditorOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-gray-900/60 backdrop-blur-sm p-4 md:p-8 flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white dark:bg-gray-950 w-full h-full rounded-[2rem] shadow-2xl overflow-hidden flex flex-col border border-gray-200 dark:border-gray-800"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 shrink-0">
                <div>
                  <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                    {editingQuestion ? 'Chỉnh sửa câu hỏi' : 'Thêm câu hỏi mới'}
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">Soạn thảo theo định dạng Markdown. Preview realtime ở cột bên phải.</p>
                </div>
                <button
                  onClick={() => setIsEditorOpen(false)}
                  className="p-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-full transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1 overflow-hidden p-4">
                <QuestionEditor
                  initialValue={editingQuestion
                    ? `${editingQuestion.content}\n\n${(editingQuestion.metadata?.choices || []).map((c: any) => 
                        `${editingQuestion.metadata?.correct_answers?.includes(c.id) ? '*' : ''}${c.id}. ${c.content}`
                      ).join('\n')}`
                    : ''
                  }
                  onSave={handleSave}
                  isLoading={isSaving}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Question Preview Modal */}
      <AnimatePresence>
        {viewingQuestion && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-6"
            onClick={() => setViewingQuestion(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              onClick={e => e.stopPropagation()}
              className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
                <h3 className="font-bold text-gray-900 dark:text-white">Xem trước câu hỏi</h3>
                <button
                  onClick={() => setViewingQuestion(null)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </div>
              <div className="p-6">
                <div className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-4">
                  <MarkdownRenderer content={viewingQuestion.content} />
                </div>
                {viewingQuestion.type === 'MULTIPLE_CHOICE' && (
                  <div className="space-y-2">
                    {viewingQuestion.metadata?.choices?.map((c: any) => {
                      const isCorrect = viewingQuestion.metadata?.correct_answers?.includes(c.id);
                      return (
                        <div key={c.id} className={`flex items-center gap-3 p-3 rounded-xl border ${isCorrect ? 'border-emerald-200 bg-emerald-50 dark:bg-emerald-900/20 dark:border-emerald-800' : 'border-gray-100 dark:border-gray-800'}`}>
                          <span className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold ${isCorrect ? 'bg-emerald-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'}`}>{c.id}</span>
                          <span className="text-sm text-gray-700 dark:text-gray-300">{c.content}</span>
                          {isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-500 ml-auto" />}
                        </div>
                      );
                    })}
                  </div>
                )}
                {viewingQuestion.type === 'TRUE_FALSE' && (
                  <div className={`flex items-center gap-2 p-3 rounded-xl mt-2 font-bold ${viewingQuestion.metadata?.correct_answer ? 'text-emerald-600 bg-emerald-50' : 'text-red-500 bg-red-50'}`}>
                    {viewingQuestion.metadata?.correct_answer ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                    Đáp án: {viewingQuestion.metadata?.correct_answer ? 'ĐÚNG' : 'SAI'}
                  </div>
                )}
                {viewingQuestion.metadata?.explanation && (
                  <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-xl text-sm text-blue-700 dark:text-blue-300">
                    <span className="font-bold">Giải thích: </span>{viewingQuestion.metadata.explanation}
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
