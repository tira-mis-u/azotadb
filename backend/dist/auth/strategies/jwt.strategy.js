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
Object.defineProperty(exports, "__esModule", { value: true });
exports.JwtStrategy = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const passport_jwt_1 = require("passport-jwt");
const jwks_rsa_1 = require("jwks-rsa");
const prisma_service_1 = require("../../prisma/prisma.service");
let JwtStrategy = class JwtStrategy extends (0, passport_1.PassportStrategy)(passport_jwt_1.Strategy) {
    prisma;
    constructor(prisma) {
        const projectId = process.env.SUPABASE_PROJECT_ID || 'ehlrjjlrdkddrjhnafpe';
        super({
            jwtFromRequest: passport_jwt_1.ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            audience: 'authenticated',
            issuer: `https://${projectId}.supabase.co/auth/v1`,
            algorithms: ['RS256', 'HS256', 'ES256'],
            secretOrKeyProvider: (0, jwks_rsa_1.passportJwtSecret)({
                cache: true,
                rateLimit: true,
                jwksRequestsPerMinute: 5,
                jwksUri: `https://${projectId}.supabase.co/auth/v1/.well-known/jwks.json`,
            }),
        });
        this.prisma = prisma;
    }
    async validate(payload) {
        try {
            const db = this.prisma;
            const user = await db.user.findFirst({
                where: {
                    OR: [{ authId: payload.sub }, { email: payload.email }],
                },
            });
            if (!user) {
                return { authId: payload.sub, email: payload.email, isNew: true };
            }
            return {
                userId: user.id,
                authId: user['authId'],
                email: user.email,
                role: user.role,
                activeRole: user['activeRole'],
            };
        }
        catch (error) {
            console.error('JWT Validation Error:', error);
            throw new common_1.UnauthorizedException();
        }
    }
};
exports.JwtStrategy = JwtStrategy;
exports.JwtStrategy = JwtStrategy = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], JwtStrategy);
//# sourceMappingURL=jwt.strategy.js.map