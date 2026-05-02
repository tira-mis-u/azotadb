import React from 'react';
import { MarkdownRenderer } from './markdown-renderer';
import { CheckCircle2, Circle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

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

  // Common Header component for consistent look
  const QuestionHeader = () => (
    <div className="flex gap-4 mb-6">
      <div className="shrink-0 font-black text-2xl text-primary tracking-tighter">
        Câu {index}.
      </div>
      <div className="flex-1 text-lg font-bold text-foreground leading-relaxed tracking-tight">
        <MarkdownRenderer content={question.content} />
      </div>
    </div>
  );

  // Render TRUE_FALSE_GROUP (THPTQG Academic Style)
  if (question.type === 'TRUE_FALSE_GROUP') {
    const statements = question.statements || question.metadata?.statements || [];
    
    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        <QuestionHeader />

        <div className="pl-0 md:pl-12">
          <div className="overflow-hidden rounded-[2rem] border border-border bg-card shadow-2xl shadow-primary/5">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-muted border-b border-border">
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Mệnh đề</th>
                  <th className="px-4 py-5 text-center text-[10px] font-black uppercase tracking-widest text-muted-foreground w-32">Đúng</th>
                  <th className="px-4 py-5 text-center text-[10px] font-black uppercase tracking-widest text-muted-foreground w-32">Sai</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {statements.map((stmt: any, idx: number) => {
                  const letter = String.fromCharCode(97 + idx); // a, b, c, d
                  const currentVal = userAnswer?.[stmt.id];
                  const isCorrect = showCorrectAnswer && stmt.correctAnswer !== undefined;
                  const correctVal = isCorrect ? stmt.correctAnswer : null;

                  return (
                    <tr key={`${stmt.id}-${idx}`} className="group hover:bg-muted/30 transition-colors">
                      <td className="px-8 py-6 text-sm font-bold text-foreground leading-relaxed">
                        <div className="flex gap-4">
                          <span className="font-black text-primary group-hover:scale-110 transition-transform">{letter})</span>
                          <MarkdownRenderer content={stmt.content} />
                        </div>
                      </td>
                      <td className="px-4 py-6 text-center">
                        <button
                          onClick={() => handleGroupTrueFalseChange(stmt.id, true)}
                          disabled={showCorrectAnswer}
                          className={cn(
                            "w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all shadow-sm font-black text-xs",
                            currentVal === true 
                              ? "bg-success border-success text-white" 
                              : (showCorrectAnswer && correctVal === true ? "bg-success/20 border-success text-success" : "bg-muted border-border text-foreground hover:border-primary/50")
                          )}
                        >
                          {currentVal === true ? <CheckCircle2 className="w-6 h-6" /> : "Đ"}
                        </button>
                      </td>
                      <td className="px-4 py-6 text-center">
                        <button
                          onClick={() => handleGroupTrueFalseChange(stmt.id, false)}
                          disabled={showCorrectAnswer}
                          className={cn(
                            "w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all shadow-sm font-black text-xs",
                            currentVal === false 
                              ? "bg-destructive border-destructive text-white" 
                              : (showCorrectAnswer && correctVal === false ? "bg-destructive/20 border-destructive text-destructive" : "bg-muted border-border text-foreground hover:border-primary/50")
                          )}
                        >
                          {currentVal === false ? <CheckCircle2 className="w-6 h-6" /> : "S"}
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
      <div className="space-y-6 animate-in fade-in duration-500">
        <QuestionHeader />

        <div className={cn(
          "pl-0 md:pl-12 grid gap-4",
          mode === 'THPTQG' ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2"
        )}>
          {choices.map((choice: any, i: number) => {
            const letter = String.fromCharCode(65 + i); // A, B, C, D...
            const isSelected = userAnswer === choice.id;
            const isCorrect = showCorrectAnswer && correctAnswers.includes(choice.id);
            const isWrong = showCorrectAnswer && isSelected && !isCorrect;

            return (
              <button
                key={`${choice.id}-${i}`}
                onClick={() => handleMultipleChoiceChange(choice.id)}
                disabled={showCorrectAnswer}
                className={cn(
                  "flex items-start gap-4 p-5 rounded-2xl border-2 text-left transition-all duration-200 group/choice",
                  isCorrect 
                    ? "bg-success/10 border-success" 
                    : isWrong 
                      ? "bg-destructive/10 border-destructive" 
                      : isSelected 
                        ? "bg-accent border-primary shadow-lg shadow-primary/5" 
                        : "bg-card border-border hover:border-primary/30 hover:bg-muted/50"
                )}
              >
                <div className={cn(
                  "w-8 h-8 shrink-0 rounded-xl border-2 flex items-center justify-center text-xs font-black mt-0.5 transition-all",
                  isCorrect 
                    ? "bg-success border-success text-white" 
                    : isWrong 
                      ? "bg-destructive border-destructive text-white" 
                      : isSelected 
                        ? "bg-primary border-primary text-primary-foreground" 
                        : "bg-muted border-border text-muted-foreground group-hover/choice:border-primary/50 group-hover/choice:text-primary"
                )}>
                  {letter}
                </div>
                <div className="flex-1 text-sm md:text-base font-bold text-foreground group-hover/choice:text-primary transition-colors">
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
      <div className="space-y-6 animate-in fade-in duration-500">
        <QuestionHeader />

        <div className="flex flex-col sm:flex-row gap-4 pl-0 md:pl-12">
          {/* True Button */}
          <button
            onClick={() => handleTrueFalseChange(true)}
            disabled={showCorrectAnswer}
            className={cn(
              "flex-1 flex items-center justify-center gap-3 p-5 rounded-2xl border-2 font-black text-sm transition-all",
              showCorrectAnswer && correctAnswer === true 
                ? "bg-success/10 border-success text-success" 
                : isSelectedTrue 
                  ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20" 
                  : "bg-card border-border text-foreground hover:border-primary/30"
            )}
          >
            {isSelectedTrue || (showCorrectAnswer && correctAnswer === true) ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5 opacity-50" />}
            ĐÚNG
          </button>
          
          {/* False Button */}
          <button
            onClick={() => handleTrueFalseChange(false)}
            disabled={showCorrectAnswer}
            className={cn(
              "flex-1 flex items-center justify-center gap-3 p-5 rounded-2xl border-2 font-black text-sm transition-all",
              showCorrectAnswer && correctAnswer === false 
                ? "bg-destructive/10 border-destructive text-destructive" 
                : isSelectedFalse 
                  ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20" 
                  : "bg-card border-border text-foreground hover:border-primary/30"
            )}
          >
            {isSelectedFalse || (showCorrectAnswer && correctAnswer === false) ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5 opacity-50" />}
            SAI
          </button>
        </div>
      </div>
    );
  }

  // Fallback for unknown types
  return (
    <div className="p-8 border-2 border-dashed border-destructive/30 bg-destructive/5 text-destructive rounded-[2rem] font-black text-center flex flex-col items-center gap-4">
      <XCircle className="w-12 h-12" />
      CHƯA HỖ TRỢ ĐỊNH DẠNG: {question.type}
    </div>
  );
}
