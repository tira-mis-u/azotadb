import React, { useState } from 'react';
import { QuestionData, QuestionRenderer } from './question-renderer';
import { Flag, ChevronLeft, ChevronRight, Clock, AlertTriangle, User, Hash, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Exam {
  id: string;
  title: string;
  duration: number | null;
  isTimed: boolean;
  mode: 'STANDARD' | 'THPTQG';
  subject?: string;
  examCode?: string;
}

interface THPTQGExamLayoutProps {
  exam: Exam;
  questions: QuestionData[];
  answers: Record<string, any>;
  onAnswer: (questionId: string, answer: any) => void;
  timeLeft: number; // in seconds
  onSubmit: (data?: { candidateNumber: string; examCode: string }) => void;
  violations?: any[];
  reviewMode?: boolean;
}

function BubbleDigitSelector({ 
  label, 
  digits, 
  value, 
  onChange,
  disabled = false 
}: { 
  label: string; 
  digits: number; 
  value: string; 
  onChange: (val: string) => void;
  disabled?: boolean;
}) {
  const digitsArray = Array.from({ length: digits }, (_, i) => value[i] || '');

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 mb-1">
        <span style={{ color: 'var(--muted-foreground)' }} className="text-[10px] font-bold uppercase tracking-widest">{label}</span>
      </div>
      <div className="flex gap-1.5">
        {digitsArray.map((digit, idx) => (
          <div key={idx} className="flex flex-col gap-1 items-center">
             <div 
               style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', color: 'var(--primary)' }}
               className="w-6 h-8 rounded border flex items-center justify-center text-xs font-bold"
             >
               {digit}
             </div>
             <div className="flex flex-col gap-0.5">
               {[0,1,2,3,4,5,6,7,8,9].map(num => (
                 <button
                   key={num}
                   disabled={disabled}
                   onClick={() => {
                     const newVal = digitsArray.map((d, i) => i === idx ? num.toString() : d || '0').join('');
                     onChange(newVal);
                   }}
                   style={{
                     backgroundColor: digit === num.toString() ? 'var(--primary)' : 'var(--card)',
                     borderColor: digit === num.toString() ? 'var(--primary)' : 'var(--border)',
                     color: digit === num.toString() ? 'var(--primary-foreground)' : 'var(--muted-foreground)'
                   }}
                   className="w-4 h-4 rounded-full border flex items-center justify-center text-[8px] transition-all hover:border-indigo-400"
                 >
                   {num}
                 </button>
               ))}
             </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function THPTQGExamLayout({
  exam,
  questions,
  answers,
  onAnswer,
  timeLeft,
  onSubmit,
  violations = [],
  reviewMode = false
}: THPTQGExamLayoutProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flagged, setFlagged] = useState<Record<string, boolean>>({});
  const [candidateNumber, setCandidateNumber] = useState('000000');
  const [studentExamCode, setStudentExamCode] = useState('000');

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const currentQuestion = questions[currentIndex];
  
  const handleToggleFlag = () => {
    if (!currentQuestion) return;
    setFlagged(prev => ({
      ...prev,
      [currentQuestion.id]: !prev[currentQuestion.id]
    }));
  };

  const getQuestionStatus = (q: QuestionData) => {
    if (flagged[q.id]) return 'flagged';
    if (answers[q.id] !== undefined) return 'answered';
    return 'unanswered';
  };

  return (
    <div style={{ backgroundColor: 'var(--background)', color: 'var(--foreground)' }} className="flex flex-col h-screen font-sans">
      {/* Top Header */}
      <header 
        style={{ backgroundColor: 'var(--card)', borderBottom: '1px solid var(--border)' }}
        className="shrink-0 px-6 py-2.5 flex items-center justify-between shadow-sm z-10"
      >
        <div className="flex items-center gap-6">
          <div style={{ borderRight: '1px solid var(--border)' }} className="hidden sm:block pr-6">
             <div className="flex items-center gap-2 mb-0.5">
               <FileText style={{ color: 'var(--primary)' }} className="w-4 h-4" />
               <h1 style={{ color: 'var(--foreground)' }} className="font-black text-sm uppercase tracking-tighter">
                 KỲ THI THPT QUỐC GIA
               </h1>
             </div>
             <p style={{ color: 'var(--muted-foreground)' }} className="text-[10px] font-bold uppercase tracking-widest">{exam.title}</p>
          </div>
          
          <div className="flex items-center gap-8">
             <div className="flex items-center gap-3">
                <div style={{ backgroundColor: 'var(--muted)' }} className="w-8 h-8 rounded-full flex items-center justify-center">
                  <User style={{ color: 'var(--muted-foreground)' }} className="w-4 h-4" />
                </div>
                <div>
                   <p style={{ color: 'var(--muted-foreground)' }} className="text-[10px] font-bold uppercase tracking-widest">Thí sinh</p>
                   <p style={{ color: 'var(--foreground)' }} className="text-xs font-black uppercase">SBD: {candidateNumber}</p>
                </div>
             </div>
             <div className="flex items-center gap-3">
                <div style={{ backgroundColor: 'var(--muted)' }} className="w-8 h-8 rounded-full flex items-center justify-center">
                  <Hash style={{ color: 'var(--muted-foreground)' }} className="w-4 h-4" />
                </div>
                <div>
                   <p style={{ color: 'var(--muted-foreground)' }} className="text-[10px] font-bold uppercase tracking-widest">Mã đề</p>
                   <p style={{ color: 'var(--foreground)' }} className="text-xs font-black">{studentExamCode}</p>
                </div>
             </div>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {violations.length > 0 && (
            <div className="flex items-center gap-2 text-red-600 bg-red-50 dark:bg-red-900/20 px-3 py-1.5 rounded-xl border border-red-200 dark:border-red-800/50">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-xs font-black uppercase">{violations.length} Cảnh báo</span>
            </div>
          )}

          {exam.isTimed && !reviewMode && (
            <div 
              style={{ backgroundColor: 'var(--muted)', borderColor: 'var(--border)' }}
              className="flex items-center gap-3 px-4 py-2 rounded-2xl border shadow-inner"
            >
              <Clock className={`w-4 h-4 ${timeLeft < 300 ? 'text-red-500 animate-pulse' : 'text-gray-400'}`} />
              <span 
                style={{ color: timeLeft < 300 ? '#ef4444' : 'var(--foreground)' }}
                className={`font-mono text-xl font-black tracking-tighter`}
              >
                {formatTime(timeLeft)}
              </span>
            </div>
          )}
          
          {!reviewMode && (
            <button 
              onClick={() => {
                if (window.confirm('Bạn có chắc chắn muốn nộp bài?')) {
                  onSubmit({ candidateNumber, examCode: studentExamCode });
                }
              }}
              style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}
              className="font-black py-2.5 px-6 rounded-2xl shadow-lg shadow-indigo-500/25 transition-all uppercase text-xs tracking-widest hover:scale-105"
            >
              Nộp bài
            </button>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Panel: Question Content */}
        <div style={{ backgroundColor: 'var(--background)' }} className="flex-1 overflow-y-auto p-6 md:p-10">
          <div className="max-w-4xl mx-auto">
            <AnimatePresence mode="wait">
              {currentQuestion ? (
                <motion.div 
                  key={currentQuestion.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-8"
                >
                  <div style={{ borderColor: 'var(--border)' }} className="flex items-center justify-between pb-4 border-b">
                    <div style={{ color: 'var(--muted-foreground)' }} className="text-[10px] font-black uppercase tracking-[0.2em]">
                      Môn: {exam.subject || 'Tổng hợp'} • Phần {currentIndex < questions.length / 2 ? 'I' : 'II'}
                    </div>
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={handleToggleFlag}
                        style={{
                          backgroundColor: flagged[currentQuestion.id] ? 'rgba(249, 115, 22, 0.1)' : 'var(--card)',
                          borderColor: flagged[currentQuestion.id] ? '#f97316' : 'var(--border)',
                          color: flagged[currentQuestion.id] ? '#f97316' : 'var(--muted-foreground)'
                        }}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all hover:brightness-110 shadow-sm`}
                      >
                        <Flag className={`w-3.5 h-3.5 ${flagged[currentQuestion.id] ? 'fill-current' : ''}`} />
                        Xem lại sau
                      </button>
                    </div>
                  </div>
                  
                  <QuestionRenderer 
                    question={currentQuestion} 
                    index={currentIndex + 1} 
                    mode="THPTQG"
                    userAnswer={answers[currentQuestion.id]}
                    onAnswerChange={(ans) => !reviewMode && onAnswer(currentQuestion.id, ans)}
                    showCorrectAnswer={reviewMode} 
                  />
                </motion.div>
              ) : (
                <div style={{ color: 'var(--muted-foreground)' }} className="flex flex-col items-center justify-center py-20 gap-4">
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }}>
                    <Clock className="w-8 h-8 opacity-20" />
                  </motion.div>
                  <p className="text-xs font-bold uppercase tracking-widest">Đang tải dữ liệu...</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Right Panel: Sidebar (Bubble Sheet & Info) */}
        <aside 
          style={{ backgroundColor: 'var(--card)', borderLeft: '1px solid var(--border)' }}
          className="w-80 shrink-0 flex flex-col shadow-2xl"
        >
          <div style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'var(--card)' }} className="p-5 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <BubbleDigitSelector 
                label="Số báo danh" 
                digits={6} 
                value={candidateNumber} 
                onChange={setCandidateNumber}
                disabled={reviewMode}
              />
              <BubbleDigitSelector 
                label="Mã đề" 
                digits={3} 
                value={studentExamCode} 
                onChange={setStudentExamCode}
                disabled={reviewMode}
              />
            </div>
            
            <div style={{ color: 'var(--muted-foreground)' }} className="flex justify-center gap-4 text-[10px] font-black uppercase tracking-wider">
              <div className="flex items-center gap-1.5"><div style={{ backgroundColor: 'var(--primary)' }} className="w-2.5 h-2.5 rounded-full"></div> Làm</div>
              <div className="flex items-center gap-1.5"><div style={{ backgroundColor: '#fb923c' }} className="w-2.5 h-2.5 rounded-full"></div> Đánh dấu</div>
              <div className="flex items-center gap-1.5"><div style={{ borderColor: 'var(--border)' }} className="w-2.5 h-2.5 rounded-full border"></div> Trống</div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-5">
            <div className="grid grid-cols-5 gap-2.5">
              {questions.map((q, idx) => {
                const status = getQuestionStatus(q);
                const isCurrent = idx === currentIndex;
                
                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentIndex(idx)}
                    style={{
                      backgroundColor: status === 'answered' ? 'var(--primary)' : status === 'flagged' ? 'rgba(249, 115, 22, 0.1)' : 'var(--card)',
                      borderColor: isCurrent ? 'var(--primary)' : (status === 'flagged' ? '#f97316' : 'var(--border)'),
                      color: status === 'answered' ? 'var(--primary-foreground)' : (status === 'flagged' ? '#f97316' : 'var(--muted-foreground)'),
                      boxShadow: isCurrent ? '0 0 10px var(--primary)' : 'none'
                    }}
                    className={`relative w-full aspect-square rounded-full flex items-center justify-center text-xs font-black transition-all border-2
                      ${isCurrent ? 'scale-110 z-10' : 'hover:scale-105'}
                    `}
                  >
                    {idx + 1}
                    {status === 'answered' && (
                      <span 
                        style={{ backgroundColor: 'var(--card)', color: 'var(--primary)', borderColor: 'var(--border)' }}
                        className="absolute -bottom-1 -right-1 text-[8px] w-4 h-4 rounded-full flex items-center justify-center border shadow-sm font-black"
                      >
                        {q.type === 'MULTIPLE_CHOICE' ? (
                          q.metadata?.choices?.findIndex((c: any) => c.id === answers[q.id]) > -1 
                            ? String.fromCharCode(65 + q.metadata.choices.findIndex((c: any) => c.id === answers[q.id])) 
                            : '?'
                        ) : q.type === 'TRUE_FALSE' ? (
                          answers[q.id] === true ? 'Đ' : 'S'
                        ) : '...'}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
          
          <div style={{ backgroundColor: 'var(--card)', borderTop: '1px solid var(--border)' }} className="p-4 flex justify-between gap-3">
            <button 
              onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
              disabled={currentIndex === 0}
              style={{ backgroundColor: 'var(--muted)', color: 'var(--foreground)' }}
              className="flex-1 flex items-center justify-center gap-1 py-2.5 rounded-xl font-black text-xs disabled:opacity-50 transition-all uppercase tracking-widest"
            >
              <ChevronLeft className="w-4 h-4" /> Trước
            </button>
            <button 
              onClick={() => setCurrentIndex(prev => Math.min(questions.length - 1, prev + 1))}
              disabled={currentIndex === questions.length - 1}
              style={{ backgroundColor: 'var(--accent)', color: 'var(--primary)' }}
              className="flex-1 flex items-center justify-center gap-1 py-2.5 rounded-xl font-black text-xs disabled:opacity-50 transition-all uppercase tracking-widest"
            >
              Sau <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}
