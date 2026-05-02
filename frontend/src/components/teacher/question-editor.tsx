'use client';

import React, { useState, useEffect, useCallback } from 'react';
// @ts-ignore
import MdEditor from 'react-markdown-editor-lite';
import 'react-markdown-editor-lite/lib/index.css';
import { MarkdownRenderer } from '@/components/ui/markdown-renderer';
import { QuestionRenderer } from '@/components/ui/question-renderer';
import { parseMarkdownToQuestion, ParsedQuestion } from '@/lib/utils/question-parser';
import { questionToMarkdown } from '@/lib/utils/question-to-markdown';
import { VisualQuestionBuilder } from './visual-question-builder';
import { Eye, Code2, Sparkles, Wand2, Split, Maximize2 } from 'lucide-react';
// @ts-ignore
import { debounce } from 'lodash';
import { cn } from '@/lib/utils';

interface QuestionEditorProps {
  initialValue?: string;
  onChange: (question: ParsedQuestion, raw: string) => void;
  isLoading?: boolean;
}

export function QuestionEditor({ initialValue = '', onChange, isLoading }: QuestionEditorProps) {
  const [rawContent, setRawContent] = useState(initialValue);
  const [parsed, setParsed] = useState<ParsedQuestion>(parseMarkdownToQuestion(initialValue));
  const [viewMode, setViewMode] = useState<'split' | 'preview' | 'editor'>('split');
  const [editorMode, setEditorMode] = useState<'markdown' | 'visual'>('markdown');

  // Debounced sync to parent
  const debouncedSync = useCallback(
    debounce((content: string) => {
      const parsedData = parseMarkdownToQuestion(content);
      setParsed(parsedData);
      onChange(parsedData, content);
    }, 400),
    [onChange]
  );

  useEffect(() => {
    if (editorMode === 'markdown') {
      const parsedData = parseMarkdownToQuestion(rawContent);
      setParsed(parsedData);
      // Only trigger onChange if actual content changed, avoiding auto-save on mode switches
      if (rawContent !== initialValue) {
        debouncedSync(rawContent);
      }
    }
  }, [rawContent, debouncedSync, editorMode, initialValue]);

  const handleEditorChange = ({ text }: { text: string }) => {
    setRawContent(text);
  };

  const handleVisualChange = (newData: ParsedQuestion) => {
    setParsed(newData);
    const newMarkdown = questionToMarkdown(newData);
    setRawContent(newMarkdown);
    onChange(newData, newMarkdown); // Sync immediately for visual builder
  };

  return (
    <div className="flex flex-col h-full bg-background border border-border rounded-2xl overflow-hidden shadow-xl transition-all duration-300">
      {/* Toolbar */}
      <div className="shrink-0 h-16 border-b border-border px-8 flex items-center justify-between bg-card/80 backdrop-blur-xl">
        <div className="flex items-center gap-6">
          <div className="flex bg-muted p-1 rounded-2xl border border-border">
            <button 
              type="button"
              onClick={() => setEditorMode('markdown')}
              className={cn(
                "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2",
                editorMode === 'markdown' ? "bg-primary text-primary-foreground shadow-lg" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Code2 size={14} /> MARKDOWN
            </button>
            <button 
              type="button"
              onClick={() => setEditorMode('visual')}
              className={cn(
                "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2",
                editorMode === 'visual' ? "bg-primary text-primary-foreground shadow-lg" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Wand2 size={14} /> VISUAL BUILDER
            </button>
          </div>

          <div className="h-6 w-px bg-border mx-2" />

          <div className="flex bg-muted p-1 rounded-2xl border border-border">
            {[
              { id: 'editor', label: 'EDITOR', icon: Maximize2 },
              { id: 'split', label: 'SPLIT', icon: Split },
              { id: 'preview', label: 'PREVIEW', icon: Eye }
            ].map((mode) => (
              <button 
                key={mode.id}
                type="button"
                onClick={() => setViewMode(mode.id as any)}
                className={cn(
                  "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2",
                  viewMode === mode.id ? "bg-primary text-primary-foreground shadow-lg" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <mode.icon size={14} /> {mode.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-4 py-2 bg-accent/50 rounded-xl border border-primary/20">
             <span className="text-[10px] font-black text-primary uppercase tracking-widest">
               TYPE: {parsed.type}
             </span>
          </div>
          <div className="px-4 py-2 bg-success/10 text-success rounded-xl text-[9px] font-black tracking-widest uppercase border border-success/20 flex items-center gap-2">
             <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
             LIVE SYNC
          </div>
        </div>
      </div>

      {/* Editor Main Section */}
      <div className="flex-1 flex overflow-hidden">
        {(viewMode === 'editor' || viewMode === 'split') && (
          <div className={cn(
            "h-full border-r border-border transition-all duration-300",
            viewMode === 'split' ? "w-1/2" : "w-full"
          )}>
            {editorMode === 'markdown' ? (
              <MdEditor
                value={rawContent}
                style={{ height: '100%', border: 'none' }}
                renderHTML={(text: string) => <MarkdownRenderer content={text} />}
                onChange={handleEditorChange}
                placeholder="Nhập câu hỏi tại đây..."
                config={{
                  view: { menu: false, md: true, html: false },
                  canView: { menu: false, md: true, html: true, fullScreen: false, hideMenu: true }
                }}
              />
            ) : (
              <div className="h-full overflow-y-auto p-6 bg-background">
                <VisualQuestionBuilder 
                  data={parsed}
                  onChange={handleVisualChange}
                />
              </div>
            )}
          </div>
        )}

        {(viewMode === 'preview' || viewMode === 'split') && (
          <div className={cn(
            "h-full overflow-y-auto p-12 bg-background/50 transition-all duration-300",
            viewMode === 'split' ? "w-1/2" : "w-full"
          )}>
            <div className="max-w-2xl mx-auto space-y-10">
               <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 bg-amber-500/10 rounded-2xl flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-amber-500" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-foreground uppercase tracking-widest">Realtime Preview</h3>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">XEM TRƯỚC HIỂN THỊ CỦA CÂU HỎI</p>
                  </div>
               </div>
               
               <div className="bg-card p-10 rounded-[2.5rem] border border-border shadow-2xl relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-2 h-full bg-primary opacity-20 group-hover:opacity-100 transition-opacity" />
                  <QuestionRenderer 
                    question={{
                      id: 'preview',
                      type: parsed.type,
                      content: parsed.content || '*Chưa có nội dung câu hỏi*',
                      metadata: {
                        choices: parsed.choices,
                        correct_answers: parsed.correct_answers,
                        correct_answer: parsed.correct_answer,
                        statements: parsed.statements
                      }
                    }}
                    index={1}
                    showCorrectAnswer={true}
                  />
               </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
