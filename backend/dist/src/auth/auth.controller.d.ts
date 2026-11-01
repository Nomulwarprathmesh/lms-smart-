import { Role } from '@prisma/client';
import { AuthService } from './auth.service';
import { AuthUser } from './current-user.decorator';
declare class LoginDto {
    identifier: string;
    password: string;
    role?: Role;
}
declare class ChangePasswordDto {
    currentPassword: string;
    newPassword: string;
}
export declare class AuthController {
    private auth;
    constructor(auth: AuthService);
    login(dto: LoginDto): Promise<{
        accessToken: string;
        user: {
            id: string;
            name: string;
            email: string;
            role: import(".prisma/client").$Enums.Role;
            mustChangePassword: boolean;
        };
    }>;
    changePassword(user: AuthUser, dto: ChangePasswordDto): Promise<{
        message: string;
    }>;
    me(user: AuthUser): import(".prisma/client").Prisma.Prisma__UserClient<{
        id: string;
        name: string;
        email: string;
        role: import(".prisma/client").$Enums.Role;
        mustChangePassword: boolean;
        student: {
            classRoom: {
                name: string;
            };
            rollNo: string;
        };
        teacher: {
            employeeId: string;
        };
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
}
export {};
