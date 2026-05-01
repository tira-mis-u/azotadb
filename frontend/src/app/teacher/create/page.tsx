'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/components/providers/theme-provider';
import axios from 'axios';
import {
  Plus, Trash2, Save, ArrowLeft, ArrowRight,
  Clock, Calendar, FileText, Layout, CheckCircle2,
  AlertCircle, ChevronDown, ChevronUp, GripVertical, Edit2, Loader2
} from 'lucide-react';
import Link from 'next/link';
import { QuestionEditor } from '@/components/teacher/question-editor';
import { MarkdownRenderer } from '@/components/ui/markdown-renderer';
import { PageHeader } from '@/components/ui/page-header';

export const questionSchema = z.object({
  type: z.enum(['MULTIPLE_CHOICE', 'TRUE_FALSE', 'TRUE_FALSE_GROUP', 'ESSAY']),
  content: z.string().min(1, 'Nội dung câu hỏi không được để trống'),
  points: z.number().min(0),
  metadata: z.object({
    choices: z.array(z.object({
      id: z.string(),
      content: z.string().min(1, 'Nội dung lựa chọn không được để trống'),
    })).optional(),
    correct_answers: z.array(z.string()).optional(),
    correct_answer: z.boolean().optional(),
    explanation: z.string().optional(),
    // For TRUE_FALSE_GROUP
    statements: z.array(z.object({
      id: z.string(),
      content: z.string(),
      correctAnswer: z.boolean(),
    })).optional(),
  }),
});

