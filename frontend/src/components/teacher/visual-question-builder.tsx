'use client';

import React from 'react';
import { ParsedQuestion } from '@/lib/utils/question-parser';
import { Plus, Trash2, GripVertical, CheckCircle2, Circle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface VisualQuestionBuilderProps {
  data: ParsedQuestion;
  onChange: (newData: ParsedQuestion) => void;
}

export function VisualQuestionBuilder({ data, onChange }: VisualQuestionBuilderProps) {
  const handleTypeChange = (type: ParsedQuestion['type']) => {
    onChange({ ...data, type });
  };

  const handleContentChange = (content: string) => {
    onChange({ ...data, content });
  };

  // Multiple Choice Handlers
  const addChoice = () => {
    const choices = data.choices || [];
    const nextLabel = String.fromCharCode(65 + choices.length);
    onChange({
      ...data,
      choices: [...choices, { id: nextLabel, content: '' }]
    });
  };

  const removeChoice = (id: string) => {
    onChange({
      ...data,
      choices: data.choices?.filter(c => c.id !== id),
      correct_answers: data.correct_answers?.filter(a => a !== id)
    });
  };

  const toggleCorrectChoice = (id: string) => {
    const current = data.correct_answers || [];
    if (current.includes(id)) {
      onChange({ ...data, correct_answers: current.filter(a => a !== id) });
    } else {
      onChange({ ...data, correct_answers: [...current, id] });
    }
  };

  // Group True/False Handlers
  const addStatement = () => {
    const statements = data.statements || [];
    const nextId = String.fromCharCode(97 + statements.length);
    onChange({
      ...data,
      statements: [...statements, { id: nextId, content: '', correctAnswer: true }]
    });
  };

  const removeStatement = (id: string) => {
    onChange({
      ...data,
      statements: data.statements?.filter(s => s.id !== id)
    });
  };

  return (
    <div className="p-8 space-y-10 bg-background h-full overflow-y-auto custom-scrollbar animate-in fade-in duration-500">
      {/* Question Type Selection */}
      <div className="space-y-4">
        <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Loại câu hỏi</label>
        <div className="flex flex-wrap gap-2">
          {(['MULTIPLE_CHOICE', 'TRUE_FALSE_GROUP', 'ESSAY'] as const).map((t) => (
            <button
              key={t}
              onClick={() => handleTypeChange(t)}
              className={cn(
                "px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border-2",
                data.type === t 
                  ? "bg-primary/10 border-primary text-primary shadow-lg shadow-primary/10 scale-105" 
                  : "bg-card border-border text-muted-foreground hover:border-primary/30"
              )}
            >
              {t.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="space-y-3">
        <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Nội dung câu hỏi</label>
        <textarea
          value={data.content}
          onChange={(e) => handleContentChange(e.target.value)}
          rows={5}
          className="w-full px-6 py-5 rounded-[2rem] border border-border bg-card text-foreground text-sm font-bold focus:ring-4 focus:ring-primary/10 transition-all resize-none shadow-sm placeholder:text-muted-foreground/50"
          placeholder="Nhập nội dung câu hỏi (Hỗ trợ Markdown)..."
        />
      </div>

      {/* Type-specific inputs */}
      {data.type === 'MULTIPLE_CHOICE' && (
        <div className="space-y-6 animate-in slide-in-from-top-4 duration-300">
          <div className="flex items-center justify-between px-1">
            <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground">Các phương án trả lời</label>
            <Button onClick={addChoice} variant="ghost" size="sm" className="h-9 px-4 rounded-xl text-[10px] uppercase font-black text-primary hover:bg-primary/10">
              <Plus className="w-4 h-4 mr-2" /> Thêm phương án
            </Button>
          </div>
          <div className="grid gap-4">
            {data.choices?.map((choice, i) => (
              <div key={`${choice.id}-${i}`} className="flex gap-4 items-start group relative">
                <button 
                  onClick={() => toggleCorrectChoice(choice.id)}
                  className={cn(
                    "mt-2 shrink-0 w-8 h-8 rounded-xl border-2 flex items-center justify-center transition-all font-black text-xs shadow-sm",
                    data.correct_answers?.includes(choice.id)
                      ? "bg-success border-success text-white scale-110 shadow-lg shadow-success/20"
                      : "bg-muted border-border text-muted-foreground hover:border-primary/50 group-hover:text-primary"
                  )}
                >
                  {choice.id}
                </button>
                <div className="flex-1">
                  <input
                    value={choice.content}
                    onChange={(e) => {
                      const newChoices = data.choices?.map(c => c.id === choice.id ? { ...c, content: e.target.value } : c);
                      onChange({ ...data, choices: newChoices });
                    }}
                    placeholder={`Nội dung phương án ${choice.id}...`}
                    className="w-full px-6 py-3.5 rounded-[1.25rem] border border-border bg-card text-foreground text-sm font-bold focus:ring-4 focus:ring-primary/10 transition-all shadow-sm"
                  />
                </div>
                <button 
                  onClick={() => removeChoice(choice.id)}
                  className="mt-2.5 p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}



      {data.type === 'TRUE_FALSE_GROUP' && (
        <div className="space-y-6 animate-in slide-in-from-top-4 duration-300">
          <div className="flex items-center justify-between px-1">
            <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground">Danh sách mệnh đề</label>
            <Button onClick={addStatement} variant="ghost" size="sm" className="h-9 px-4 rounded-xl text-[10px] uppercase font-black text-primary hover:bg-primary/10">
              <Plus className="w-4 h-4 mr-2" /> Thêm mệnh đề
            </Button>
          </div>
          <div className="grid gap-6">
            {data.statements?.map((stmt, idx) => (
              <div key={`${stmt.id}-${idx}`} className="p-8 rounded-[2rem] bg-card border border-border space-y-6 group relative shadow-xl hover:border-primary/40 transition-all">
                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-3">
                     <GripVertical className="w-5 h-5 text-muted-foreground/30" />
                     <span className="text-sm font-black text-primary uppercase tracking-widest">{String.fromCharCode(97 + idx)}) Mệnh đề {idx + 1}</span>
                   </div>
                   <div className="flex items-center bg-muted p-1 rounded-2xl border border-border">
                     <button
                       onClick={() => {
                         const newStmts = data.statements?.map(s => s.id === stmt.id ? { ...s, correctAnswer: true } : s);
                         onChange({ ...data, statements: newStmts });
                       }}
                       className={cn(
                         "px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                         stmt.correctAnswer ? "bg-success text-white shadow-lg" : "text-muted-foreground hover:text-foreground"
                       )}
                     >
                       Đúng
                     </button>
                     <button
                       onClick={() => {
                         const newStmts = data.statements?.map(s => s.id === stmt.id ? { ...s, correctAnswer: false } : s);
                         onChange({ ...data, statements: newStmts });
                       }}
                       className={cn(
                         "px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                         !stmt.correctAnswer ? "bg-destructive text-white shadow-lg" : "text-muted-foreground hover:text-foreground"
                       )}
                     >
                       Sai
                     </button>
                   </div>
                </div>
                <textarea
                  value={stmt.content}
                  onChange={(e) => {
                    const newStmts = data.statements?.map(s => s.id === stmt.id ? { ...s, content: e.target.value } : s);
                    onChange({ ...data, statements: newStmts });
                  }}
                  rows={3}
                  className="w-full px-6 py-4 rounded-2xl bg-background border border-border text-sm font-bold focus:ring-4 focus:ring-primary/10 transition-all resize-none shadow-inner"
                  placeholder="Nội dung mệnh đề chi tiết..."
                />
                <button 
                  onClick={() => removeStatement(stmt.id)}
                  className="absolute -right-3 -top-3 w-10 h-10 rounded-full bg-destructive text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-xl hover:scale-110 z-10"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
