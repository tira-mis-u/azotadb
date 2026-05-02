'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import axios from 'axios';
import {
  Plus, Trash2, Save, ArrowLeft, ArrowRight,
  Clock, Calendar, FileText, Layout, CheckCircle2,
  ChevronDown, ChevronUp, GripVertical, Edit2, Loader2,
  ShieldCheck, Zap, AlertCircle, X
} from 'lucide-react';
import { QuestionEditor } from '@/components/teacher/question-editor';
import { MarkdownRenderer } from '@/components/ui/markdown-renderer';
import { PageHeader } from '@/components/ui/page-header';
import { GlobalExamEditor } from '@/components/teacher/global-exam-editor';
import { examToMarkdown } from '@/lib/utils/global-exam-parser';
import { cn } from '@/lib/utils';

export const questionSchema = z.object({
  type: z.enum(['MULTIPLE_CHOICE', 'TRUE_FALSE_GROUP', 'ESSAY']),
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
  durationValue: z.number().min(1, 'Thời gian làm bài ít nhất 1 đơn vị').optional(),
  durationUnit: z.enum(['MINUTE', 'HOUR', 'DAY', 'WEEK', 'MONTH']).default('MINUTE'),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  mode: z.enum(['PRACTICE', 'STANDARD', 'THPTQG']),
  requiresPassword: z.boolean().default(false),
  password: z.string().optional(),
  strictMode: z.boolean(),
  fullscreenRequired: z.boolean(),
  maxAttempts: z.number().min(0),
  allowScoreView: z.boolean(),
  allowAnswerReview: z.boolean(),
  maxScore: z.number().min(0),
  requireLogin: z.boolean().default(false),
  questions: z.array(questionSchema),
});

export type ExamForm = z.infer<typeof examSchema>;

