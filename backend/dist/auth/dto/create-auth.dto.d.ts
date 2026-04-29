import { Role } from '@prisma/client';
export declare class CreateAuthDto {
    email: string;
    password: string;
    role?: Role;
}
