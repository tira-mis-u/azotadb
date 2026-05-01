import { ParserService } from './parser.service';
import { PrismaService } from '../prisma/prisma.service';
export declare class ParserController {
    private readonly parserService;
    private prisma;
    constructor(parserService: ParserService, prisma: PrismaService);
    uploadFile(userId: string, body: {
        fileUrl: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        status: string;
        fileUrl: string;
        rawText: string | null;
        parsedJson: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
    processFile(id: string): Promise<{
        questions: {
            type: string;
            content: string;
            points: number;
            metadata: {
                choices: {
                    id: string;
                    content: string;
                }[];
                correct_answers: string[];
                explanation: string;
            };
        }[];
    }>;
    getFile(id: string): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        status: string;
        fileUrl: string;
        rawText: string | null;
        parsedJson: import("@prisma/client/runtime/library").JsonValue | null;
    } | null>;
}
