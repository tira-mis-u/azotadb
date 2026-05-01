import React from 'react';
import { MarkdownRenderer } from './markdown-renderer';
import { CheckCircle2, Circle } from 'lucide-react';

export type QuestionType = 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'TRUE_FALSE_GROUP' | 'ESSAY';

export interface QuestionData {
  id: string;
  type: QuestionType;
  content: string;
  metadata: any;
  points?: number;
  explanation?: string;
  statements?: any[]; // For TRUE_FALSE_GROUP
}

interface QuestionRendererProps {
  question: QuestionData;
  index: number;
  mode?: 'STANDARD' | 'THPTQG';
  userAnswer?: any;
  onAnswerChange?: (answer: any) => void;
  showCorrectAnswer?: boolean;
}

export function QuestionRenderer({
  question,
  index,
  mode = 'STANDARD',
  userAnswer,
  onAnswerChange,
  showCorrectAnswer = false
}: QuestionRendererProps) {
  
  const handleMultipleChoiceChange = (choiceId: string) => {
    if (onAnswerChange && !showCorrectAnswer) {
      onAnswerChange(choiceId);
    }
  };

  const handleTrueFalseChange = (value: boolean) => {
    if (onAnswerChange && !showCorrectAnswer) {
      onAnswerChange(value);
    }
  };

  const handleGroupTrueFalseChange = (statementId: string, value: boolean) => {
    if (onAnswerChange && !showCorrectAnswer) {
      const currentAnswers = userAnswer || {};
      onAnswerChange({ ...currentAnswers, [statementId]: value });
    }
  };

  // Render TRUE_FALSE_GROUP (THPTQG Multi-statement)
  if (question.type === 'TRUE_FALSE_GROUP') {
    const statements = question.statements || question.metadata?.statements || [];
    
    return (
      <div className="space-y-6">
        <div className="flex gap-4">
          <div style={{ color: 'var(--primary)' }} className="shrink-0 font-bold text-lg">
            Câu {index}.
          </div>
          <div style={{ color: 'var(--foreground)' }} className="flex-1">
            <MarkdownRenderer content={question.content} />
          </div>
        </div>

        <div className="pl-0 md:pl-12">
          <div 
            style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
            className="overflow-hidden rounded-2xl border shadow-sm"
          >
            <table className="w-full text-left border-collapse">
              <thead>
                <tr style={{ backgroundColor: 'var(--muted)', borderColor: 'var(--border)' }} className="border-b">
                  <th style={{ color: 'var(--muted-foreground)' }} className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Mệnh đề</th>
                  <th style={{ color: 'var(--muted-foreground)' }} className="px-4 py-4 text-center text-xs font-bold uppercase tracking-wider w-24">Đúng</th>
                  <th style={{ color: 'var(--muted-foreground)' }} className="px-4 py-4 text-center text-xs font-bold uppercase tracking-wider w-24">Sai</th>
                </tr>
              </thead>
              <tbody style={{ borderColor: 'var(--border)' }} className="divide-y">
                {statements.map((stmt: any, idx: number) => {
                  const letter = String.fromCharCode(97 + idx); // a, b, c, d
                  const currentVal = userAnswer?.[stmt.id];
                  const isCorrect = showCorrectAnswer && stmt.correctAnswer !== undefined;
                  const correctVal = isCorrect ? stmt.correctAnswer : null;

                  return (
                    <tr key={stmt.id} className="hover:bg-gray-50/30 dark:hover:bg-gray-800/30 transition-colors">
                      <td style={{ color: 'var(--foreground)' }} className="px-6 py-4 text-sm">
                        <div className="flex gap-3">
                          <span style={{ color: 'var(--primary)' }} className="font-bold">{letter})</span>
                          <MarkdownRenderer content={stmt.content} />
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <button
                          onClick={() => handleGroupTrueFalseChange(stmt.id, true)}
                          disabled={showCorrectAnswer}
                          style={{
                            backgroundColor: currentVal === true ? '#10b981' : (showCorrectAnswer && correctVal === true ? 'rgba(16, 185, 129, 0.1)' : 'var(--muted)'),
                            color: currentVal === true ? '#fff' : (showCorrectAnswer && correctVal === true ? '#10b981' : 'var(--muted-foreground)'),
                            border: showCorrectAnswer && correctVal === true ? '1px solid #10b981' : 'none'
                          }}
                          className="w-10 h-10 rounded-xl flex items-center justify-center transition-all"
                        >
                          <CheckCircle2 className="w-5 h-5" />
                        </button>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <button
                          onClick={() => handleGroupTrueFalseChange(stmt.id, false)}
                          disabled={showCorrectAnswer}
                          style={{
                            backgroundColor: currentVal === false ? '#ef4444' : (showCorrectAnswer && correctVal === false ? 'rgba(239, 68, 68, 0.1)' : 'var(--muted)'),
                            color: currentVal === false ? '#fff' : (showCorrectAnswer && correctVal === false ? '#ef4444' : 'var(--muted-foreground)'),
                            border: showCorrectAnswer && correctVal === false ? '1px solid #ef4444' : 'none'
                          }}
                          className="w-10 h-10 rounded-xl flex items-center justify-center transition-all"
                        >
                          <CheckCircle2 className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // Render Multiple Choice
  if (question.type === 'MULTIPLE_CHOICE') {
    const choices = question.metadata?.choices || [];
    const correctAnswers = question.metadata?.correct_answers || [];

    return (
      <div className="space-y-6">
        <div className="flex gap-4">
          <div style={{ color: 'var(--primary)' }} className="shrink-0 font-bold text-lg">
            Câu {index}.
          </div>
          <div style={{ color: 'var(--foreground)' }} className="flex-1">
            <MarkdownRenderer content={question.content} />
          </div>
        </div>

        <div className={mode === 'THPTQG' ? 'space-y-3 pl-0 md:pl-12' : 'grid grid-cols-1 md:grid-cols-2 gap-4 pl-0 md:pl-12'}>
          {choices.map((choice: any, i: number) => {
            const letter = String.fromCharCode(65 + i); // A, B, C, D...
            const isSelected = userAnswer === choice.id;
            const isCorrect = showCorrectAnswer && correctAnswers.includes(choice.id);
            const isWrong = showCorrectAnswer && isSelected && !isCorrect;

            return (
              <button
                key={choice.id}
                onClick={() => handleMultipleChoiceChange(choice.id)}
                disabled={showCorrectAnswer}
                style={{
                  backgroundColor: isCorrect ? 'rgba(16, 185, 129, 0.1)' : isWrong ? 'rgba(239, 68, 68, 0.1)' : isSelected ? 'var(--accent)' : 'var(--card)',
                  borderColor: isCorrect ? '#10b981' : isWrong ? '#ef4444' : isSelected ? 'var(--primary)' : 'var(--border)',
                  color: 'var(--foreground)'
                }}
                className={`flex items-start gap-4 p-4 rounded-xl border-2 text-left transition-all ${showCorrectAnswer ? 'cursor-default' : 'cursor-pointer hover:shadow-sm'}`}
              >
                <div 
                  style={{
                    backgroundColor: isCorrect ? '#10b981' : isWrong ? '#ef4444' : isSelected ? 'var(--primary)' : 'var(--muted)',
                    color: (isSelected || isCorrect || isWrong) ? '#fff' : 'var(--muted-foreground)',
                    borderColor: (isSelected || isCorrect || isWrong) ? 'transparent' : 'var(--border)'
                  }}
                  className="w-6 h-6 shrink-0 rounded-full border-2 flex items-center justify-center text-xs font-bold mt-0.5"
                >
                  {letter}
                </div>
                <div className="flex-1 text-sm md:text-base">
                  <MarkdownRenderer content={choice.content} />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // Render True/False
  if (question.type === 'TRUE_FALSE') {
    const correctAnswer = question.metadata?.correct_answer; // boolean
    const isSelectedTrue = userAnswer === true;
    const isSelectedFalse = userAnswer === false;
    
    return (
      <div className="space-y-6">
        <div className="flex gap-4">
          <div style={{ color: 'var(--primary)' }} className="shrink-0 font-bold text-lg">
            Câu {index}.
          </div>
          <div style={{ color: 'var(--foreground)' }} className="flex-1">
            <MarkdownRenderer content={question.content} />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 pl-0 md:pl-12">
          {/* True Button */}
          <button
            onClick={() => handleTrueFalseChange(true)}
            disabled={showCorrectAnswer}
            style={{
              backgroundColor: showCorrectAnswer && correctAnswer === true ? 'rgba(16, 185, 129, 0.1)' : isSelectedTrue ? 'var(--accent)' : 'var(--card)',
              borderColor: showCorrectAnswer && correctAnswer === true ? '#10b981' : isSelectedTrue ? 'var(--primary)' : 'var(--border)',
              color: showCorrectAnswer && correctAnswer === true ? '#10b981' : isSelectedTrue ? 'var(--primary)' : 'var(--foreground)'
            }}
            className="flex-1 flex items-center justify-center gap-3 p-4 rounded-xl border-2 font-bold transition-all"
          >
            {isSelectedTrue || (showCorrectAnswer && correctAnswer === true) ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
            ĐÚNG
          </button>
          
          {/* False Button */}
          <button
            onClick={() => handleTrueFalseChange(false)}
            disabled={showCorrectAnswer}
            style={{
              backgroundColor: showCorrectAnswer && correctAnswer === false ? 'rgba(16, 185, 129, 0.1)' : isSelectedFalse ? 'var(--accent)' : 'var(--card)',
              borderColor: showCorrectAnswer && correctAnswer === false ? '#10b981' : isSelectedFalse ? 'var(--primary)' : 'var(--border)',
              color: showCorrectAnswer && correctAnswer === false ? '#10b981' : isSelectedFalse ? 'var(--primary)' : 'var(--foreground)'
            }}
            className="flex-1 flex items-center justify-center gap-3 p-4 rounded-xl border-2 font-bold transition-all"
          >
            {isSelectedFalse || (showCorrectAnswer && correctAnswer === false) ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
            SAI
          </button>
        </div>
      </div>
    );
  }

  // Fallback for unknown types
  return (
    <div className="p-4 border border-red-200 bg-red-50 text-red-600 rounded-xl">
      Unsupported question type: {question.type}
    </div>
  );
}
