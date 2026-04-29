import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { LoginDto } from './dto/login.dto';
import { Role } from '@prisma/client';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
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
    syncUser(req: any, accessToken: string): Promise<any>;
    toggleRole(req: any, role: Role): Promise<any>;
}
