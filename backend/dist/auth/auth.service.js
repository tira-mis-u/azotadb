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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const jwt_1 = require("@nestjs/jwt");
const bcrypt = __importStar(require("bcrypt"));
let AuthService = class AuthService {
    prisma;
    jwtService;
    constructor(prisma, jwtService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
    }
    async syncWithToken(token) {
        try {
            console.log('--- SYNC ATTEMPT ---');
            const payload = this.jwtService.decode(token);
            console.log('Payload decoded:', payload?.email);
            if (!payload)
                throw new Error('Token không hợp lệ hoặc rỗng');
            const result = await this.syncSupabaseUser({
                authId: payload.sub,
                email: payload.email,
            });
            console.log('Sync Successful for:', result.email);
            return result;
        }
        catch (error) {
            console.error('CRITICAL SYNC ERROR:', error);
            throw new common_1.UnauthorizedException('Không thể đồng bộ: ' + error.message);
        }
    }
    async syncSupabaseUser(supabaseUser) {
        const db = this.prisma;
        let user = await db.user.findFirst({
            where: {
                OR: [{ authId: supabaseUser.authId }, { email: supabaseUser.email }],
            },
        });
        if (!user) {
            user = await db.user.create({
                data: {
                    authId: supabaseUser.authId,
                    email: supabaseUser.email,
                    activeRole: 'STUDENT',
                    role: 'STUDENT',
                },
            });
        }
        else if (!user.authId) {
            user = await db.user.update({
                where: { id: user.id },
                data: { authId: supabaseUser.authId },
            });
        }
        return user;
    }
    async register(dto) {
        const existingUser = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });
        if (existingUser)
            throw new common_1.ConflictException('Email already exists');
        const hashedPassword = await bcrypt.hash(dto.password, 10);
        const db = this.prisma;
        return db.user.create({
            data: {
                email: dto.email,
                passwordHash: hashedPassword,
                role: 'STUDENT',
                activeRole: 'STUDENT',
            },
        });
    }
    async login(dto) {
        const user = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });
        if (!user || !user.passwordHash)
            throw new common_1.UnauthorizedException('Invalid credentials');
        const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
        if (!isPasswordValid)
            throw new common_1.UnauthorizedException('Invalid credentials');
        const payload = { sub: user.id, email: user.email, role: user.role };
        return {
            access_token: await this.jwtService.signAsync(payload),
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                activeRole: user.activeRole,
            },
        };
    }
    async toggleRole(userId, role) {
        const db = this.prisma;
        return db.user.update({
            where: { id: userId },
            data: { activeRole: role },
        });
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map