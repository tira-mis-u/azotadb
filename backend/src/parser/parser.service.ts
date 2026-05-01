import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as Tesseract from 'tesseract.js';
import * as pdf from 'pdf-parse';
import * as mammoth from 'mammoth';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ParserService {
  private readonly logger = new Logger(ParserService.name);

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {}

  async processFile(fileId: string) {
    const file = await this.prisma.uploadedFile.findUnique({ where: { id: fileId } });
    if (!file) throw new Error('File not found');

    await this.prisma.uploadedFile.update({
      where: { id: fileId },
      data: { status: 'PROCESSING' },
    });

    try {
      // 1. Download file content
      const response = await axios.get(file.fileUrl, { responseType: 'arraybuffer' });
      const buffer = Buffer.from(response.data);

      let extractedText = '';

      // 2. Extract text based on file type
      const extension = file.fileUrl.split('.').pop()?.toLowerCase() || '';

      if (extension === 'pdf') {
        const data = await pdf(buffer);
        extractedText = data.text;
      } else if (['docx', 'doc'].includes(extension)) {
        const data = await mammoth.extractRawText({ buffer });
        extractedText = data.value;
      } else if (['png', 'jpg', 'jpeg'].includes(extension)) {
        const { data: { text } } = await Tesseract.recognize(buffer, 'vie+eng');
        extractedText = text;
      } else {
        extractedText = buffer.toString('utf-8');
      }

      await this.prisma.uploadedFile.update({
        where: { id: fileId },
        data: { rawText: extractedText },
      });

      // 3. AI Parsing
      const parsedJson = await this.parseWithAI(extractedText);

      await this.prisma.uploadedFile.update({
        where: { id: fileId },
        data: {
          parsedJson: parsedJson as any,
          status: 'DONE',
        },
      });

      return parsedJson;
    } catch (error) {
      this.logger.error('Failed to process file:', error);
      await this.prisma.uploadedFile.update({
        where: { id: fileId },
        data: { status: 'FAILED' },
      });
      throw error;
    }
  }

  private async parseWithAI(text: string) {
    const apiKey = this.configService.get('GEMINI_API_KEY') || this.configService.get('OPENAI_API_KEY');
    
    if (!apiKey) {
      this.logger.warn('AI API Key not found. Returning empty structure.');
      return { questions: [] };
    }

    // This is a placeholder for actual AI call
    // In production, you would call OpenAI/Gemini API here
    
    // Example prompt:
    /*
    Parse the following exam text into a JSON format:
    {
      "questions": [
        {
          "type": "MULTIPLE_CHOICE",
          "content": "...",
          "points": 1.0,
          "metadata": {
            "choices": [{"id": "A", "content": "..."}, ...],
            "correct_answers": ["A"],
            "explanation": "..."
          }
        }
      ]
    }
    Text: ${text}
    */

    return {
      questions: [
        {
          type: 'MULTIPLE_CHOICE',
          content: 'Câu hỏi mẫu từ AI (Cần cấu hình API Key)',
          points: 1.0,
          metadata: {
            choices: [
              { id: 'A', content: 'Đáp án A' },
              { id: 'B', content: 'Đáp án B' },
              { id: 'C', content: 'Đáp án C' },
              { id: 'D', content: 'Đáp án D' },
            ],
            correct_answers: ['A'],
            explanation: 'Giải thích mẫu...',
          },
        },
      ],
    };
  }
}
