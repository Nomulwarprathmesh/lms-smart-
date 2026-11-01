export declare class CreateDepartmentDto {
    name: string;
}
export declare class CreateHodDto {
    fullName: string;
    email: string;
    phone: string;
    employeeId: string;
    departmentId: string;
    designation: string;
    qualification?: string;
    joiningDate: string;
    password?: string;
}
export declare class EditHodDto {
    name?: string;
    phone?: string;
    designation?: string;
    qualification?: string | null;
    departmentId?: string;
}
export declare class SetHodStatusDto {
    isActive: boolean;
}
