export interface ParsedQuestion {
  content: string;
  type: 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'TRUE_FALSE_GROUP' | 'ESSAY';
  choices?: { id: string; content: string }[];
  correct_answers?: string[];
  correct_answer?: boolean;
  statements?: { id: string; content: string; correctAnswer: boolean }[];
  id?: string;
}

export function parseMarkdownToQuestion(markdown: string): ParsedQuestion {
  const lines = markdown.trim().split('\n');
  let contentLines: string[] = [];
  let choices: { id: string; content: string }[] = [];
  let correctAnswers: string[] = [];
  let statements: { id: string; content: string; correctAnswer: boolean }[] = [];
  let isTrueFalse = false;
  let isGroupTF = false;
  let customId = '';

  // Extract ID from footer if exists: ``` id="abc"
  const idMatch = markdown.match(/``` id="([^"]+)"/);
  if (idMatch) customId = idMatch[1];

  let currentStatement: { id: string; content: string[]; correctAnswer?: boolean } | null = null;
  let foundAnswers = false;

  for (let line of lines) {
    const trimmedLine = line.trim();
    
    if (trimmedLine.startsWith('``` id=')) continue;

    // Detect [a], [b], [c]... for TRUE_FALSE_GROUP
    const groupMatch = trimmedLine.match(/^\[([a-z])\]$/i);
    if (groupMatch) {
      isGroupTF = true;
      foundAnswers = true;
      if (currentStatement) {
        statements.push({
          id: currentStatement.id,
          content: currentStatement.content.join('\n').trim(),
          correctAnswer: currentStatement.correctAnswer ?? true
        });
      }
      currentStatement = { id: groupMatch[1], content: [] };
      continue;
    }

    if (isGroupTF && currentStatement) {
      const tfMatch = trimmedLine.match(/^(\*)?(Đúng|Sai)$/i);
      if (tfMatch) {
        if (tfMatch[1]) {
          currentStatement.correctAnswer = tfMatch[2].toLowerCase() === 'đúng';
        }
        continue;
      }
      currentStatement.content.push(line);
      continue;
    }

    // Check Multiple Choice: *A. Content
    const mcMatch = trimmedLine.match(/^(\*)?([A-Z])\.\s*(.*)/);
    if (mcMatch && !isGroupTF) {
      foundAnswers = true;
      const [_, isCorrect, label, choiceContent] = mcMatch;
      choices.push({ id: label, content: choiceContent });
      if (isCorrect) correctAnswers.push(label);
      continue;
    }

    // Check Single True/False: *Đúng, Đúng, *Sai, Sai
    const tfMatch = trimmedLine.match(/^(\*)?(Đúng|Sai)$/i);
    if (tfMatch && !foundAnswers && !isGroupTF) {
      foundAnswers = true;
      isTrueFalse = true;
      const [_, isCorrect, value] = tfMatch;
      if (isCorrect) {
        correctAnswers = [value.toLowerCase() === 'đúng' ? 'true' : 'false'];
      }
      continue;
    }

    if (!foundAnswers) {
      contentLines.push(line);
    }
  }

  // Push last statement if exists
  if (currentStatement) {
    statements.push({
      id: currentStatement.id,
      content: currentStatement.content.join('\n').trim(),
      correctAnswer: currentStatement.correctAnswer ?? true
    });
  }

  const finalContent = contentLines.join('\n').trim();
  
  if (isGroupTF) {
    return {
      content: finalContent,
      type: 'TRUE_FALSE_GROUP',
      statements,
      id: customId
    };
  }

  if (isTrueFalse) {
    return {
      content: finalContent,
      type: 'TRUE_FALSE',
      correct_answer: correctAnswers[0] === 'true',
      id: customId
    };
  }

  return {
    content: finalContent,
    type: choices.length > 0 ? 'MULTIPLE_CHOICE' : 'ESSAY',
    choices: choices.length > 0 ? choices : undefined,
    correct_answers: correctAnswers.length > 0 ? correctAnswers : undefined,
    id: customId
  };
}
