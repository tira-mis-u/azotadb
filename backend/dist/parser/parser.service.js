"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var ParserService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParserService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const Tesseract = __importStar(require("tesseract.js"));
const pdf = __importStar(require("pdf-parse"));
const mammoth = __importStar(require("mammoth"));
const axios_1 = __importDefault(require("axios"));
const config_1 = require("@nestjs/config");
let ParserService = ParserService_1 = class ParserService {
    prisma;
    configService;
    logger = new common_1.Logger(ParserService_1.name);
    constructor(prisma, configService) {
        this.prisma = prisma;
        this.configService = configService;
    }
    async processFile(fileId) {
        const file = await this.prisma.uploadedFile.findUnique({ where: { id: fileId } });
        if (!file)
            throw new Error('File not found');
        await this.prisma.uploadedFile.update({
            where: { id: fileId },
            data: { status: 'PROCESSING' },
        });
        try {
            const response = await axios_1.default.get(file.fileUrl, { responseType: 'arraybuffer' });
            const buffer = Buffer.from(response.data);
            let extractedText = '';
            const extension = file.fileUrl.split('.').pop()?.toLowerCase() || '';
            if (extension === 'pdf') {
                const data = await pdf(buffer);
                extractedText = data.text;
            }
            else if (['docx', 'doc'].includes(extension)) {
                const data = await mammoth.extractRawText({ buffer });
                extractedText = data.value;
            }
            else if (['png', 'jpg', 'jpeg'].includes(extension)) {
                const { data: { text } } = await Tesseract.recognize(buffer, 'vie+eng');
                extractedText = text;
            }
            else {
                extractedText = buffer.toString('utf-8');
            }
            await this.prisma.uploadedFile.update({
                where: { id: fileId },
                data: { rawText: extractedText },
            });
            const parsedJson = await this.parseWithAI(extractedText);
            await this.prisma.uploadedFile.update({
                where: { id: fileId },
                data: {
                    parsedJson: parsedJson,
                    status: 'DONE',
                },
            });
            return parsedJson;
        }
        catch (error) {
            this.logger.error('Failed to process file:', error);
            await this.prisma.uploadedFile.update({
                where: { id: fileId },
                data: { status: 'FAILED' },
            });
            throw error;
        }
    }
    async parseWithAI(text) {
        const apiKey = this.configService.get('GEMINI_API_KEY') || this.configService.get('OPENAI_API_KEY');
        if (!apiKey) {
            this.logger.warn('AI API Key not found. Returning empty structure.');
            return { questions: [] };
        }
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
};
exports.ParserService = ParserService;
exports.ParserService = ParserService = ParserService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        config_1.ConfigService])
], ParserService);
//# sourceMappingURL=parser.service.js.map