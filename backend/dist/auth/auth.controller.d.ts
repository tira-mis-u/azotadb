import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { LoginDto } from './dto/login.dto';
import { Role } from '@prisma/client';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(dto: CreateAuthDto): Promise<{
        access_token: string;
        user: {
            id: any;
            email: any;
            role: any;
            activeRole: any;
        };
    }>;
    login(dto: LoginDto): Promise<{
        access_token: string;
        user: {
            id: any;
            email: any;
            role: any;
            activeRole: any;
        };
    }>;
    syncUser(req: any): Promise<{
        user: any;
        isNew: boolean;
    }>;
    toggleRole(req: any, role: Role): Promise<{
        email: string;
        role: import("@prisma/client").$Enums.Role;
        id: string;
        activeRole: import("@prisma/client").$Enums.Role;
    }>;
}
