'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
// @ts-ignore
import { debounce } from 'lodash';
import { parseGlobalMarkdown, ParsedExam } from '@/lib/utils/global-exam-parser';
import { QuestionRenderer } from '@/components/ui/question-renderer';
import { Eye, Code, Split, Info, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GlobalExamEditorProps {
  initialValue: string;
  onChange: (exam: ParsedExam, raw: string) => void;
  isSaving?: boolean;
}

export function GlobalExamEditor({ initialValue, onChange, isSaving }: GlobalExamEditorProps) {
  const [markdown, setMarkdown] = useState(initialValue);
  const [viewMode, setViewMode] = useState<'split' | 'edit' | 'preview'>('split');
  const [parsedExam, setParsedExam] = useState<ParsedExam | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const editorRef = useRef<HTMLTextAreaElement>(null);

  // Sync internal state with initialValue only once or when reset
  useEffect(() => {
    if (initialValue && !markdown) {
      setMarkdown(initialValue);
    }
  }, [initialValue]);

  // Debounced sync to parent for preview/state - NOT for API saving
  const debouncedSync = useCallback(
    debounce((content: string) => {
      try {
        const parsed = parseGlobalMarkdown(content);
        setParsedExam(parsed);
        onChange(parsed, content);
        setHasUnsavedChanges(true);
      } catch (err) {
        console.error('Parsing error:', err);
      }
    }, 800),
    [onChange]
  );

  useEffect(() => {
    debouncedSync(markdown);
  }, [markdown, debouncedSync]);

  // Reset unsaved flag when parent indicates saving is done
  useEffect(() => {
    if (!isSaving && hasUnsavedChanges) {
      // In a real app, we'd only reset this on actual success
    }
  }, [isSaving]);

  return (
    <div className="flex flex-col h-full bg-background border border-border rounded-xl overflow-hidden shadow-sm transition-all duration-300">
      {/* Toolbar - Scaled Down */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-card">
        <div className="flex items-center gap-1.5 bg-muted p-1 rounded-lg">
          {[
            { id: 'edit', label: 'EDITOR', icon: Code },
            { id: 'split', label: 'SPLIT', icon: Split },
            { id: 'preview', label: 'PREVIEW', icon: Eye }
          ].map((mode) => (
            <button 
              key={mode.id}
              type="button"
              onClick={() => setViewMode(mode.id as any)}
              className={cn(
                "px-3 py-1.5 rounded-md text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-1.5",
                viewMode === mode.id 
                  ? "bg-primary text-primary-foreground shadow-sm" 
                  : "text-muted-foreground hover:bg-muted-foreground/5 hover:text-foreground"
              )}
            >
              <mode.icon size={12} /> {mode.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-4">
           {hasUnsavedChanges && !isSaving && (
             <div className="flex items-center gap-2 text-[9px] font-black text-amber-500 uppercase tracking-widest animate-pulse">
                <AlertTriangle size={12} /> Thay đổi chưa lưu
             </div>
           )}
           <div className="flex items-center gap-2 px-2.5 py-1 bg-primary/5 text-primary rounded-md text-[9px] font-black tracking-widest uppercase border border-primary/10">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              LIVE SYNCING
           </div>
        </div>
      </div>

      {/* Workspace - Fixed Logic: No remounting of Editor */}
      <div className="flex-1 overflow-hidden flex bg-card/30">
        {/* Editor Pane - Fixed size logic and stable rendering */}
        <div 
          className={cn(
            "h-full border-r border-border relative flex flex-col transition-all duration-200",
            viewMode === 'edit' ? "w-full" : viewMode === 'split' ? "w-1/2" : "hidden"
          )}
        >
          <textarea
            id="global-exam-editor-input"
            name="global-exam-editor-input"
            ref={editorRef}
            value={markdown}
            onChange={(e) => setMarkdown(e.target.value)}
            className="flex-1 w-full p-6 font-mono text-xs leading-relaxed resize-none focus:outline-none bg-transparent text-foreground selection:bg-primary/20 placeholder:text-muted-foreground/30"
            placeholder="# NHẬP TIÊU ĐỀ ĐỀ THI TẠI ĐÂY...
Ví dụ: ## TRẮC NGHIỆM
1. Câu hỏi của bạn?
*A. Đáp án đúng
B. Đáp án sai"
            spellCheck={false}
          />
          
          <div className="absolute bottom-4 left-4 right-4 p-3 bg-primary/90 backdrop-blur-sm rounded-lg text-primary-foreground shadow-lg flex items-center gap-3">
             <div className="w-8 h-8 bg-white/20 rounded-md flex items-center justify-center shrink-0">
                <Info size={16} />
             </div>
             <p className="text-[9px] font-bold uppercase tracking-tight leading-tight opacity-90">Phân tách câu hỏi bằng "---". Dùng "## [Loại]" để tạo phần mới.</p>
          </div>
        </div>

        {/* Preview Pane - Stable rendering */}
        <div 
          className={cn(
            "h-full overflow-y-auto p-8 bg-background custom-scrollbar transition-all duration-200",
            viewMode === 'preview' ? "w-full" : viewMode === 'split' ? "w-1/2" : "hidden"
          )}
        >
          {parsedExam ? (
            <div className="max-w-2xl mx-auto space-y-10 py-4">
              <div className="space-y-3 border-b border-border pb-8">
                <h1 className="text-2xl font-black tracking-tight text-foreground uppercase">{parsedExam.title || 'CHƯA CÓ TIÊU ĐỀ'}</h1>
                {parsedExam.description && <p className="text-muted-foreground text-sm font-medium leading-relaxed">{parsedExam.description}</p>}
                <div className="flex flex-wrap gap-2 pt-2">
                  <span className="px-3 py-1 bg-primary/10 text-primary rounded-lg text-[9px] font-black uppercase tracking-widest border border-primary/20">{parsedExam.mode}</span>
                  <span className="px-3 py-1 bg-muted text-muted-foreground rounded-lg text-[9px] font-black uppercase tracking-widest border border-border">{parsedExam.durationValue} {parsedExam.durationUnit}</span>
                </div>
              </div>

              <div className="space-y-12">
                {parsedExam.items.map((item, idx) => (
                  <div key={idx} className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                    {item.type === 'SECTION' ? (
                      <div className="py-4 border-b-2 border-primary/10">
                        <h2 className="text-lg font-black uppercase tracking-tight text-primary">
                          {item.content}
                        </h2>
                      </div>
                    ) : (
                      <QuestionRenderer 
                        question={item as any}
                        index={idx + 1}
                        showCorrectAnswer={true}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center space-y-3 opacity-40">
              <div className="w-12 h-12 bg-muted rounded-xl flex items-center justify-center animate-pulse">
                <Code size={24} className="text-muted-foreground" />
              </div>
              <p className="font-black uppercase tracking-[0.2em] text-[9px] text-muted-foreground">Phân tích dữ liệu...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
