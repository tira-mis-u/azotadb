import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './strategies/jwt.strategy';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [
    PassportModule,
    PrismaModule,
    JwtModule.registerAsync({
      useFactory: () => {
        let secret = (process.env.JWT_SECRET || 'secretKey').trim();
        secret = secret.replace(/^["']|["']$/g, '');
        return {
          secret:
            secret.length >= 64 &&
            (secret.includes('+') ||
              secret.includes('/') ||
              secret.endsWith('='))
              ? Buffer.from(secret, 'base64')
              : secret,
          signOptions: {
            expiresIn: '7d',
            // Tạm thời bỏ qua audience để debug
          },
        };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
})
export class AuthModule {}
