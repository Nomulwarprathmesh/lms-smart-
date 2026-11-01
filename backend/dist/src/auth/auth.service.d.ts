import { JwtService } from '@nestjs/jwt';
import { Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
export declare class AuthService {
    private prisma;
    private jwt;
    constructor(prisma: PrismaService, jwt: JwtService);
    login(identifier: string, password: string, role?: Role): Promise<{
        accessToken: string;
        user: {
            id: string;
            name: string;
            email: string;
            role: import(".prisma/client").$Enums.Role;
            mustChangePassword: boolean;
        };
    }>;
    me(userId: string): import(".prisma/client").Prisma.Prisma__UserClient<{
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
    changePassword(userId: string, currentPassword: string, newPassword: string): Promise<{
        message: string;
    }>;
}
