import { Role } from '@prisma/client';
export interface AuthUser {
    id: string;
    email: string;
    role: Role;
}
export declare const CurrentUser: (...dataOrPipes: unknown[]) => ParameterDecorator;