export const examSchema = z.object({
  title: z.string().min(1, 'Tiêu đề không được để trống'),
  description: z.string().optional(),
  isTimed: z.boolean().default(true),
  duration: z.number().min(1, 'Thời gian làm bài ít nhất 1 phút').optional(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  mode: z.enum(['STANDARD', 'THPTQG']),
  examCode: z.string().optional(),
  requiresPassword: z.boolean().default(false),
  password: z.string().optional(),
  strictMode: z.boolean(),
  fullscreenRequired: z.boolean(),
  maxAttempts: z.number().min(0),
  allowScoreView: z.boolean(),
  allowAnswerReview: z.boolean(),
  maxScore: z.number().min(0),
  questions: z.array(questionSchema),
});

export type ExamForm = z.infer<typeof examSchema>;

export default function CreateExamPage() {
  const { session } = useAuth();
  const { theme } = useTheme();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const { register, control, handleSubmit, watch, setValue, formState: { errors } } = useForm<ExamForm>({
    resolver: zodResolver(examSchema) as any,
    defaultValues: {
      title: '',
      isTimed: true,
      duration: 60,
      mode: 'STANDARD',
      examCode: '',
      requiresPassword: false,
      password: '',
      strictMode: false,
      fullscreenRequired: false,
      maxAttempts: 0,
      allowScoreView: true,
      allowAnswerReview: true,
      maxScore: 10.0,
      questions: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'questions',
  });

  const onSubmit = async (data: ExamForm) => {
    if (!session?.access_token) return;
    setIsLoading(true);
    try {
      // 1. Create Exam
      const examRes = await axios.post('/api/exams', {
        title: data.title,
        description: data.description,
        isTimed: data.isTimed,
        duration: data.isTimed ? data.duration : null,
        startTime: data.startTime ? new Date(data.startTime).toISOString() : null,
        endTime: data.endTime ? new Date(data.endTime).toISOString() : null,
        mode: data.mode,
        examCode: data.examCode,
        requiresPassword: data.requiresPassword,
        password: data.password,
        strictMode: data.strictMode,
        fullscreenRequired: data.fullscreenRequired,
        maxAttempts: data.maxAttempts,
        allowScoreView: data.allowScoreView,
        allowAnswerReview: data.allowAnswerReview,
        maxScore: data.maxScore,
      }, {
        headers: { Authorization: `Bearer ${session.access_token}` }
      });

      const examId = examRes.data.id;

      // 2. Add Questions
      await axios.post(`/api/exams/${examId}/questions`, data.questions, {
        headers: { Authorization: `Bearer ${session.access_token}` }
      });

      router.push('/teacher/exams');
    } catch (err) {
      console.error('Failed to create exam:', err);
      alert('Có lỗi xảy ra khi tạo đề thi.');
    } finally {
      setIsLoading(false);
    }
  };

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  return (
    <div style={{ padding: '32px 40px', maxWidth: 1000, margin: '0 auto' }}>
      <PageHeader 
        title="Tạo đề thi mới" 
        description="Thiết lập thông tin và bộ câu hỏi cho đề thi của bạn."
        backHref="/teacher/exams"
        breadcrumbs={[
          { label: 'Quản lý đề thi', href: '/teacher/exams' },
          { label: 'Tạo mới' }
        ]}
        actions={
          <div className="flex items-center gap-3">
            <span style={{ color: 'var(--muted-foreground)' }} className="text-[10px] font-bold uppercase tracking-widest">BƯỚC {step}/2</span>
            <div style={{ backgroundColor: 'var(--muted)' }} className="w-32 h-2 rounded-full overflow-hidden">
              <motion.div
                initial={false}
                animate={{ width: `${(step / 2) * 100}%` }}
                style={{ backgroundColor: 'var(--primary)' }}
                className="h-full"
              />
            </div>
          </div>
        }
      />

      <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-8">
        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              <div 
                style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
                className="rounded-[2.5rem] p-8 md:p-10 shadow-sm border space-y-8"
              >
                <div className="flex items-center gap-3">
                  <div style={{ backgroundColor: 'var(--accent)', color: 'var(--primary)' }} className="w-10 h-10 rounded-2xl flex items-center justify-center">
                    <Layout size={20} />
                  </div>
                  <h2 style={{ color: 'var(--foreground)' }} className="text-xl font-black">Thông tin cơ bản</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="md:col-span-2">
                    <label style={{ color: 'var(--foreground)' }} className="block text-sm font-bold mb-3 uppercase tracking-wider">Tiêu đề đề thi</label>
                    <input
                      {...register('title')}
                      type="text"
                      placeholder="Ví dụ: Kiểm tra Toán giải tích chương 1"
                      style={{ 
                        backgroundColor: 'var(--input)', 
                        borderColor: 'var(--border)', 
                        color: 'var(--foreground)' 
                      }}
                      className="w-full px-5 py-4 rounded-2xl border text-base focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                    />
                    {errors.title && <p className="text-red-500 text-xs mt-2 font-bold">{errors.title.message}</p>}
                  </div>

                  <div className="md:col-span-2">
                    <label style={{ color: 'var(--foreground)' }} className="block text-sm font-bold mb-3 uppercase tracking-wider">Mô tả chi tiết</label>
                    <textarea
                      {...register('description')}
                      rows={3}
                      placeholder="Mô tả nội dung, quy định phòng thi hoặc hướng dẫn thí sinh..."
                      style={{ 
                        backgroundColor: 'var(--input)', 
                        borderColor: 'var(--border)', 
                        color: 'var(--foreground)' 
                      }}
                      className="w-full px-5 py-4 rounded-2xl border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all resize-none font-medium"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label style={{ color: 'var(--foreground)' }} className="block text-sm font-bold uppercase tracking-wider">Giới hạn thời gian</label>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" {...register('isTimed')} className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
                      </label>
                    </div>
                    {watch('isTimed') ? (
                      <div className="relative">
                        <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          {...register('duration', { valueAsNumber: true })}
                          type="number"
                          placeholder="Số phút làm bài"
                          style={{ 
                            backgroundColor: 'var(--input)', 
                            borderColor: 'var(--border)', 
                            color: 'var(--foreground)' 
                          }}
                          className="w-full pl-12 pr-5 py-4 rounded-2xl border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-bold"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">PHÚT</span>
                      </div>
                    ) : (
                      <div style={{ backgroundColor: 'var(--muted)', color: 'var(--muted-foreground)' }} className="px-5 py-4 rounded-2xl text-xs font-bold italic border border-dashed border-gray-300 dark:border-gray-700">
                        Đề thi không giới hạn thời gian làm bài.
                      </div>
                    )}
                    {errors.duration && <p className="text-red-500 text-xs mt-2 font-bold">{errors.duration.message}</p>}
                  </div>

                  <div>
                    <label style={{ color: 'var(--foreground)' }} className="block text-sm font-bold mb-3 uppercase tracking-wider">Thời gian bắt đầu</label>
                    <div className="relative">
                      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        {...register('startTime')}
                        type="datetime-local"
                        style={{ 
                          backgroundColor: 'var(--input)', 
                          borderColor: 'var(--border)', 
                          color: 'var(--foreground)' 
                        }}
                        className="w-full pl-12 pr-5 py-4 rounded-2xl border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-bold"
                      />
                    </div>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid var(--border)' }} className="pt-8">
                  <h3 style={{ color: 'var(--foreground)' }} className="text-xl font-black mb-8 flex items-center gap-2">
                    <Edit2 size={20} className="text-indigo-600" /> Cài đặt nâng cao
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <label style={{ color: 'var(--foreground)' }} className="block text-sm font-bold mb-3 uppercase tracking-wider">Chế độ hiển thị</label>
                      <select
                        {...register('mode')}
                        style={{ 
                          backgroundColor: 'var(--input)', 
                          borderColor: 'var(--border)', 
                          color: 'var(--foreground)' 
                        }}
                        className="w-full px-5 py-4 rounded-2xl border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-bold"
                      >
                        <option value="STANDARD">Tiêu chuẩn (Lượt câu hỏi)</option>
                        <option value="THPTQG">Phòng thi THPT Quốc gia (Bubble Sheet)</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ color: 'var(--foreground)' }} className="block text-sm font-bold mb-3 uppercase tracking-wider">Mã đề thi</label>
                      <input
                        {...register('examCode')}
                        type="text"
                        placeholder="Ví dụ: 101, 202, 305..."
                        style={{ 
                          backgroundColor: 'var(--input)', 
                          borderColor: 'var(--border)', 
                          color: 'var(--foreground)' 
                        }}
                        className="w-full px-5 py-4 rounded-2xl border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-bold"
                      />
                    </div>

                    <div className="md:col-span-2">
                       <div 
                         style={{ backgroundColor: 'var(--muted)', borderColor: 'var(--border)' }}
                         className="p-6 rounded-3xl border flex items-center justify-between group"
                       >
                         <div>
                            <p style={{ color: 'var(--foreground)' }} className="font-bold">Bảo vệ bằng mật khẩu</p>
                            <p style={{ color: 'var(--muted-foreground)' }} className="text-xs">Yêu cầu thí sinh nhập mật khẩu để tham gia bài thi.</p>
                         </div>
                         <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" {...register('requiresPassword')} className="sr-only peer" />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
                          </label>
                       </div>
                       
                       {watch('requiresPassword') && (
                         <motion.div
                           initial={{ opacity: 0, y: -10 }}
                           animate={{ opacity: 1, y: 0 }}
                           className="mt-4"
                         >
                           <input
                             {...register('password')}
                             type="text"
                             placeholder="Nhập mật khẩu truy cập"
                             style={{ 
                               backgroundColor: 'var(--input)', 
                               borderColor: 'var(--primary)', 
                               color: 'var(--foreground)' 
                             }}
                             className="w-full px-5 py-4 rounded-2xl border text-base focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-black text-center tracking-widest shadow-xl shadow-indigo-500/10"
                           />
                         </motion.div>
                       )}
                    </div>

                    <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                       {[
                         { id: 'strictMode', label: 'Chế độ Nghiêm ngặt', desc: 'Chặn chuyển tab, copy-paste.' },
                         { id: 'fullscreenRequired', label: 'Toàn màn hình', desc: 'Bắt buộc mở toàn màn hình.' },
                         { id: 'allowScoreView', label: 'Xem điểm ngay', desc: 'Cho phép thí sinh xem điểm sau thi.' },
                         { id: 'allowAnswerReview', label: 'Xem đáp án', desc: 'Cho phép thí sinh xem lại bài làm.' }
                       ].map((opt) => (
                         <label 
                           key={opt.id} 
                           style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
                           className="flex items-start gap-4 p-5 rounded-2xl border hover:border-indigo-500 transition-all cursor-pointer group"
                         >
                            <input 
                              type="checkbox" 
                              // @ts-ignore
                              {...register(opt.id)} 
                              className="w-5 h-5 mt-0.5 text-indigo-600 rounded-lg border-gray-300 focus:ring-indigo-500" 
                            />
                            <div>
                               <p style={{ color: 'var(--foreground)' }} className="text-sm font-bold group-hover:text-indigo-600 transition-colors">{opt.label}</p>
                               <p style={{ color: 'var(--muted-foreground)' }} className="text-[10px] uppercase font-bold tracking-wider mt-1">{opt.desc}</p>
                            </div>
                         </label>
                       ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  type="button"
                  onClick={nextStep}
                  style={{ 
                    backgroundColor: 'var(--primary)', 
                    color: 'var(--primary-foreground)',
                    boxShadow: theme === 'neon' ? '0 0 20px var(--primary)' : '0 10px 25px -5px rgba(79, 70, 229, 0.4)'
                  }}
                  className="flex items-center gap-2 px-8 py-4 rounded-2xl font-black text-sm transition-all hover:scale-105 active:scale-95"
                >
                  Tiếp theo: Soạn câu hỏi <ArrowRight size={18} />
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
                <div className="flex items-center gap-3">
                  <div style={{ backgroundColor: 'var(--accent)', color: 'var(--primary)' }} className="w-10 h-10 rounded-2xl flex items-center justify-center">
                    <FileText size={20} />
                  </div>
                  <div>
                    <h2 style={{ color: 'var(--foreground)' }} className="text-lg font-black">Danh sách câu hỏi</h2>
                    <p style={{ color: 'var(--muted-foreground)' }} className="text-xs font-bold uppercase tracking-widest mt-0.5">Đã tạo {fields.length} câu</p>
                  </div>
                </div>
                <div 
                  style={{ backgroundColor: 'var(--muted)', borderColor: 'var(--border)', color: 'var(--muted-foreground)' }}
                  className="flex items-center gap-2 text-xs px-4 py-2.5 rounded-2xl border font-bold"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  Tổng điểm: <span style={{ color: 'var(--primary)' }} className="text-lg font-black">{fields.reduce((acc, f) => acc + (watch(`questions.${fields.indexOf(f)}.points`) || 0), 0)}</span>
                </div>
              </div>

              <div className="space-y-4">
                <AnimatePresence>
                  {fields.map((field: any, index) => (
                    <motion.div
                      key={field.id}
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
                      className="rounded-[2rem] p-6 border shadow-sm flex items-center justify-between group hover:border-indigo-300 transition-all"
                    >
                      <div className="flex items-center gap-6 flex-1">
                        <div style={{ backgroundColor: 'var(--muted)', color: 'var(--primary)' }} className="w-10 h-10 rounded-2xl flex items-center justify-center text-sm font-black shadow-inner">
                          {index + 1}
                        </div>
                        <div className="flex-1 overflow-hidden">
                          <div className="flex items-center gap-3 mb-2">
                            <span style={{ backgroundColor: 'var(--accent)', color: 'var(--primary)' }} className="text-[10px] font-black tracking-widest uppercase px-3 py-1 rounded-xl border border-indigo-100 dark:border-indigo-900/30">
                              {watch(`questions.${index}.type`)}
                            </span>
                            <span style={{ color: 'var(--muted-foreground)' }} className="text-xs font-black uppercase tracking-wider">{watch(`questions.${index}.points`)} điểm</span>
                          </div>
                          <div style={{ color: 'var(--foreground)' }} className="text-sm font-medium line-clamp-2 pr-8 leading-relaxed opacity-80">
                            <MarkdownRenderer content={watch(`questions.${index}.content`) || 'Chưa có nội dung...'} />
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setEditingIndex(index)}
                          style={{ backgroundColor: 'var(--accent)', color: 'var(--primary)' }}
                          className="p-3 rounded-2xl transition-all hover:scale-110 active:scale-90"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => remove(index)}
                          className="p-3 rounded-2xl bg-red-50 dark:bg-red-900/20 text-red-500 transition-all hover:scale-110 active:scale-90"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              <button
                type="button"
                onClick={() => setEditingIndex(-1)}
                style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', color: 'var(--muted-foreground)' }}
                className="w-full py-8 border-2 border-dashed rounded-[2.5rem] hover:text-indigo-600 hover:border-indigo-400 hover:bg-indigo-50/20 transition-all flex flex-col items-center justify-center gap-3 font-bold group"
              >
                <div style={{ backgroundColor: 'var(--muted)' }} className="w-12 h-12 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Plus className="w-6 h-6" />
                </div>
                THÊM CÂU HỎI MỚI
              </button>

              <div className="flex items-center justify-between pt-10">
                <button
                  type="button"
                  onClick={prevStep}
                  style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                  className="flex items-center gap-2 px-8 py-4 rounded-2xl border font-black text-xs uppercase tracking-widest hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
                >
                  <ArrowLeft size={16} /> Quay lại
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  style={{ 
                    backgroundColor: 'var(--primary)', 
                    color: 'var(--primary-foreground)',
                    boxShadow: theme === 'neon' ? '0 0 20px var(--primary)' : '0 10px 25px -5px rgba(79, 70, 229, 0.4)'
                  }}
                  className="flex items-center gap-3 px-10 py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all hover:scale-105 disabled:opacity-60"
                >
                  {isLoading ? (
                    <Loader2 size={20} className="animate-spin" />
                  ) : (
                    <>Hoàn tất & Lưu đề thi <Save size={18} /></>
                  )}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </form>

      {/* Editor Modal Overlay */}
      <AnimatePresence>
        {editingIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md p-4 md:p-8 lg:p-12 flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.9, y: 40 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 40 }}
              style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)' }}
              className="w-full h-full rounded-[3rem] shadow-2xl overflow-hidden flex flex-col border"
            >
              <div style={{ backgroundColor: 'var(--card)', borderBottom: '1px solid var(--border)' }} className="flex items-center justify-between px-8 py-5">
                <div className="flex items-center gap-3">
                  <div style={{ backgroundColor: 'var(--accent)', color: 'var(--primary)' }} className="w-10 h-10 rounded-2xl flex items-center justify-center">
                    <Edit2 size={18} />
                  </div>
                  <h3 style={{ color: 'var(--foreground)' }} className="font-black text-lg">
                    {editingIndex === -1 ? 'SOẠN THẢO CÂU HỎI MỚI' : `CHỈNH SỬA CÂU HỎI ${editingIndex + 1}`}
                  </h3>
                </div>
                <button
                  onClick={() => setEditingIndex(null)}
                  style={{ backgroundColor: 'var(--muted)', color: 'var(--foreground)' }}
                  className="p-3 rounded-2xl transition-all hover:scale-110 active:scale-90"
                >
                  <Plus className="w-5 h-5 rotate-45" />
                </button>
              </div>
              
              <div className="flex-1 overflow-hidden">
                <QuestionEditor 
                  initialValue={
                    editingIndex !== -1 
                      ? `${watch(`questions.${editingIndex}.content`)}\n\n${(watch(`questions.${editingIndex}.metadata.choices`) || []).map((c: any) => `${watch(`questions.${editingIndex}.metadata.correct_answers`)?.includes(c.id) ? '*' : ''}${c.id}. ${c.content}`).join('\n')}` 
                      : ''
                  }
                  onSave={(parsedQuestion, rawContent) => {
                    const currentPoints = editingIndex !== -1 ? watch(`questions.${editingIndex}.points`) : 1;
                    const newQuestion = {
                      type: parsedQuestion.type,
                      content: parsedQuestion.content,
                      points: currentPoints,
                      metadata: {
                        choices: parsedQuestion.choices,
                        correct_answers: parsedQuestion.correct_answers,
                        correct_answer: parsedQuestion.correct_answer,
                        statements: parsedQuestion.statements,
                        explanation: ''
                      }
                    } as any;

                    if (editingIndex === -1) {
                      append(newQuestion);
                    } else {
                      setValue(`questions.${editingIndex}`, newQuestion);
                    }
                    setEditingIndex(null);
                  }} 
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
