import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeHighlight from 'rehype-highlight';

// Import highlight.js styles
import 'highlight.js/styles/github-dark.css';
import 'katex/dist/katex.min.css';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
  return (
    <div className={`prose prose-sm md:prose-base dark:prose-invert max-w-none 
      prose-p:leading-relaxed prose-pre:p-0 prose-pre:bg-transparent
      prose-a:text-indigo-600 dark:prose-a:text-indigo-400
      prose-headings:font-bold prose-h1:text-xl prose-h2:text-lg
      prose-code:text-indigo-600 dark:prose-code:text-indigo-400 prose-code:bg-indigo-50 dark:prose-code:bg-indigo-900/30 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:before:content-none prose-code:after:content-none
      ${className}`}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeHighlight, rehypeKatex]}
        components={{
          pre: ({ node, ...props }) => (
            <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800 bg-[#0d1117] my-4 shadow-sm">
              <div className="flex items-center px-4 py-2 bg-gray-100 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-400/80"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-400/80"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400/80"></div>
                </div>
              </div>
              <div className="p-4 overflow-x-auto text-sm">
                <pre {...props} />
              </div>
            </div>
          ),
          code: ({ node, inline, className, children, ...props }: any) => {
            const match = /language-(\w+)/.exec(className || '');
            return !inline ? (
              <code className={className} {...props}>
                {children}
              </code>
            ) : (
              <code className={className} {...props}>
                {children}
              </code>
            );
          }
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
