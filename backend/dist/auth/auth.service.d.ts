import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { CreateAuthDto } from './dto/create-auth.dto';
import { LoginDto } from './dto/login.dto';
import { Role } from '@prisma/client';
export declare class AuthService {
    private prisma;
    private jwtService;
    constructor(prisma: PrismaService, jwtService: JwtService);
    syncWithToken(token: string): Promise<any>;
    syncSupabaseUser(supabaseUser: {
        authId: string;
        email: string;
    }): Promise<any>;
    register(dto: CreateAuthDto): Promise<any>;
    login(dto: LoginDto): Promise<{
        access_token: string;
        user: {
            id: string;
            email: string;
            role: import("@prisma/client").$Enums.Role;
            activeRole: any;
        };
    }>;
    toggleRole(userId: string, role: Role): Promise<any>;
}
