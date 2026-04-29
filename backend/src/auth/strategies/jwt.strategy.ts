import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'secretKey',
    });
  }

  async validate(payload: any) {
    // Payload from Supabase JWT will have sub (authId) and email
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { authId: payload.sub },
          { email: payload.email }
        ]
      }
    });

    if (!user) {
      // Return basic info so /auth/sync can create the user
      return { authId: payload.sub, email: payload.email, isNew: true };
    }

    return { 
      userId: user.id, 
      authId: user.authId,
      email: user.email, 
      role: user.role,
      activeRole: user.activeRole
    };
  }
}
