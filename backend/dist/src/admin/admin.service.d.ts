import { PrismaService } from '../prisma/prisma.service';
import { CreateDepartmentDto, CreateHodDto, EditHodDto, SetHodStatusDto } from './admin.dto';
export declare class AdminService {
    private prisma;
    constructor(prisma: PrismaService);
    me(adminId: string): Promise<{
        name: string;
        email: string;
        phone: string;
        loginId: string;
        designation: string;
        lastLoginAt: Date;
    }>;
    overview(): Promise<{
        hods: number;
        teachers: number;
        students: number;
        departments: number;
    }>;
    departments(): Promise<{
        id: string;
        name: string;
    }[]>;
    createDepartment(dto: CreateDepartmentDto): Promise<{
        id: string;
        name: string;
    }>;
    hods(): Promise<{
        id: string;
        name: string;
        loginId: string;
        email: string;
        phone: string;
        department: {
            id: string;
            name: string;
        };
        designation: string;
        qualification: string;
        isActive: boolean;
        joiningDate: Date;
    }[]>;
    createHod(dto: CreateHodDto, adminId: string): Promise<{
        hod: {
            id: string;
            name: string;
            loginId: string;
            email: string;
            phone: string;
            departmentId: string;
            designation: string;
            qualification: string;
            joiningDate: Date;
            isActive: boolean;
        };
        credentials: {
            loginId: string;
            temporaryPassword: string;
        };
    }>;
    editHod(id: string, dto: EditHodDto, adminId: string): Promise<{
        id: string;
        name: string;
        phone: string;
        departmentId: string;
        designation: string;
        qualification: string;
        isActive: boolean;
    }>;
    setHodStatus(id: string, dto: SetHodStatusDto, adminId: string): Promise<{
        id: string;
        isActive: boolean;
    }>;
    resetHodPassword(id: string, adminId: string): Promise<{
        loginId: string;
        temporaryPassword: string;
    }>;
}
