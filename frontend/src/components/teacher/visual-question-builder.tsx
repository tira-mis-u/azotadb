'use client';

import React from 'react';
import { ParsedQuestion } from '@/lib/utils/question-parser';
import { Plus, Trash2, GripVertical, CheckCircle2, Circle } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
    <div className="p-6 space-y-8 h-full overflow-y-auto bg-white dark:bg-gray-950">
      {/* Question Type Selection */}
      <div className="flex flex-wrap gap-2">
        {(['MULTIPLE_CHOICE', 'TRUE_FALSE', 'TRUE_FALSE_GROUP', 'ESSAY'] as const).map((t) => (
          <button
            key={t}
            onClick={() => handleTypeChange(t)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border-2 ${
              data.type === t 
                ? 'border-indigo-600 bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20' 
                : 'border-gray-100 dark:border-gray-800 text-gray-500 hover:border-gray-200'
            }`}
          >
            {t.replace(/_/g, ' ')}
          </button>
        ))}
      </div>

      {/* Main Content */}
      <div className="space-y-4">
        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest">Nội dung câu hỏi</label>
        <textarea
          value={data.content}
          onChange={(e) => handleContentChange(e.target.value)}
          rows={4}
          className="w-full px-4 py-3 rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all resize-none"
          placeholder="Nhập nội dung câu hỏi (hỗ trợ Markdown)..."
        />
      </div>

      {/* Type-specific inputs */}
      {data.type === 'MULTIPLE_CHOICE' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest">Các phương án trả lời</label>
            <Button onClick={addChoice} variant="ghost" size="sm" className="h-8 text-[10px] uppercase font-bold text-indigo-600">
              <Plus className="w-3 h-3 mr-1" /> Thêm phương án
            </Button>
          </div>
          <div className="space-y-3">
            {data.choices?.map((choice) => (
              <div key={choice.id} className="flex gap-3 items-start group">
                <button 
                  onClick={() => toggleCorrectChoice(choice.id)}
                  className={`mt-2 shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                    data.correct_answers?.includes(choice.id)
                      ? 'bg-emerald-500 border-emerald-500 text-white'
                      : 'border-gray-200 dark:border-gray-700 text-gray-400 hover:border-indigo-500'
                  }`}
                >
                  <span className="text-[10px] font-bold">{choice.id}</span>
                </button>
                <div className="flex-1">
                  <input
                    value={choice.content}
                    onChange={(e) => {
                      const newChoices = data.choices?.map(c => c.id === choice.id ? { ...c, content: e.target.value } : c);
                      onChange({ ...data, choices: newChoices });
                    }}
                    placeholder={`Nội dung phương án ${choice.id}...`}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-800/30 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  />
                </div>
                <button 
                  onClick={() => removeChoice(choice.id)}
                  className="mt-2 p-1.5 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {data.type === 'TRUE_FALSE' && (
        <div className="space-y-4">
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest">Đáp án đúng</label>
          <div className="flex gap-4">
            <button
              onClick={() => onChange({ ...data, correct_answer: true })}
              className={`flex-1 py-4 rounded-2xl border-2 font-bold transition-all flex items-center justify-center gap-2 ${
                data.correct_answer === true ? 'border-emerald-500 bg-emerald-50 text-emerald-600' : 'border-gray-100 text-gray-400'
              }`}
            >
              {data.correct_answer === true ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
              ĐÚNG
            </button>
            <button
              onClick={() => onChange({ ...data, correct_answer: false })}
              className={`flex-1 py-4 rounded-2xl border-2 font-bold transition-all flex items-center justify-center gap-2 ${
                data.correct_answer === false ? 'border-red-500 bg-red-50 text-red-600' : 'border-gray-100 text-gray-400'
              }`}
            >
              {data.correct_answer === false ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
              SAI
            </button>
          </div>
        </div>
      )}

      {data.type === 'TRUE_FALSE_GROUP' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest">Danh sách mệnh đề</label>
            <Button onClick={addStatement} variant="ghost" size="sm" className="h-8 text-[10px] uppercase font-bold text-indigo-600">
              <Plus className="w-3 h-3 mr-1" /> Thêm mệnh đề
            </Button>
          </div>
          <div className="space-y-4">
            {data.statements?.map((stmt, idx) => (
              <div key={stmt.id} className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 space-y-3 group relative">
                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-2">
                     <GripVertical className="w-4 h-4 text-gray-300" />
                     <span className="text-xs font-bold text-indigo-600">{String.fromCharCode(97 + idx)})</span>
                   </div>
                   <div className="flex items-center bg-white dark:bg-gray-800 p-1 rounded-xl border border-gray-100 dark:border-gray-700">
                     <button
                       onClick={() => {
                         const newStmts = data.statements?.map(s => s.id === stmt.id ? { ...s, correctAnswer: true } : s);
                         onChange({ ...data, statements: newStmts });
                       }}
                       className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-all ${stmt.correctAnswer ? 'bg-emerald-500 text-white shadow-sm' : 'text-gray-400'}`}
                     >
                       Đúng
                     </button>
                     <button
                       onClick={() => {
                         const newStmts = data.statements?.map(s => s.id === stmt.id ? { ...s, correctAnswer: false } : s);
                         onChange({ ...data, statements: newStmts });
                       }}
                       className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-all ${!stmt.correctAnswer ? 'bg-red-500 text-white shadow-sm' : 'text-gray-400'}`}
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
                  rows={2}
                  className="w-full px-4 py-2 rounded-xl bg-white dark:bg-gray-800 border-none text-sm focus:ring-2 focus:ring-indigo-500 transition-all resize-none shadow-sm"
                  placeholder="Nội dung mệnh đề..."
                />
                <button 
                  onClick={() => removeStatement(stmt.id)}
                  className="absolute -right-2 -top-2 w-7 h-7 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-lg"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
