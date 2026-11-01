import { AuthUser } from '../auth/current-user.decorator';
import { AdminService } from './admin.service';
import { CreateDepartmentDto, CreateHodDto, EditHodDto, SetHodStatusDto } from './admin.dto';
export declare class AdminController {
    private admin;
    constructor(admin: AdminService);
    me(user: AuthUser): Promise<{
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
    createHod(dto: CreateHodDto, user: AuthUser): Promise<{
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
    editHod(id: string, dto: EditHodDto, user: AuthUser): Promise<{
        id: string;
        name: string;
        phone: string;
        departmentId: string;
        designation: string;
        qualification: string;
        isActive: boolean;
    }>;
    setHodStatus(id: string, dto: SetHodStatusDto, user: AuthUser): Promise<{
        id: string;
        isActive: boolean;
    }>;
    resetHodPassword(id: string, user: AuthUser): Promise<{
        loginId: string;
        temporaryPassword: string;
    }>;
}
