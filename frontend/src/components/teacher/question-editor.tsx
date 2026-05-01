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
import { Button } from '@/components/ui/button';
import { Save, Settings2, Eye, Code2, Sparkles, Wand2 } from 'lucide-react';
// @ts-ignore
import { debounce } from 'lodash';

interface QuestionEditorProps {
  initialValue?: string;
  onSave: (question: ParsedQuestion, raw: string) => void;
  isLoading?: boolean;
}

export function QuestionEditor({ initialValue = '', onSave, isLoading }: QuestionEditorProps) {
  const [rawContent, setRawContent] = useState(initialValue);
  const [parsed, setParsed] = useState<ParsedQuestion>(parseMarkdownToQuestion(initialValue));
  const [viewMode, setViewMode] = useState<'split' | 'preview' | 'editor'>('split');
  const [editorMode, setEditorMode] = useState<'markdown' | 'visual'>('markdown');

  // Debounced parsing for performance
  const delayedParse = useCallback(
    debounce((content: string) => {
      setParsed(parseMarkdownToQuestion(content));
    }, 300),
    []
  );

  useEffect(() => {
    if (editorMode === 'markdown') {
      delayedParse(rawContent);
    }
  }, [rawContent, delayedParse, editorMode]);

  const handleEditorChange = ({ text }: { text: string }) => {
    setRawContent(text);
  };

  const handleVisualChange = (newData: ParsedQuestion) => {
    setParsed(newData);
    const newMarkdown = questionToMarkdown(newData);
    setRawContent(newMarkdown);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-3xl overflow-hidden shadow-2xl">
      {/* Toolbar */}
      <div className="shrink-0 h-14 border-b border-gray-100 dark:border-gray-800 px-6 flex items-center justify-between bg-gray-50/50 dark:bg-gray-900/50 backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <div className="flex bg-gray-200/50 dark:bg-gray-800 p-1 rounded-xl">
            <button 
              onClick={() => setEditorMode('markdown')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${editorMode === 'markdown' ? 'bg-white dark:bg-gray-700 shadow-sm text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <Code2 className="w-3.5 h-3.5 inline mr-1.5" /> Markdown
            </button>
            <button 
              onClick={() => setEditorMode('visual')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${editorMode === 'visual' ? 'bg-white dark:bg-gray-700 shadow-sm text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <Wand2 className="w-3.5 h-3.5 inline mr-1.5" /> Visual Builder
            </button>
          </div>

          <div className="h-4 w-[1px] bg-gray-200 dark:bg-gray-700 mx-2" />

          <div className="flex bg-gray-200/50 dark:bg-gray-800 p-1 rounded-xl">
            <button 
              onClick={() => setViewMode('editor')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${viewMode === 'editor' ? 'bg-white dark:bg-gray-700 shadow-sm text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Editor
            </button>
            <button 
              onClick={() => setViewMode('split')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${viewMode === 'split' ? 'bg-white dark:bg-gray-700 shadow-sm text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Split
            </button>
            <button 
              onClick={() => setViewMode('preview')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${viewMode === 'preview' ? 'bg-white dark:bg-gray-700 shadow-sm text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <Eye className="w-3.5 h-3.5 inline mr-1.5" /> Preview
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
            Type: {parsed.type}
          </span>
          <Button 
            onClick={() => onSave(parsed, rawContent)} 
            disabled={isLoading}
            size="sm" 
            className="rounded-xl gap-2 bg-indigo-600 hover:bg-indigo-700 text-xs font-bold shadow-lg shadow-indigo-500/20"
          >
            <Save className="w-3.5 h-3.5" /> {isLoading ? 'Đang lưu...' : 'Lưu câu hỏi'}
          </Button>
        </div>
      </div>

      {/* Editor Main Section */}
      <div className="flex-1 flex overflow-hidden">
        {(viewMode === 'editor' || viewMode === 'split') && (
          <div className={`${viewMode === 'split' ? 'w-1/2' : 'w-full'} h-full border-r border-gray-100 dark:border-gray-800`}>
            {editorMode === 'markdown' ? (
              <MdEditor
                value={rawContent}
                style={{ height: '100%', border: 'none' }}
                renderHTML={(text: string) => <MarkdownRenderer content={text} />}
                onChange={handleEditorChange}
                placeholder="Nhập câu hỏi theo định dạng:
# Câu hỏi
*A. Đáp án đúng
B. Đáp án sai
...
``` id='abc' ```"
                config={{
                  view: { menu: true, md: true, html: false },
                  canView: { menu: true, md: true, html: true, fullScreen: false, hideMenu: false }
                }}
              />
            ) : (
              <VisualQuestionBuilder 
                data={parsed}
                onChange={handleVisualChange}
              />
            )}
          </div>
        )}

        {(viewMode === 'preview' || viewMode === 'split') && (
          <div className={`${viewMode === 'split' ? 'w-1/2' : 'w-full'} h-full overflow-y-auto p-8 bg-gray-50/30 dark:bg-gray-950/30`}>
            <div className="max-w-2xl mx-auto space-y-8">
               <div className="flex items-center gap-2 mb-6">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Realtime Preview</h3>
               </div>
               
               <div className="bg-white dark:bg-gray-900 p-8 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
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
