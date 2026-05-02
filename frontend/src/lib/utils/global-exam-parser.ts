import { parseMarkdownToQuestion, ParsedQuestion } from './question-parser';

export interface ParsedExam {
  title: string;
  description: string;
  mode: 'PRACTICE' | 'STANDARD' | 'THPTQG';
  durationValue: number;
  durationUnit: 'MINUTE' | 'HOUR' | 'DAY' | 'WEEK' | 'MONTH';
  maxScore: number;
  items: (ParsedQuestion | { type: 'SECTION'; content: string })[];
}

export function parseGlobalMarkdown(markdown: string): ParsedExam {
  // Normalize dividers: Replace '---' or 'Câu X:' with a unified split token
  const normalizedMarkdown = markdown
    .replace(/\n---+\n/g, '\n__SPLIT__\n')
    .replace(/\n((?:Câu|Bài)\s*\d+[:.])/gi, '\n__SPLIT__\n$1');

  let sections = normalizedMarkdown.split('\n__SPLIT__\n');

  // If the text starts directly with 'Câu X' without a header
  if (/^(?:Câu|Bài)\s*\d+[:.]/i.test(sections[0])) {
    sections = ['', sections[0], ...sections.slice(1)];
  }

  // Section 0: Header (Title, Description, Metadata)
  const headerSection = sections[0] || '';
  const headerLines = headerSection.trim().split('\n');
  
  let title = '';
  let description = '';
  let mode: any = 'STANDARD';
  let durationValue = 60;
  let durationUnit: any = 'MINUTE';
  let maxScore = 10;
  
  const descLines: string[] = [];
  
  headerLines.forEach(line => {
    const trimmed = line.trim();
    if (trimmed.startsWith('# ')) {
      title = trimmed.replace('# ', '');
    } else if (trimmed.startsWith('@mode:')) {
      mode = trimmed.replace('@mode:', '').trim().toUpperCase();
    } else if (trimmed.startsWith('@duration:')) {
      const parts = trimmed.replace('@duration:', '').trim().split(' ');
      durationValue = parseInt(parts[0]) || 60;
      durationUnit = (parts[1] || 'MINUTE').toUpperCase();
    } else if (trimmed.startsWith('@maxScore:')) {
      maxScore = parseFloat(trimmed.replace('@maxScore:', '').trim()) || 10;
    } else if (trimmed.startsWith('> ')) {
      descLines.push(trimmed.replace('> ', ''));
    } else if (trimmed !== '') {
      descLines.push(trimmed);
    }
  });

  description = descLines.join('\n');

  // Remaining sections: Questions or Section Headers
  const itemSections = sections.slice(1);
  const items: (ParsedQuestion | { type: 'SECTION'; content: string })[] = itemSections
    .map(section => {
      const trimmed = section.trim();
      if (trimmed.startsWith('# ')) {
        return { type: 'SECTION' as const, content: trimmed.replace('# ', '') };
      }
      return parseMarkdownToQuestion(section);
    })
    .filter(item => item.content !== '');

  return {
    title: title || 'Đề thi không tên',
    description,
    mode: ['PRACTICE', 'STANDARD', 'THPTQG'].includes(mode) ? mode : 'STANDARD',
    durationValue,
    durationUnit: ['MINUTE', 'HOUR', 'DAY', 'WEEK', 'MONTH'].includes(durationUnit) ? durationUnit : 'MINUTE',
    maxScore,
    items
  };
}

export function examToMarkdown(exam: ParsedExam): string {
  let md = `# ${exam.title}\n`;
  if (exam.description) {
    md += exam.description.split('\n').map(l => `> ${l}`).join('\n') + '\n';
  }
  md += `\n@mode: ${exam.mode}\n`;
  md += `@duration: ${exam.durationValue} ${exam.durationUnit}\n`;
  md += `@maxScore: ${exam.maxScore}\n\n`;

  const items = exam.items || (exam as any).questions || [];

  items.forEach((item: any) => {
    md += '---\n';
    if (item.type === 'SECTION') {
      md += `# ${item.content}\n`;
    } else {
      const q = item as ParsedQuestion;
      md += `## Câu [${q.type}]\n`;
      md += q.content + '\n\n';
      
      if (q.type === 'MULTIPLE_CHOICE') {
        q.choices?.forEach(c => {
          const isCorrect = q.correct_answers?.includes(c.id);
          md += `${isCorrect ? '*' : ''}${c.id}. ${c.content}\n`;
        });
      } else if (q.type === 'TRUE_FALSE_GROUP') {
        q.statements?.forEach(s => {
          md += `[${s.id}]\n${s.content}\n${s.correctAnswer ? '*Đúng' : 'Đúng'}\n${!s.correctAnswer ? '*Sai' : 'Sai'}\n\n`;
        });
      }
    }
    md += '\n';
  });

  return md;
}
