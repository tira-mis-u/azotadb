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
import { PageHeader } from '@/components/ui/page-header';
import { cn } from '@/lib/utils';

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
        mode: 'STANDARD',
        strictMode: false,
        fullscreenRequired: false,
        maxAttempts: 0,
        allowScoreView: true,
        allowAnswerReview: true,
        maxScore: 10.0,
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
    <div className="p-8 max-w-5xl mx-auto space-y-10 animate-in fade-in duration-500">
      <PageHeader 
        title="Upload & OCR AI" 
        description="Tự động chuyển đổi file PDF, Hình ảnh, Word thành đề thi trực tuyến bằng trí tuệ nhân tạo."
        backHref="/dashboard"
        breadcrumbs={[
          { label: 'Công cụ giáo viên', href: '#' },
          { label: 'Upload & OCR AI' }
        ]}
      />

      <AnimatePresence mode="wait">
        {status === 'IDLE' || status === 'UPLOADING' || status === 'PROCESSING' || status === 'ERROR' ? (
          <motion.div
            key="upload-zone"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-card border border-border rounded-[3rem] p-16 shadow-2xl shadow-primary/5 flex flex-col items-center text-center space-y-8"
          >
            <div className={cn(
              "w-24 h-24 rounded-[2rem] flex items-center justify-center transition-all duration-500 shadow-inner",
              status === 'UPLOADING' || status === 'PROCESSING'
                ? 'bg-primary text-primary-foreground animate-pulse'
                : 'bg-muted text-primary'
            )}>
              {status === 'UPLOADING' || status === 'PROCESSING' ? (
                <Loader2 className="w-12 h-12 animate-spin" />
              ) : (
                <Upload className="w-12 h-12" />
              )}
            </div>

            <div className="space-y-3">
              <h2 className="text-2xl font-black text-foreground uppercase tracking-tight">Tải file đề thi của bạn</h2>
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] max-w-xs mx-auto opacity-70">
                HỖ TRỢ PDF, DOCX, JPG, PNG. AI SẼ TỰ ĐỘNG NHẬN DIỆN CÂU HỎI & ĐÁP ÁN.
              </p>
            </div>

            {status === 'IDLE' && (
              <div className="w-full max-w-md space-y-6">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  accept=".pdf,.docx,.jpg,.jpeg,.png,.txt"
                />
                
                {file ? (
                  <div className="space-y-4 animate-in zoom-in-95">
                    <div className="w-full p-6 rounded-2xl bg-muted/50 flex items-center gap-4 border border-border shadow-inner">
                      <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                        <FileText className="w-6 h-6" />
                      </div>
                      <div className="flex-1 text-left min-w-0">
                        <p className="text-sm font-black text-foreground truncate uppercase tracking-tight">{file.name}</p>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                      <button onClick={() => setFile(null)} className="p-2 hover:bg-destructive/10 hover:text-destructive rounded-lg text-muted-foreground transition-all">
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                    <button
                      onClick={handleUpload}
                      className="w-full py-5 rounded-2xl bg-primary text-primary-foreground font-black text-xs uppercase tracking-[0.2em] transition-all shadow-2xl shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3"
                    >
                      BẮT ĐẦU PHÂN TÍCH AI <Zap className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-12 rounded-[2rem] border-2 border-dashed border-border hover:border-primary/40 hover:bg-primary/5 text-muted-foreground hover:text-primary transition-all flex flex-col items-center gap-4 group"
                  >
                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center group-hover:scale-110 transition-transform"><PlusCircle className="w-6 h-6" /></div>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">Chọn file từ máy tính của bạn</span>
                  </button>
                )}
              </div>
            )}

            {(status === 'UPLOADING' || status === 'PROCESSING') && (
              <div className="w-full max-w-sm space-y-6">
                <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden border border-border">
                  <motion.div
                    className="h-full bg-primary"
                    animate={{ x: ['-100%', '100%'] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                  />
                </div>
                <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] animate-pulse">
                  {status === 'UPLOADING' ? 'ĐANG TẢI DỮ LIỆU...' : 'HỆ THỐNG AI ĐANG XỬ LÝ...'}
                </p>
              </div>
            )}

            {status === 'ERROR' && (
              <div className="w-full max-w-md p-6 rounded-2xl bg-destructive/10 text-destructive border border-destructive/20 flex flex-col items-center gap-4 animate-in shake-1">
                <AlertCircle className="w-8 h-8" />
                <p className="text-[10px] font-black uppercase tracking-widest text-center">{error}</p>
                <button onClick={() => setStatus('IDLE')} className="px-6 py-2 bg-destructive text-destructive-foreground rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-destructive/20">THỬ LẠI</button>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="success-preview"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-10"
          >
            <div className="bg-success/10 border border-success/20 rounded-[2.5rem] p-10 flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl shadow-success/5">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-success border border-success/30 shadow-lg">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-foreground uppercase tracking-tight leading-none">Phân tích hoàn tất</h2>
                  <p className="text-[10px] font-black text-success uppercase tracking-[0.2em] mt-3 opacity-80">AI ĐÃ TRÍCH XUẤT THÀNH CÔNG {parsedData?.questions?.length || 0} CÂU HỎI.</p>
                </div>
              </div>
              <button
                onClick={handleSaveExam}
                className="w-full md:w-auto px-8 py-4 rounded-2xl bg-success text-white font-black text-xs uppercase tracking-widest transition-all shadow-2xl shadow-success/30 hover:scale-105 active:scale-95 flex items-center justify-center gap-3"
              >
                TẠO ĐỀ THI NGAY <ArrowRight className="w-5 h-5" />
              </button>
            </div>

            {/* Preview Questions */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 px-2">
                 <div className="w-1 h-4 bg-primary rounded-full" />
                 <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em]">XEM TRƯỚC KẾT QUẢ TRÍCH XUẤT</h3>
              </div>
              
              <div className="grid gap-6">
                {parsedData?.questions?.map((q: any, i: number) => (
                  <motion.div 
                    key={i} 
                    initial={{ opacity: 0, y: 10 }} 
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-card rounded-[2rem] p-8 border border-border shadow-xl shadow-primary/5 hover:border-primary/20 transition-all group"
                  >
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <span className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-xs font-black shadow-inner">
                          {i + 1}
                        </span>
                        <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest border border-border px-3 py-1 rounded-lg">
                          {q.type}
                        </span>
                      </div>
                    </div>
                    
                    <p className="text-base font-bold text-foreground leading-relaxed mb-8">{q.content}</p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {q.metadata?.choices?.map((c: any) => {
                        const isCorrect = q.metadata.correct_answers.includes(c.id);
                        return (
                          <div key={c.id} className={cn(
                            "p-4 rounded-xl border text-xs font-bold transition-all flex items-center gap-4",
                            isCorrect
                              ? "bg-success/5 border-success/30 text-success shadow-lg shadow-success/5"
                              : "bg-muted/30 border-border text-muted-foreground opacity-60"
                          )}>
                            <span className={cn(
                              "w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black shadow-sm",
                              isCorrect ? "bg-success text-white" : "bg-muted text-muted-foreground"
                            )}>{c.id}</span>
                            {c.content}
                            {isCorrect && <CheckCircle2 className="w-4 h-4 ml-auto" />}
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Helper icon not imported before
const PlusCircle = ({ className, size = 24 }: any) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"/><path d="M8 12h8"/><path d="M12 8v8"/></svg>
);
