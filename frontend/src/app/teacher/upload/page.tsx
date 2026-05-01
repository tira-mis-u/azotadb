'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { createClient } from '@/lib/supabase/client';
import axios from 'axios';
import {
  Upload, FileText, CheckCircle2, AlertCircle,
  Loader2, ArrowRight, Zap, Edit2, Save, X
} from 'lucide-react';
import Link from 'next/link';

export default function UploadPage() {
  const { session } = useAuth();
  const supabase = createClient();
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<'IDLE' | 'UPLOADING' | 'PROCESSING' | 'DONE' | 'ERROR'>('IDLE');
  const [progress, setProgress] = useState(0);
  const [parsedData, setParsedData] = useState<any>(null);
  const [error, setError] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file || !session?.access_token) return;
    
    setStatus('UPLOADING');
    setError('');
    
    try {
      // 1. Upload to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `uploads/${session.user.id}/${fileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('exams')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('exams')
        .getPublicUrl(filePath);

      // 2. Create UploadedFile record in Backend
      const fileRes = await axios.post('/api/parser/upload', {
        fileUrl: publicUrl
      }, {
        headers: { Authorization: `Bearer ${session.access_token}` }
      });

      const fileId = fileRes.data.id;

      // 3. Start Processing
      setStatus('PROCESSING');
      const processRes = await axios.post(`/api/parser/process/${fileId}`, {}, {
        headers: { Authorization: `Bearer ${session.access_token}` }
      });

      setParsedData(processRes.data);
      setStatus('DONE');
    } catch (err: any) {
      console.error('OCR/AI Flow failed:', err);
      setError(err?.message || 'Có lỗi xảy ra trong quá trình xử lý file.');
      setStatus('ERROR');
    }
  };

  const handleSaveExam = async () => {
    if (!parsedData || !session?.access_token) return;
    try {
      // Create a draft exam from parsed data
      const examRes = await axios.post('/api/exams', {
        title: `Đề thi từ file: ${file?.name || 'Chưa đặt tên'}`,
        duration: 60,
      }, {
        headers: { Authorization: `Bearer ${session.access_token}` }
      });

      await axios.post(`/api/exams/${examRes.data.id}/questions`, parsedData.questions, {
        headers: { Authorization: `Bearer ${session.access_token}` }
      });

      router.push(`/teacher/exams/${examRes.data.id}/edit`);
    } catch (err) {
      alert('Lưu đề thi thất bại.');
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Upload & OCR AI</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Tự động chuyển đổi file PDF, Hình ảnh, Word thành đề thi trực tuyến.</p>
      </div>

      <AnimatePresence mode="wait">
        {status === 'IDLE' || status === 'UPLOADING' || status === 'PROCESSING' || status === 'ERROR' ? (
          <motion.div
            key="upload-zone"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-white dark:bg-gray-900 rounded-[2.5rem] p-12 border-2 border-dashed border-gray-100 dark:border-gray-800 shadow-sm flex flex-col items-center text-center"
          >
            <div className={`w-20 h-20 rounded-3xl mb-6 flex items-center justify-center transition-all ${
              status === 'UPLOADING' || status === 'PROCESSING'
                ? 'bg-indigo-600 text-white animate-pulse'
                : 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400'
            }`}>
              {status === 'UPLOADING' || status === 'PROCESSING' ? (
                <Loader2 className="w-10 h-10 animate-spin" />
              ) : (
                <Upload className="w-10 h-10" />
              )}
            </div>

            {status === 'IDLE' ? (
              <>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Tải file đề thi của bạn lên</h2>
                <p className="text-sm text-gray-500 mb-8 max-w-xs">Hỗ trợ định dạng PDF, DOCX, JPG, PNG. AI sẽ tự động nhận diện câu hỏi và đáp án.</p>
                
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  accept=".pdf,.docx,.jpg,.jpeg,.png,.txt"
                />
                
                {file ? (
                  <div className="flex flex-col items-center gap-4 w-full max-w-sm">
                    <div className="w-full p-4 rounded-2xl bg-gray-50 dark:bg-gray-800 flex items-center gap-3 border border-gray-100 dark:border-gray-700">
                      <FileText className="w-6 h-6 text-indigo-500" />
                      <div className="flex-1 text-left">
                        <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{file.name}</p>
                        <p className="text-[10px] text-gray-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                      <button onClick={() => setFile(null)} className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg text-gray-400">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <button
                      onClick={handleUpload}
                      className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm transition-all shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2"
                    >
                      Bắt đầu xử lý AI <Zap className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-8 py-3.5 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 font-bold text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-all shadow-sm"
                  >
                    Chọn file từ máy tính
                  </button>
                )}
              </>
            ) : (
              <div className="w-full max-w-sm space-y-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {status === 'UPLOADING' ? 'Đang tải file lên...' : 'AI đang phân tích đề thi...'}
                </h2>
                <p className="text-sm text-gray-500">Quá trình này có thể mất 10-30 giây tuỳ vào độ dài của đề.</p>
                <div className="w-full h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-indigo-600"
                    animate={{ x: ['-100%', '100%'] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                  />
                </div>
              </div>
            )}

            {status === 'ERROR' && (
              <div className="mt-6 flex items-center gap-2 p-3 rounded-xl bg-red-50 text-red-600 text-sm border border-red-100">
                <AlertCircle className="w-4 h-4" /> {error}
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="success-preview"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6"
          >
            <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 rounded-3xl p-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white dark:bg-gray-900 flex items-center justify-center text-emerald-500 shadow-sm">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">Xử lý thành công!</h2>
                  <p className="text-sm text-emerald-700 dark:text-emerald-400">AI đã tìm thấy {parsedData?.questions?.length || 0} câu hỏi từ file của bạn.</p>
                </div>
              </div>
              <button
                onClick={handleSaveExam}
                className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm transition-all shadow-lg shadow-emerald-500/25 flex items-center gap-2"
              >
                Tạo đề thi & Chỉnh sửa <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Preview Questions */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest px-2">Xem trước kết quả</h3>
              {parsedData?.questions?.map((q: any, i: number) => (
                <div key={i} className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded-lg">Câu {i + 1}</span>
                    <span className="text-[10px] text-gray-400 uppercase font-bold">{q.type}</span>
                  </div>
                  <p className="text-sm text-gray-800 dark:text-gray-200 mb-4">{q.content}</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {q.metadata?.choices?.map((c: any) => (
                      <div key={c.id} className={`p-2.5 rounded-xl border text-xs flex items-center gap-2 ${
                        q.metadata.correct_answers.includes(c.id)
                          ? 'bg-emerald-50 border-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-400'
                          : 'bg-gray-50/50 border-transparent text-gray-500'
                      }`}>
                        <span className="font-bold">{c.id}.</span> {c.content}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
