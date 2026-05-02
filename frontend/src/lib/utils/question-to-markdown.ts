import { ParsedQuestion } from './question-parser';

export function questionToMarkdown(parsed: ParsedQuestion): string {
  let markdown = '';

  // Title/Content
  markdown += `# ${parsed.content}\n\n`;

  // Multiple Choice
  if (parsed.type === 'MULTIPLE_CHOICE' && parsed.choices) {
    parsed.choices.forEach((choice) => {
      const isCorrect = parsed.correct_answers?.includes(choice.id);
      markdown += `${isCorrect ? '*' : ''}${choice.id}. ${choice.content}\n`;
    });
  }



  // Group True/False
  if (parsed.type === 'TRUE_FALSE_GROUP' && parsed.statements) {
    parsed.statements.forEach((stmt) => {
      markdown += `[${stmt.id}]\n${stmt.content}\n\n`;
      markdown += `${stmt.correctAnswer === true ? '*' : ''}Đúng\n`;
      markdown += `${stmt.correctAnswer === false ? '*' : ''}Sai\n\n`;
    });
  }

  // ID if exists
  if (parsed.id) {
    markdown += `\n\`\`\` id="${parsed.id}" \`\`\``;
  }

  return markdown.trim();
}