export default function CreateExamPage() {
  const { session } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editorMode, setEditorMode] = useState<'visual' | 'markdown'>('visual');
  const [validationError, setValidationError] = useState<string | null>(null);

  const { register, control, handleSubmit, watch, setValue, trigger, formState: { errors } } = useForm<ExamForm>({
    resolver: zodResolver(examSchema) as any,
    defaultValues: {
      title: '',
      isTimed: true,
      durationValue: 60,
      durationUnit: 'MINUTE',
      mode: 'STANDARD',
      requiresPassword: false,
      password: '',
      strictMode: false,
      fullscreenRequired: false,
      maxAttempts: 0,
      allowScoreView: true,
      allowAnswerReview: true,
      maxScore: 10.0,
      requireLogin: false,
      questions: [],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'questions' });

  const onSubmit = async (data: ExamForm) => {
    if (!session?.access_token) return;
    setIsLoading(true);
    try {
      const { 
        questions, 
        startTime, 
        endTime, 
        isTimed,
        durationValue,
        durationUnit,
        ...rest 
      } = data;

      const examPayload = {
        ...rest,
        isTimed,
        durationValue: isTimed ? durationValue : null,
        durationUnit: isTimed ? durationUnit : null,
        startTime: (startTime && startTime.trim() !== '') ? new Date(startTime).toISOString() : null,
        endTime: (endTime && endTime.trim() !== '') ? new Date(endTime).toISOString() : null,
      };

      const examRes = await axios.post('/api/exams', examPayload, {
        headers: { Authorization: `Bearer ${session.access_token}` }
      });

      const examId = examRes.data.id;
      await axios.post(`/api/exams/${examId}/questions`, data.questions, {
        headers: { Authorization: `Bearer ${session.access_token}` }
      });
      router.push('/teacher/exams');
    } catch (err) {
      console.error('Failed to create exam:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const nextStep = async () => {
    const titleValue = watch('title');
    if (!titleValue || titleValue.trim() === '') {
      if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
      setValidationError("BẠN CHƯA NHẬP TIÊU ĐỀ ĐỀ THI");
      setTimeout(() => setValidationError(null), 5000);
      return;
    }
    const isValid = await trigger(['title', 'durationValue', 'mode']);
    if (isValid) setStep(step + 1);
  };

  const prevStep = () => setStep(step - 1);

  const handleGlobalChange = useCallback((parsed: any) => {
    if (parsed.title !== undefined) setValue('title', parsed.title, { shouldDirty: true });
    if (parsed.description !== undefined) setValue('description', parsed.description);
    if (parsed.mode !== undefined) setValue('mode', parsed.mode);
    if (parsed.durationValue !== undefined) setValue('durationValue', parsed.durationValue);
    if (parsed.durationUnit !== undefined) setValue('durationUnit', parsed.durationUnit);
    
    const newQuestions = parsed.items.filter((item: any) => item.type !== 'SECTION').map((q: any) => ({
      type: q.type,
      content: q.content,
      points: 1,
      metadata: {
        choices: q.choices,
        correct_answers: q.correct_answers,
        correct_answer: q.correct_answer,
        statements: q.statements,
      }
    }));
    setValue('questions', newQuestions);
  }, [setValue]);

  return (
    <div className="p-8 max-w-7xl mx-auto animate-in fade-in duration-500">
      {/* Required Validation Modal - Unified Style */}
      <AnimatePresence>
        {validationError && (
          <motion.div 
            initial={{ opacity: 0, y: -50 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: -50 }} 
            className="fixed top-8 left-1/2 -translate-x-1/2 z-[200] w-full max-w-md px-4"
          >
            <div className="bg-destructive text-destructive-foreground px-8 py-4 rounded-2xl shadow-2xl flex items-center justify-between border border-white/20 backdrop-blur-xl">
              <div className="flex items-center gap-4">
                <AlertCircle size={24} />
                <span className="font-black text-xs uppercase tracking-widest">{validationError}</span>
              </div>
              <button onClick={() => setValidationError(null)} className="p-2 hover:bg-white/10 rounded-lg transition-all">
                <X size={18} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-2xl transition-all duration-500">
        {/* Header Section */}
        <div className="p-10 pb-6 border-b border-border/50 bg-card">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <button onClick={() => router.back()} className="p-3 bg-muted rounded-xl text-muted-foreground hover:text-primary transition-all">
                  <ArrowLeft size={20} />
                </button>
                <h1 className="text-3xl font-black text-foreground tracking-tighter uppercase leading-none">Thiết lập đề thi</h1>
              </div>
              <p className="text-sm font-bold text-muted-foreground opacity-70 uppercase tracking-widest leading-relaxed ml-14">
                Định hình cấu trúc và nội dung cho kỳ thi sắp tới
              </p>
            </div>

            <div className="flex items-center gap-6">
              {step === 2 && (
                <div className="flex items-center gap-1 bg-muted p-1.5 rounded-xl border border-border shadow-inner">
                  {['visual', 'markdown'].map((m) => (
                    <button 
                      key={m}
                      type="button"
                      onClick={() => setEditorMode(m as any)}
                      className={cn(
                        "px-5 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                        editorMode === m ? "bg-primary text-primary-foreground shadow-lg" : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {m === 'visual' ? 'TRỰC QUAN' : 'MARKDOWN'}
                    </button>
                  ))}
                </div>
              )}
              <div className="flex flex-col items-end gap-2">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">TIẾN TRÌNH {step}/2</span>
                <div className="w-32 h-2 bg-muted rounded-full overflow-hidden border border-border shadow-inner">
                  <motion.div animate={{ width: `${(step / 2) * 100}%` }} className="h-full bg-primary shadow-[0_0_10px_rgba(var(--primary),0.5)]" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-10">
          <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-10">
            <AnimatePresence mode="wait">
              {step === 1 ? (
                <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-12">
                  <div className="space-y-12">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner border border-primary/20">
                        <Layout size={24} />
                      </div>
                      <div>
                        <h2 className="text-2xl font-black tracking-tight text-foreground uppercase">Cấu hình chung</h2>
                        <p className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.25em] mt-1 opacity-60">XÁC ĐỊNH THÔNG TIN CĂN BẢN & BẢO MẬT</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                      <div className="md:col-span-2 space-y-3">
                        <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-2">Tiêu đề bài thi (Bắt buộc)</label>
                        <input
                          {...register('title')}
                          type="text"
                          placeholder="VÍ DỤ: KIỂM TRA GIỮA KỲ MÔN HÓA HỌC 12..."
                          className={cn(
                            "w-full px-8 py-5 rounded-[1.5rem] border bg-background text-base font-black focus:ring-8 focus:ring-primary/5 transition-all shadow-inner",
                            errors.title || validationError ? "border-destructive ring-8 ring-destructive/5" : "border-border"
                          )}
                        />
                      </div>

                      <div className="md:col-span-2 space-y-3">
                        <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-2">Mô tả ngắn gọn</label>
                        <textarea
                          {...register('description')}
                          rows={4}
                          placeholder="Nêu rõ yêu cầu, phạm vi kiến thức hoặc ghi chú cho thí sinh..."
                          className="w-full px-8 py-5 rounded-[1.5rem] border border-border bg-background text-sm font-bold focus:ring-8 focus:ring-primary/5 transition-all resize-none shadow-inner"
                        />
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center justify-between px-2">
                          <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Thời gian giới hạn</label>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" {...register('isTimed')} className="sr-only peer" />
                            <div className="w-14 h-7 bg-muted rounded-full peer peer-checked:bg-[#34C759] transition-all after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-7 shadow-inner" />
                          </label>
                        </div>
                        {watch('isTimed') ? (
                          <div className="flex gap-4">
                            <div className="relative flex-1 group">
                              <Clock className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-all" />
                              <input {...register('durationValue', { valueAsNumber: true })} type="number" className="w-full pl-16 pr-6 py-4 rounded-2xl border border-border bg-background font-black text-sm shadow-inner focus:ring-8 focus:ring-primary/5" />
                            </div>
                            <select {...register('durationUnit')} className="w-32 px-4 py-4 rounded-2xl border border-border bg-background text-[10px] font-black uppercase tracking-widest shadow-inner cursor-pointer focus:border-primary">
                              <option value="MINUTE">PHÚT</option>
                              <option value="HOUR">GIỜ</option>
                            </select>
                          </div>
                        ) : (
                          <div className="px-8 py-5 bg-muted/30 text-[10px] font-black text-muted-foreground uppercase tracking-[0.25em] rounded-2xl border border-dashed border-border italic text-center">Tự do thời gian làm bài</div>
                        )}
                      </div>

                      <div className="space-y-4">
                        <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground px-2">Lịch bắt đầu</label>
                        <div className="relative group">
                          <Calendar className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-all" />
                          <input {...register('startTime')} type="datetime-local" className="w-full pl-16 pr-6 py-4 rounded-2xl border border-border bg-background font-black text-sm shadow-inner focus:ring-8 focus:ring-primary/5" />
                        </div>
                      </div>
                    </div>

                    <div className="pt-10 border-t border-border/50 space-y-10">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-inner border border-primary/20">
                          <ShieldCheck size={20} />
                        </div>
                        <h3 className="text-xl font-black uppercase tracking-tight text-foreground">Bảo mật & Quy tắc</h3>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                          <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-2">Chế độ thi</label>
                          <select {...register('mode')} className="w-full px-8 py-4 rounded-2xl border border-border bg-background font-black text-sm shadow-inner cursor-pointer focus:border-primary">
                            <option value="PRACTICE">LUYỆN TẬP CHUYÊN SÂU</option>
                            <option value="STANDARD">KIỂM TRA TIÊU CHUẨN</option>
                            <option value="THPTQG">PHÒNG THI THPT QUỐC GIA</option>
                          </select>
                        </div>

                        <div className="space-y-3 flex flex-col justify-center">
                          <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-2">Quyền truy cập</label>
                          <label className="relative inline-flex items-center cursor-pointer pl-2 group">
                             <input type="checkbox" {...register('requireLogin')} className="sr-only peer" />
                             <div className="w-14 h-7 bg-muted/80 rounded-full peer peer-checked:bg-[#34C759] transition-all after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-7 border border-border shadow-inner" />
                             <span className="ml-4 text-xs font-bold text-foreground group-hover:text-primary transition-colors uppercase tracking-tight">Dành cho người dùng đăng nhập</span>
                          </label>
                        </div>

                        <div className="md:col-span-2">
                           <div className="bg-muted/30 p-6 rounded-2xl border border-border flex items-center justify-between group shadow-inner">
                              <div className="flex items-center gap-6">
                                 <Zap className="text-primary w-6 h-6 animate-pulse" />
                                 <div>
                                    <p className="font-black uppercase text-xs tracking-tight">Khóa đề thi bảo mật</p>
                                    <p className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.25em] mt-1 opacity-60">YÊU CẦU MẬT KHẨU ĐỂ TRUY CẬP PHÒNG THI</p>
                                 </div>
                              </div>
                              <label className="relative inline-flex items-center cursor-pointer">
                                 <input type="checkbox" {...register('requiresPassword')} className="sr-only peer" />
                                 <div className="w-14 h-7 bg-muted/50 rounded-full peer peer-checked:bg-[#34C759] transition-all after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-7" />
                              </label>
                           </div>
                           
                           {watch('requiresPassword') && (
                             <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="mt-4">
                               <input {...register('password')} type="text" placeholder="NHẬP MẬT KHẨU TRUY CẬP..." className="w-full px-10 py-5 rounded-2xl border-4 border-primary bg-primary/5 font-black text-2xl text-center tracking-[0.5em] shadow-2xl shadow-primary/10" />
                             </motion.div>
                           )}
                        </div>

                        <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                           {[
                             { id: 'strictMode', label: 'CHẾ ĐỘ NGHIÊM NGẶT', desc: 'CHẶN CHUYỂN TAB & COPY' },
                             { id: 'fullscreenRequired', label: 'TOÀN MÀN HÌNH', desc: 'BẮT BUỘC FULLSCREEN' },
                             { id: 'allowScoreView', label: 'XEM ĐIỂM NGAY', desc: 'HIỂN THỊ ĐIỂM SAU NỘP' },
                             { id: 'allowAnswerReview', label: 'XEM ĐÁP ÁN', desc: 'HIỂN THỊ GIẢI THÍCH' }
                           ].map((opt) => (
                             <label key={opt.id} className="flex items-center gap-5 p-6 rounded-2xl border border-border bg-card hover:bg-muted/50 hover:border-primary/20 transition-all cursor-pointer shadow-sm group">
                                <input type="checkbox" {...register(opt.id as any)} className="w-5 h-5 text-primary rounded-lg border-border focus:ring-primary/20" />
                                <div>
                                   <p className="text-xs font-black uppercase tracking-tight group-hover:text-primary transition-colors">{opt.label}</p>
                                   <p className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.25em] mt-1 opacity-50">{opt.desc}</p>
                                </div>
                             </label>
                           ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-10 border-t border-border/50">
                    <button type="button" onClick={nextStep} className="flex items-center gap-3 px-12 py-5 bg-primary text-primary-foreground rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all">
                      TIẾP THEO: SOẠN CÂU HỎI <ArrowRight size={20} />
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.div key="step2" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-10">
                  <div className="flex items-center justify-between p-8 bg-muted/20 rounded-3xl border border-border shadow-inner">
                    <div className="flex items-center gap-5">
                      <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner border border-primary/20">
                        <FileText size={24} />
                      </div>
                      <div>
                        <h2 className="text-2xl font-black tracking-tight text-foreground uppercase">Quản lý kho câu hỏi</h2>
                        <p className="text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground mt-1">TỔNG CỘNG: {fields.length} CÂU HỎI ĐÃ SOẠN</p>
                      </div>
                    </div>
                    <div className="px-8 py-4 bg-card rounded-2xl border border-border flex flex-col items-end shadow-sm">
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-60">DỰ KIẾN TỔNG ĐIỂM</span>
                      <span className="text-2xl font-black text-primary leading-none mt-1">{fields.reduce((acc, f) => acc + (watch(`questions.${fields.indexOf(f)}.points`) || 0), 0)} ĐIỂM</span>
                    </div>
                  </div>

                  {editorMode === 'visual' ? (
                    <div className="grid gap-6">
                      <AnimatePresence mode="popLayout">
                        {fields.map((field, index) => (
                          <motion.div key={field.id} initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="group bg-card rounded-2xl p-6 border border-border hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5 transition-all flex items-center gap-8 shadow-sm">
                            <div className="w-14 h-14 bg-muted rounded-2xl flex items-center justify-center text-xl font-black text-primary shadow-inner group-hover:scale-110 transition-all border border-border/50">
                              {index + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-3 mb-2">
                                <span className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-black uppercase rounded-xl border border-primary/20 tracking-widest">{watch(`questions.${index}.type`)}</span>
                                <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest opacity-60">{watch(`questions.${index}.points`)} ĐIỂM</span>
                              </div>
                              <div className="text-base font-bold text-foreground line-clamp-1 opacity-90">
                                <MarkdownRenderer content={watch(`questions.${index}.content`) || '...'} />
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <button type="button" onClick={() => setEditingIndex(index)} className="p-4 rounded-xl bg-muted text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all shadow-sm"><Edit2 size={18} /></button>
                              <button type="button" onClick={() => remove(index)} className="p-4 rounded-xl bg-muted text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all shadow-sm"><Trash2 size={18} /></button>
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>

                      <button type="button" onClick={() => setEditingIndex(-1)} className="w-full py-16 border-4 border-dashed border-border rounded-[2.5rem] bg-card/30 hover:bg-primary/5 hover:border-primary/30 transition-all flex flex-col items-center justify-center gap-5 group shadow-inner">
                        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all shadow-2xl group-hover:scale-110"><Plus size={32} /></div>
                        <div className="text-center">
                          <p className="text-xs font-black text-muted-foreground uppercase tracking-[0.2em] group-hover:text-primary transition-colors">Thêm câu hỏi mới</p>
                          <p className="text-[10px] font-black text-muted-foreground/50 uppercase tracking-widest mt-1">TRẮC NGHIỆM • ĐÚNG/SAI • TỰ LUẬN</p>
                        </div>
                      </button>
                    </div>
                  ) : (
                    <div className="h-[750px] border-4 border-border rounded-[2.5rem] overflow-hidden shadow-2xl bg-card">
                      <GlobalExamEditor 
                        initialValue={examToMarkdown({
                          title: watch('title'),
                          description: watch('description') || '',
                          mode: watch('mode'),
                          durationValue: watch('durationValue') || 60,
                          durationUnit: watch('durationUnit') || 'MINUTE',
                          maxScore: watch('maxScore'),
                          items: fields.map((_, i) => ({
                            type: watch(`questions.${i}.type`),
                            content: watch(`questions.${i}.content`),
                            choices: watch(`questions.${i}.metadata.choices`),
                            correct_answers: watch(`questions.${i}.metadata.correct_answers`),
                            correct_answer: watch(`questions.${i}.metadata.correct_answer`),
                            statements: watch(`questions.${i}.metadata.statements`),
                          }))
                        })}
                        onChange={handleGlobalChange}
                        isSaving={isLoading}
                      />
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-10 border-t border-border/50">
                    <button type="button" onClick={prevStep} className="flex items-center gap-3 px-10 py-4 bg-card border border-border text-foreground rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-muted transition-all shadow-sm"><ArrowLeft size={18} /> QUAY LẠI THIẾT LẬP</button>
                    <button type="submit" disabled={isLoading} className="flex items-center gap-4 px-12 py-5 bg-primary text-primary-foreground rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all disabled:opacity-50">
                      {isLoading ? <Loader2 size={24} className="animate-spin" /> : <><Save size={24} /> LƯU & XUẤT BẢN ĐỀ THI</>}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </form>
        </div>
      </div>

      {/* Editor Modal Overlay - Scaled Down */}
      <AnimatePresence>
        {editingIndex !== null && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-background/60 backdrop-blur-md p-6 flex items-center justify-center">
            <motion.div initial={{ scale: 0.98, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.98, y: 10 }} className="w-full h-full max-w-6xl rounded-2xl bg-background border border-border shadow-2xl overflow-hidden flex flex-col relative">
              <div className="px-8 py-5 bg-card border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-primary/10 text-primary rounded-lg flex items-center justify-center"><Edit2 size={20} /></div>
                  <div>
                    <h3 className="text-lg font-black uppercase tracking-tight text-foreground">{editingIndex === -1 ? 'THÊM MỚI' : `CÂU HỎI ${editingIndex + 1}`}</h3>
                    <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest mt-0.5">SOẠN THẢO NỘI DUNG & ĐÁP ÁN</p>
                  </div>
                </div>
                <button type="button" onClick={() => setEditingIndex(null)} className="p-3 bg-muted hover:bg-destructive hover:text-white rounded-lg transition-all"><Plus className="w-5 h-5 rotate-45" /></button>
              </div>
              <div className="flex-1 overflow-hidden p-6">
                <QuestionEditor 
                  initialValue={editingIndex !== -1 && editingIndex !== null ? `${watch(`questions.${editingIndex}.content`)}\n\n${(watch(`questions.${editingIndex}.metadata.choices`) || []).map((c: any) => `${watch(`questions.${editingIndex}.metadata.correct_answers`)?.includes(c.id) ? '*' : ''}${c.id}. ${c.content}`).join('\n')}` : ''}
                  onChange={(parsedQuestion) => {
                    const currentPoints = editingIndex !== -1 && editingIndex !== null ? watch(`questions.${editingIndex}.points`) : 1;
                    const newQuestion = { type: parsedQuestion.type, content: parsedQuestion.content, points: currentPoints, metadata: { choices: parsedQuestion.choices, correct_answers: parsedQuestion.correct_answers, correct_answer: parsedQuestion.correct_answer, statements: parsedQuestion.statements, explanation: '' } } as any;
                    if (editingIndex === -1) { /* Finalize on close or add buffer */ } else if (editingIndex !== null) { setValue(`questions.${editingIndex}`, newQuestion); }
                  }}
                />
              </div>
              <div className="p-4 bg-muted/30 border-t border-border flex justify-end">
                <button type="button" onClick={() => setEditingIndex(null)} className="px-6 py-3 bg-primary text-primary-foreground rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-105 transition-all">HOÀN TẤT</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
