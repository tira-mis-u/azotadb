import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
export declare class ParserService {
    private prisma;
    private configService;
    private readonly logger;
    constructor(prisma: PrismaService, configService: ConfigService);
    processFile(fileId: string): Promise<{
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
    private parseWithAI;
}
