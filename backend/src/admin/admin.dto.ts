import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsEmail,
  IsIn,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateDepartmentDto {
  @IsString()
  @Transform(({ value }) => value?.trim())
  @MinLength(2)
  @MaxLength(100)
  name: string;
}

export class CreateHodDto {
  @IsString()
  @Transform(({ value }) => value?.trim())
  @MinLength(2)
  @MaxLength(80)
  fullName: string;

  @IsEmail()
  @Transform(({ value }) => value?.trim().toLowerCase())
  email: string;

  @Matches(/^[6-9]\d{9}$/)
  phone: string;

  @Matches(/^[A-Z0-9-]{3,20}$/)
  employeeId: string;

  @IsString()
  departmentId: string;

  @IsString()
  @Transform(({ value }) => value?.trim())
  @MinLength(2)
  designation = 'Head of Department';

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim() || undefined)
  qualification?: string;

  @IsDateString()
  joiningDate: string;

  @IsOptional()
  @IsString()
  @MinLength(10)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{10,}$/)
  password?: string;
}

export class EditHodDto {
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  @MinLength(2)
  @MaxLength(80)
  name?: string;

  @IsOptional()
  @Matches(/^[6-9]\d{9}$/)
  phone?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  designation?: string;

  @IsOptional()
  @IsString()
  qualification?: string | null;

  @IsOptional()
  @IsString()
  departmentId?: string;
}

export class SetHodStatusDto {
  @IsBoolean()
  isActive: boolean;
}
