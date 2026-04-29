import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { CreateAuthDto } from './dto/create-auth.dto';
import { LoginDto } from './dto/login.dto';
import { Role } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async syncWithToken(token: string) {
    try {
      console.log('--- SYNC ATTEMPT ---');
      const payload = this.jwtService.decode(token) as any;
      console.log('Payload decoded:', payload?.email);
      
      if (!payload) throw new Error('Token không hợp lệ hoặc rỗng');
      
      const result = await this.syncSupabaseUser({
        authId: payload.sub,
        email: payload.email,
      });
      console.log('Sync Successful for:', result.email);
      return result;
    } catch (error) {
      console.error('CRITICAL SYNC ERROR:', error);
      throw new UnauthorizedException('Không thể đồng bộ: ' + error.message);
    }
  }

  // ─── Supabase Sync Logic ──────────────────────────────────────────────────
  async syncSupabaseUser(supabaseUser: { authId: string; email: string }) {
    const db: any = this.prisma; // Ép kiểu để tránh lỗi IDE cache
    
    let user = await db.user.findFirst({
      where: {
        OR: [
          { authId: supabaseUser.authId },
          { email: supabaseUser.email },
        ],
      },
    });

    if (!user) {
      // Tạo mới nếu chưa có
      user = await db.user.create({
        data: {
          authId: supabaseUser.authId,
          email: supabaseUser.email,
          activeRole: 'STUDENT',
          role: 'STUDENT',
        },
      });
    } else if (!user.authId) {
      // Liên kết tài khoản cũ với Supabase
      user = await db.user.update({
        where: { id: user.id },
        data: { authId: supabaseUser.authId },
      });
    }

    return user;
  }

  // ─── Legacy Email/Password Auth ───────────────────────────────────────────
  async register(dto: CreateAuthDto) {
    const existingUser = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existingUser) throw new ConflictException('Email already exists');

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const db: any = this.prisma;
    
    return db.user.create({
      data: {
        email: dto.email,
        passwordHash: hashedPassword,
        role: 'STUDENT',
        activeRole: 'STUDENT',
      },
    });
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user || !user.passwordHash) throw new UnauthorizedException('Invalid credentials');

    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isPasswordValid) throw new UnauthorizedException('Invalid credentials');

    const payload = { sub: user.id, email: user.email, role: user.role };
    return {
      access_token: await this.jwtService.signAsync(payload),
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        activeRole: (user as any).activeRole,
      },
    };
  }

  async toggleRole(userId: string, role: Role) {
    const db: any = this.prisma;
    return db.user.update({
      where: { id: userId },
      data: { activeRole: role },
    });
  }
}
