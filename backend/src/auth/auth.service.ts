import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { CreateAuthDto } from './dto/create-auth.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  // ─── Legacy Email/Password Auth (vẫn hoạt động) ───────────────────────────
  async register(dto: CreateAuthDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new BadRequestException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash: hashedPassword,
        role: (dto.role as Role) || Role.STUDENT,
        activeRole: Role.STUDENT,
        oauthProvider: 'email',
      },
    });

    return this.generateToken(user);
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.generateToken(user);
  }

  // ─── Supabase Auth Sync ────────────────────────────────────────────────────
  async syncSupabaseUser(jwtPayload: any) {
    // Case 1: User không tồn tại trong Prisma (login Google lần đầu)
    if (jwtPayload.isNew) {
      const newUser = await this.prisma.user.create({
        data: {
          email: jwtPayload.email,
          authId: jwtPayload.authId,
          role: Role.STUDENT,
          activeRole: Role.STUDENT,
          oauthProvider: 'google',
        },
      });
      return { user: newUser, isNew: true };
    }

    // Case 2: User đã tồn tại (đã có trong Prisma), trả về profile hiện tại
    return { user: jwtPayload, isNew: false };
  }

  // ─── Toggle Role (Teacher ↔ Student) ──────────────────────────────────────
  async toggleRole(userId: string, targetRole: Role) {
    // Cho phép mọi user switch mode (Teacher/Student).
    // Logic phân quyền thực sự vẫn nằm ở field `role` (max permission).
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { activeRole: targetRole },
      select: { id: true, email: true, role: true, activeRole: true },
    });

    return user;
  }

  // ─── Internal helper ──────────────────────────────────────────────────────
  private generateToken(user: any) {
    const payload = { sub: user.id, email: user.email, role: user.role, activeRole: user.activeRole };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        activeRole: user.activeRole,
      },
    };
  }
}
