"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParserController = void 0;
const common_1 = require("@nestjs/common");
const parser_service_1 = require("./parser.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const get_user_decorator_1 = require("../common/decorators/get-user.decorator");
const prisma_service_1 = require("../prisma/prisma.service");
let ParserController = class ParserController {
    parserService;
    prisma;
    constructor(parserService, prisma) {
        this.parserService = parserService;
        this.prisma = prisma;
    }
    async uploadFile(userId, body) {
        return this.prisma.uploadedFile.create({
            data: {
                userId,
                fileUrl: body.fileUrl,
                status: 'PENDING',
            },
        });
    }
    async processFile(id) {
        return this.parserService.processFile(id);
    }
    async getFile(id) {
        return this.prisma.uploadedFile.findUnique({
            where: { id },
        });
    }
};
exports.ParserController = ParserController;
__decorate([
    (0, common_1.Post)('upload'),
    __param(0, (0, get_user_decorator_1.GetUser)('userId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ParserController.prototype, "uploadFile", null);
__decorate([
    (0, common_1.Post)('process/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ParserController.prototype, "processFile", null);
__decorate([
    (0, common_1.Get)('file/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ParserController.prototype, "getFile", null);
exports.ParserController = ParserController = __decorate([
    (0, common_1.Controller)('parser'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('TEACHER', 'ADMIN'),
    __metadata("design:paramtypes", [parser_service_1.ParserService,
        prisma_service_1.PrismaService])
], ParserController);
//# sourceMappingURL=parser.controller.js.map