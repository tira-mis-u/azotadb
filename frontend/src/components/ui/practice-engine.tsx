'use client';

import React, { useState, useEffect } from 'react';
import { QuestionData, QuestionRenderer } from './question-renderer';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './button';
import { CheckCircle2, XCircle, ArrowRight, RotateCcw, Trophy, Flame } from 'lucide-react';
// @ts-ignore
import confetti from 'canvas-confetti';

interface PracticeEngineProps {
  questions: QuestionData[];
  onFinish: (stats: any) => void;
}

export function PracticeEngine({ questions, onFinish }: PracticeEngineProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState<any>(null);
  const [isChecked, setIsChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [stats, setStats] = useState({ correct: 0, wrong: 0, streak: 0, maxStreak: 0 });

  const currentQuestion = questions[currentIndex];

  const handleCheck = () => {
    if (!userAnswer) return;

    let correct = false;
    if (currentQuestion.type === 'TRUE_FALSE') {
      correct = userAnswer === currentQuestion.metadata.correct_answer;
    } else if (currentQuestion.type === 'MULTIPLE_CHOICE') {
      const correctAns = currentQuestion.metadata.correct_answers;
      correct = Array.isArray(correctAns) ? correctAns.includes(userAnswer) : userAnswer === correctAns;
    }

    setIsChecked(true);
    setIsCorrect(correct);

    if (correct) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10b981', '#3b82f6', '#f59e0b']
      });
      setStats(prev => ({
        ...prev,
        correct: prev.correct + 1,
        streak: prev.streak + 1,
        maxStreak: Math.max(prev.maxStreak, prev.streak + 1)
      }));
    } else {
      setStats(prev => ({
        ...prev,
        wrong: prev.wrong + 1,
        streak: 0
      }));
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setUserAnswer(null);
      setIsChecked(false);
      setIsCorrect(null);
    } else {
      onFinish(stats);
    }
  };

  const handleRetry = () => {
    setUserAnswer(null);
    setIsChecked(false);
    setIsCorrect(null);
  };

  if (!currentQuestion) return <div>Không có câu hỏi nào.</div>;

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-8">
      {/* Header Stats */}
      <div className="flex items-center justify-between bg-white dark:bg-gray-900 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
        <div className="flex gap-4">
          <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-sm font-bold">
             <CheckCircle2 className="w-4 h-4" /> {stats.correct}
          </div>
          <div className="flex items-center gap-2 px-3 py-1 bg-red-50 text-red-600 rounded-lg text-sm font-bold">
             <XCircle className="w-4 h-4" /> {stats.wrong}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
           <Flame className={`w-5 h-5 ${stats.streak > 2 ? 'text-orange-500 animate-bounce' : 'text-gray-300'}`} />
           <span className="text-sm font-black text-gray-700 dark:text-gray-300">STREAK: {stats.streak}</span>
        </div>

        <div className="text-xs font-bold text-gray-400">
           CÂU {currentIndex + 1} / {questions.length}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-2 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
         <motion.div 
           initial={{ width: 0 }}
           animate={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
           className="h-full bg-indigo-500"
         />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestion.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="bg-white dark:bg-gray-900 p-8 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-xl"
        >
          <QuestionRenderer 
            question={currentQuestion}
            index={currentIndex + 1}
            userAnswer={userAnswer}
            onAnswerChange={setUserAnswer}
            showCorrectAnswer={isChecked}
          />

          <div className="mt-10 flex justify-end gap-4">
            {!isChecked ? (
              <Button 
                onClick={handleCheck}
                disabled={!userAnswer}
                className="rounded-xl px-8 py-6 bg-indigo-600 hover:bg-indigo-700 text-lg font-bold"
              >
                Kiểm tra
              </Button>
            ) : (
              <>
                {!isCorrect && (
                  <Button 
                    variant="outline"
                    onClick={handleRetry}
                    className="rounded-xl px-8 py-6 border-2 border-orange-200 text-orange-600 hover:bg-orange-50 font-bold"
                  >
                    <RotateCcw className="w-5 h-5 mr-2" /> Thử lại
                  </Button>
                )}
                <Button 
                  onClick={handleNext}
                  disabled={!isCorrect}
                  className="rounded-xl px-8 py-6 bg-emerald-600 hover:bg-emerald-700 text-lg font-bold shadow-lg shadow-emerald-500/20"
                >
                  {currentIndex === questions.length - 1 ? 'Hoàn thành' : 'Câu tiếp theo'} <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </>
            )}
          </div>

          {isChecked && isCorrect && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-6 p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 rounded-2xl flex items-center gap-3"
            >
              <Trophy className="w-6 h-6 text-emerald-500" />
              <div>
                <p className="text-emerald-700 dark:text-emerald-400 font-bold">Chính xác!</p>
                {currentQuestion.explanation && (
                  <p className="text-sm text-emerald-600/80 mt-1">{currentQuestion.explanation}</p>
                )}
              </div>
            </motion.div>
          )}

          {isChecked && !isCorrect && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-2xl"
            >
              <p className="text-red-700 dark:text-red-400 font-bold">Chưa đúng, hãy thử lại nhé!</p>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
