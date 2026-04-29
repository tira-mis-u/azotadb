import { Controller, Post, Patch, Body, UseGuards, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Role } from '@prisma/client';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // ─── Legacy Email/Password ─────────────────────────────────────────────────
  @Post('register')
  register(@Body() dto: CreateAuthDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  // ─── Supabase Sync (gọi ngay sau khi Supabase cấp token) ──────────────────
  @UseGuards(JwtAuthGuard)
  @Post('sync')
  syncUser(@Req() req: any) {
    return this.authService.syncSupabaseUser(req.user);
  }

  // ─── Toggle Role (Teacher ↔ Student) ──────────────────────────────────────
  @UseGuards(JwtAuthGuard)
  @Patch('toggle-role')
  toggleRole(@Req() req: any, @Body('role') role: Role) {
    return this.authService.toggleRole(req.user.userId, role);
  }
}
