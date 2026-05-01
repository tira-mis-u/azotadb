'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import axios from 'axios';
import {
  Plus, Trash2, Save, ArrowLeft, ArrowRight,
  Clock, Calendar, FileText, Layout, CheckCircle2,
  GripVertical, Loader2
} from 'lucide-react';
import Link from 'next/link';

const questionSchema = z.object({
  type: z.enum(['MULTIPLE_CHOICE', 'ESSAY']),
  content: z.string().min(1, 'Nội dung câu hỏi không được để trống'),
  points: z.number().min(0),
  metadata: z.object({
    choices: z.array(z.object({
      id: z.string(),
      content: z.string().min(1, 'Nội dung lựa chọn không được để trống'),
    })).optional(),
    correct_answers: z.array(z.string()).min(1, 'Phải chọn ít nhất một đáp án đúng'),
    explanation: z.string().optional(),
  }),
});

const examSchema = z.object({
  title: z.string().min(1, 'Tiêu đề không được để trống'),
  description: z.string().optional(),
  duration: z.number().min(1, 'Thời gian làm bài ít nhất 1 phút'),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  questions: z.array(questionSchema),
});

type ExamForm = z.infer<typeof examSchema>;

export default function EditExamPage() {
  const { id: examId } = useParams();
  const { session } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  const { register, control, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm<ExamForm>({
    resolver: zodResolver(examSchema),
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'questions',
  });

  useEffect(() => {
    const fetchExam = async () => {
      if (!session?.access_token) return;
      try {
        const res = await axios.get(`/api/exams/${examId}`, {
          headers: { Authorization: `Bearer ${session.access_token}` }
        });
        const exam = res.data;
        
        reset({
          title: exam.title,
          description: exam.description || '',
          duration: exam.duration,
          startTime: exam.startTime ? new Date(exam.startTime).toISOString().slice(0, 16) : '',
          endTime: exam.endTime ? new Date(exam.endTime).toISOString().slice(0, 16) : '',
          questions: exam.questions.map((q: any) => ({
            type: q.type,
            content: q.content,
            points: q.points,
            metadata: q.metadata,
          })),
        });
      } catch (err) {
        console.error('Failed to fetch exam:', err);
        alert('Không thể tải thông tin đề thi.');
        router.push('/teacher/exams');
      } finally {
        setIsFetching(false);
      }
    };

    fetchExam();
  }, [examId, session, reset, router]);

  const onSubmit = async (data: ExamForm) => {
    if (!session?.access_token) return;
    setIsLoading(true);
    try {
      // 1. Update Exam
      await axios.patch(`/api/exams/${examId}`, {
        title: data.title,
        description: data.description,
        duration: data.duration,
        startTime: data.startTime ? new Date(data.startTime).toISOString() : null,
        endTime: data.endTime ? new Date(data.endTime).toISOString() : null,
      }, {
        headers: { Authorization: `Bearer ${session.access_token}` }
      });

      // 2. Replace Questions
      await axios.post(`/api/exams/${examId}/questions`, data.questions, {
        headers: { Authorization: `Bearer ${session.access_token}` }
      });

      router.push('/teacher/exams');
    } catch (err) {
      console.error('Failed to update exam:', err);
      alert('Có lỗi xảy ra khi cập nhật đề thi.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
        <p className="text-gray-500 font-medium">Đang tải thông tin đề thi...</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link
            href="/teacher/exams"
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl text-gray-500 transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Chỉnh sửa đề thi</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Cập nhật nội dung và bộ câu hỏi.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-medium text-gray-400">BƯỚC {step}/2</span>
          <div className="w-32 h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
            <motion.div
              initial={false}
              animate={{ width: `${(step / 2) * 100}%` }}
              className="h-full bg-indigo-600"
            />
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-gray-800 space-y-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center">
                    <Layout className="w-4 h-4 text-indigo-600" />
                  </div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">Thông tin cơ bản</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tiêu đề đề thi</label>
                    <input
                      {...register('title')}
                      type="text"
                      className="w-full px-4 py-3 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    />
                    {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Mô tả (không bắt buộc)</label>
                    <textarea
                      {...register('description')}
                      rows={3}
                      className="w-full px-4 py-3 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Thời gian làm bài (phút)</label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        {...register('duration', { valueAsNumber: true })}
                        type="number"
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Thời gian bắt đầu</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        {...register('startTime')}
                        type="datetime-local"
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm transition-all shadow-lg shadow-indigo-500/25"
                >
                  Tiếp theo: Soạn câu hỏi <ArrowRight className="w-4 h-4" />
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
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center">
                    <FileText className="w-4 h-4 text-emerald-600" />
                  </div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">Danh sách câu hỏi</h2>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-400 bg-gray-50 dark:bg-gray-800/50 px-3 py-2 rounded-xl border border-gray-100 dark:border-gray-800">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Tổng điểm: <span className="font-bold text-indigo-600">{fields.reduce((acc, f) => acc + (watch(`questions.${fields.indexOf(f)}.points`) || 0), 0)}</span>
                </div>
              </div>

              <div className="space-y-6">
                {fields.map((field, index) => (
                  <motion.div
                    key={field.id}
                    layout
                    className="bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 relative group"
                  >
                    <div className="absolute -left-3 top-8 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab">
                      <GripVertical className="w-5 h-5 text-gray-300" />
                    </div>

                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-xs font-bold text-gray-500">
                          {index + 1}
                        </div>
                        <select
                          {...register(`questions.${index}.type`)}
                          className="bg-gray-50 dark:bg-gray-800 border-none rounded-lg px-3 py-1.5 text-xs font-semibold focus:ring-2 focus:ring-indigo-500 outline-none"
                        >
                          <option value="MULTIPLE_CHOICE">Trắc nghiệm</option>
                          <option value="ESSAY">Tự luận</option>
                        </select>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-400">Điểm:</span>
                          <input
                            {...register(`questions.${index}.points`, { valueAsNumber: true })}
                            type="number"
                            step="0.5"
                            className="w-16 px-2 py-1 rounded-lg border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50 text-xs text-center focus:ring-1 focus:ring-indigo-500 outline-none"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => remove(index)}
                          className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <textarea
                        {...register(`questions.${index}.content`)}
                        placeholder="Nhập nội dung câu hỏi..."
                        rows={2}
                        className="w-full px-4 py-3 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all resize-none"
                      />

                      {watch(`questions.${index}.type`) === 'MULTIPLE_CHOICE' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-4 border-l-2 border-indigo-50 dark:border-indigo-900/30">
                          {watch(`questions.${index}.metadata.choices`)?.map((choice: any, cIdx: number) => (
                            <div key={cIdx} className="flex items-center gap-3 group/choice">
                              <button
                                type="button"
                                onClick={() => {
                                  const current = watch(`questions.${index}.metadata.correct_answers`) || [];
                                  if (current.includes(choice.id)) {
                                    setValue(`questions.${index}.metadata.correct_answers`, current.filter(id => id !== choice.id));
                                  } else {
                                    setValue(`questions.${index}.metadata.correct_answers`, [...current, choice.id]);
                                  }
                                }}
                                className={`w-6 h-6 rounded-lg flex items-center justify-center border transition-all text-[10px] font-bold ${
                                  watch(`questions.${index}.metadata.correct_answers`)?.includes(choice.id)
                                    ? 'bg-emerald-500 border-emerald-500 text-white'
                                    : 'border-gray-200 dark:border-gray-700 text-gray-400 group-hover/choice:border-indigo-300'
                                }`}
                              >
                                {choice.id}
                              </button>
                              <input
                                {...register(`questions.${index}.metadata.choices.${cIdx}.content`)}
                                className="flex-1 bg-transparent border-b border-transparent focus:border-indigo-200 dark:focus:border-indigo-800 text-sm py-1 outline-none transition-all"
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>

              <button
                type="button"
                onClick={() => append({
                  type: 'MULTIPLE_CHOICE',
                  content: '',
                  points: 1,
                  metadata: {
                    choices: [
                      { id: 'A', content: '' },
                      { id: 'B', content: '' },
                      { id: 'C', content: '' },
                      { id: 'D', content: '' },
                    ],
                    correct_answers: ['A'],
                    explanation: '',
                  },
                })}
                className="w-full py-4 border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-3xl text-gray-400 hover:text-indigo-600 hover:border-indigo-100 transition-all flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" /> Thêm câu hỏi mới
              </button>

              <div className="flex items-center justify-between pt-6">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 font-semibold text-sm hover:bg-gray-200 transition-all"
                >
                  <ArrowLeft className="w-4 h-4" /> Quay lại
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex items-center gap-2 px-8 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm transition-all shadow-lg shadow-indigo-500/25 disabled:opacity-60"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Cập nhật đề thi <Save className="w-4 h-4" /></>}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </form>
    </div>
  );
}
