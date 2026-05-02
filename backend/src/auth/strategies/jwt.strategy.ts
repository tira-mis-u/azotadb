import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { passportJwtSecret } from 'jwks-rsa';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private prisma: PrismaService) {
    // Ưu tiên lấy Project ID từ .env, nếu không có thì dùng mặc định
    const projectId = process.env.SUPABASE_PROJECT_ID || 'ehlrjjlrdkddrjhnafpe';

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      audience: 'authenticated',
      issuer: `https://${projectId}.supabase.co/auth/v1`,
      algorithms: ['RS256', 'HS256', 'ES256'],

      secretOrKeyProvider: passportJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: `https://${projectId}.supabase.co/auth/v1/.well-known/jwks.json`,
      }),
    });
  }

  async validate(payload: any) {
    try {
      const db: any = this.prisma;
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
    } catch (error) {
      console.error('JWT Validation Error:', error);
      throw new UnauthorizedException();
    }
  }
}
