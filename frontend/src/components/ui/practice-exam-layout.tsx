'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QuestionRenderer } from './question-renderer';
import { PageHeader } from './page-header';
import { Button } from './button';
import { CheckCircle2, XCircle, Info, ArrowRight, RotateCcw } from 'lucide-react';

interface PracticeExamLayoutProps {
  exam: any;
  questions: any[];
  onFinish: () => void;
}

export function PracticeExamLayout({ exam, questions, onFinish }: PracticeExamLayoutProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, any>>({});
  const [results, setResults] = useState<Record<string, boolean | null>>({});
  const [showExplanation, setShowExplanation] = useState(false);
  const [streak, setStreak] = useState(0);

  const currentQuestion = questions[currentIndex];
  const isAnswered = userAnswers[currentQuestion.id] !== undefined;
  const isCorrect = results[currentQuestion.id] === true;

  const handleAnswer = (answer: any) => {
    if (results[currentQuestion.id] !== null && results[currentQuestion.id] !== undefined) return;

    setUserAnswers(prev => ({ ...prev, [currentQuestion.id]: answer }));
    
    // Check correctness immediately
    let correct = false;
    const metadata = currentQuestion.metadata;

    if (currentQuestion.type === 'MULTIPLE_CHOICE') {
      correct = metadata.correct_answers.includes(answer);
    } else if (currentQuestion.type === 'TRUE_FALSE') {
      correct = answer === metadata.correct_answer;
    } else if (currentQuestion.type === 'TRUE_FALSE_GROUP') {
      const statements = currentQuestion.statements || metadata.statements || [];
      correct = statements.every((s: any) => answer[s.id] === s.correctAnswer);
    }

    setResults(prev => ({ ...prev, [currentQuestion.id]: correct }));
    
    if (correct) {
      setStreak(prev => prev + 1);
      setShowExplanation(true);
    } else {
      setStreak(0);
      setShowExplanation(true);
    }
  };

  const nextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setShowExplanation(false);
    } else {
      onFinish();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <PageHeader 
        title={exam.title}
        description={`Chế độ luyện tập • Câu ${currentIndex + 1}/${questions.length}`}
        backHref="/student/exams"
      />

      <main className="max-w-4xl mx-auto p-6 pb-32">
        {/* Streak Indicator */}
        <div className="flex justify-center mb-8">
          <div className="bg-accent/50 px-6 py-2 rounded-full flex items-center gap-3 border border-border">
            <span className="text-xs font-black uppercase tracking-widest opacity-60">Chuỗi đúng</span>
            <span className="text-xl font-black text-primary">{streak}</span>
            {streak >= 3 && <motion.span animate={{ scale: [1, 1.5, 1] }} className="text-orange-500">🔥</motion.span>}
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            <QuestionRenderer 
              question={currentQuestion}
              index={currentIndex + 1}
              userAnswer={userAnswers[currentQuestion.id]}
              onAnswerChange={handleAnswer}
              showCorrectAnswer={isAnswered}
            />

            {/* Feedback Overlay */}
            <AnimatePresence>
              {isAnswered && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-6 rounded-3xl border-2 ${
                    isCorrect 
                      ? 'bg-emerald-50/50 border-emerald-500/30 dark:bg-emerald-950/20' 
                      : 'bg-red-50/50 border-red-500/30 dark:bg-red-950/20'
                  }`}
                >
                  <div className="flex items-center gap-4 mb-4">
                    {isCorrect ? (
                      <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                        <CheckCircle2 size={24} />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-red-500 text-white flex items-center justify-center">
                        <XCircle size={24} />
                      </div>
                    )}
                    <div>
                      <h3 className={`font-black uppercase tracking-widest text-sm ${isCorrect ? 'text-emerald-600' : 'text-red-600'}`}>
                        {isCorrect ? 'Tuyệt vời! Đáp án đúng' : 'Chưa chính xác'}
                      </h3>
                      {!isCorrect && <p className="text-xs font-medium opacity-60 mt-0.5">Đừng bỏ cuộc, hãy xem giải thích bên dưới.</p>}
                    </div>
                  </div>

                  {showExplanation && (currentQuestion.explanation || currentQuestion.metadata?.explanation) && (
                    <div className="mt-4 p-4 bg-white/50 dark:bg-black/20 rounded-2xl border border-border">
                      <div className="flex items-center gap-2 mb-2 text-indigo-600 dark:text-indigo-400">
                        <Info size={14} />
                        <span className="text-[10px] font-black uppercase tracking-widest">Lời giải chi tiết</span>
                      </div>
                      <div className="text-sm leading-relaxed opacity-80">
                        {currentQuestion.explanation || currentQuestion.metadata?.explanation}
                      </div>
                    </div>
                  )}

                  <div className="mt-6 flex justify-end">
                    <Button onClick={nextQuestion} className="rounded-2xl px-8 h-12 font-black uppercase tracking-widest text-xs gap-2 group">
                      {currentIndex < questions.length - 1 ? 'Câu tiếp theo' : 'Hoàn thành'}
                      <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
