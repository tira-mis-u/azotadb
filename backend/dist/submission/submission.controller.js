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
exports.SubmissionController = void 0;
const common_1 = require("@nestjs/common");
const submission_service_1 = require("./submission.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const optional_jwt_auth_guard_1 = require("../auth/guards/optional-jwt-auth.guard");
const get_user_decorator_1 = require("../common/decorators/get-user.decorator");
let SubmissionController = class SubmissionController {
    submissionService;
    constructor(submissionService) {
        this.submissionService = submissionService;
    }
    getSubmission(id, userId, guestSessionId) {
        return this.submissionService.getSubmission(id, userId, guestSessionId);
    }
    startSubmission(publicId, userId, body) {
        return this.submissionService.startSubmission(publicId, userId, body?.guestName, body?.guestSessionId);
    }
    autosave(id, body, userId) {
        if (!body?.questionId) {
            throw new common_1.BadRequestException('Question ID is required');
        }
        return this.submissionService.autosave(id, body.questionId, body.answer, userId, body.guestSessionId);
    }
    submitExam(id, userId, body) {
        return this.submissionService.submitExam(id, userId, {
            violations: body?.violations,
            candidateNumber: body?.candidateNumber,
            examCode: body?.examCode,
            guestSessionId: body?.guestSessionId,
        });
    }
    getMySubmissions(userId) {
        return this.submissionService.getMySubmissions(userId);
    }
};
exports.SubmissionController = SubmissionController;
__decorate([
    (0, common_1.Get)(':id'),
    (0, common_1.UseGuards)(optional_jwt_auth_guard_1.OptionalJwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, get_user_decorator_1.GetUser)('userId')),
    __param(2, (0, common_1.Query)('guestSessionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], SubmissionController.prototype, "getSubmission", null);
__decorate([
    (0, common_1.Post)('start/:publicId'),
    (0, common_1.UseGuards)(optional_jwt_auth_guard_1.OptionalJwtAuthGuard),
    __param(0, (0, common_1.Param)('publicId')),
    __param(1, (0, get_user_decorator_1.GetUser)('userId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", void 0)
], SubmissionController.prototype, "startSubmission", null);
__decorate([
    (0, common_1.Post)(':id/autosave'),
    (0, common_1.UseGuards)(optional_jwt_auth_guard_1.OptionalJwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, get_user_decorator_1.GetUser)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String]),
    __metadata("design:returntype", void 0)
], SubmissionController.prototype, "autosave", null);
__decorate([
    (0, common_1.Post)(':id/submit'),
    (0, common_1.UseGuards)(optional_jwt_auth_guard_1.OptionalJwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, get_user_decorator_1.GetUser)('userId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", void 0)
], SubmissionController.prototype, "submitExam", null);
__decorate([
    (0, common_1.Get)('my/list'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, get_user_decorator_1.GetUser)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SubmissionController.prototype, "getMySubmissions", null);
exports.SubmissionController = SubmissionController = __decorate([
    (0, common_1.Controller)('submissions'),
    __metadata("design:paramtypes", [submission_service_1.SubmissionService])
], SubmissionController);
//# sourceMappingURL=submission.controller.js.map