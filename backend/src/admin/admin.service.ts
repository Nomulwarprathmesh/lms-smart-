import { ConflictException, Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDepartmentDto, CreateHodDto, EditHodDto, SetHodStatusDto } from './admin.dto';

function randomTemporaryPassword() {
  const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const lower = 'abcdefghijkmnopqrstuvwxyz';
  const digits = '23456789';
  const symbols = '!@#$%';
  const chars = upper + lower + digits + symbols;
  const guaranteed = [
    upper[Math.floor(Math.random() * upper.length)],
    lower[Math.floor(Math.random() * lower.length)],
    digits[Math.floor(Math.random() * digits.length)],
    symbols[Math.floor(Math.random() * symbols.length)],
  ];
  while (guaranteed.length < 12) {
    guaranteed.push(chars[Math.floor(Math.random() * chars.length)]);
  }
  return guaranteed.sort(() => Math.random() - 0.5).join('');
}

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async me(adminId: string) {
    const admin = await this.prisma.user.findUnique({
      where: { id: adminId },
      include: { adminProfile: true },
    });
    if (!admin) throw new NotFoundException('Admin not found');
    return {
      name: admin.name,
      email: admin.email,
      phone: admin.phone,
      loginId: admin.loginId,
      designation: admin.adminProfile?.designation || 'University Admin',
      lastLoginAt: admin.lastLoginAt,
    };
  }

  async overview() {
    const [hods, teachers, students, departments] = await Promise.all([
      this.prisma.user.count({ where: { role: 'HOD' } }),
      this.prisma.user.count({ where: { role: 'TEACHER' } }),
      this.prisma.user.count({ where: { role: 'STUDENT' } }),
      this.prisma.department.count(),
    ]);
    return { hods, teachers, students, departments };
  }

  async departments() {
    return this.prisma.department.findMany({
      orderBy: { name: 'asc' },
      select: { id: true, name: true },
    });
  }

  async createDepartment(dto: CreateDepartmentDto) {
    const name = dto.name.trim();
    try {
      return await this.prisma.department.create({ data: { name } });
    } catch (error: any) {
      if (error?.code === 'P2002') throw new ConflictException('Department name already exists');
      throw error;
    }
  }

  async hods() {
    const rows = await this.prisma.user.findMany({
      where: { role: 'HOD' },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        loginId: true,
        email: true,
        phone: true,
        isActive: true,
        hodProfile: {
          select: {
            department: { select: { id: true, name: true } },
            designation: true,
            qualification: true,
            joiningDate: true,
          },
        },
      },
    });
    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      loginId: row.loginId,
      email: row.email,
      phone: row.phone,
      department: row.hodProfile?.department || null,
      designation: row.hodProfile?.designation || null,
      qualification: row.hodProfile?.qualification || null,
      isActive: row.isActive,
      joiningDate: row.hodProfile?.joiningDate || null,
    }));
  }

  async createHod(dto: CreateHodDto, adminId: string) {
    const email = dto.email.trim().toLowerCase();
    const employeeId = dto.employeeId.trim();

    if (new Date(dto.joiningDate).getTime() > Date.now()) {
      throw new BadRequestException('Joining date cannot be in the future');
    }

    if (await this.prisma.user.findUnique({ where: { email } })) {
      throw new ConflictException('Email already exists');
    }
    if (await this.prisma.user.findUnique({ where: { loginId: employeeId } })) {
      throw new ConflictException('Employee ID already exists');
    }
    const department = await this.prisma.department.findUnique({ where: { id: dto.departmentId } });
    if (!department) throw new NotFoundException('Department not found');
    if (await this.prisma.hodProfile.findUnique({ where: { departmentId: dto.departmentId } })) {
      throw new ConflictException('Department already has a HOD');
    }

    const temporaryPassword = dto.password || randomTemporaryPassword();
    const passwordHash = await bcrypt.hash(temporaryPassword, 10);

    try {
      const result = await this.prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
          data: {
            email,
            loginId: employeeId,
            phone: dto.phone,
            name: dto.fullName.trim(),
            role: 'HOD',
            passwordHash,
            mustChangePassword: true,
            createdById: adminId,
          },
        });
        const profile = await tx.hodProfile.create({
          data: {
            userId: user.id,
            employeeId,
            departmentId: dto.departmentId,
            designation: dto.designation || 'Head of Department',
            qualification: dto.qualification,
            joiningDate: new Date(dto.joiningDate),
          },
        });
        await tx.auditLog.create({
          data: {
            actorId: adminId,
            action: 'CREATE_HOD',
            entity: 'HOD',
            entityId: user.id,
            meta: { employeeId, departmentId: dto.departmentId },
          },
        });
        return { user, profile };
      });

      return {
        hod: {
          id: result.user.id,
          name: result.user.name,
          loginId: result.user.loginId,
          email: result.user.email,
          phone: result.user.phone,
          departmentId: result.profile.departmentId,
          designation: result.profile.designation,
          qualification: result.profile.qualification,
          joiningDate: result.profile.joiningDate,
          isActive: result.user.isActive,
        },
        credentials: { loginId: employeeId, temporaryPassword },
      };
    } catch (error: any) {
      if (error?.code === 'P2002') throw new ConflictException('Email, Employee ID or department already exists');
      throw error;
    }
  }

  async editHod(id: string, dto: EditHodDto, adminId: string) {
    const existing = await this.prisma.hodProfile.findUnique({
      where: { userId: id },
      include: { user: true },
    });
    if (!existing) throw new NotFoundException('HOD not found');

    if (dto.departmentId && dto.departmentId !== existing.departmentId) {
      const department = await this.prisma.department.findUnique({ where: { id: dto.departmentId } });
      if (!department) throw new NotFoundException('Department not found');
      const occupied = await this.prisma.hodProfile.findUnique({ where: { departmentId: dto.departmentId } });
      if (occupied) throw new ConflictException('Department already has a HOD');
    }

    try {
      return await this.prisma.$transaction(async (tx) => {
        const user = await tx.user.update({
          where: { id },
          data: {
            ...(dto.name ? { name: dto.name } : {}),
            ...(dto.phone ? { phone: dto.phone } : {}),
          },
        });
        const profile = await tx.hodProfile.update({
          where: { userId: id },
          data: {
            ...(dto.departmentId ? { departmentId: dto.departmentId } : {}),
            ...(dto.designation ? { designation: dto.designation } : {}),
            ...(dto.qualification !== undefined ? { qualification: dto.qualification } : {}),
          },
        });
        await tx.auditLog.create({
          data: { actorId: adminId, action: 'EDIT_HOD', entity: 'HOD', entityId: id, meta: dto as any },
        });
        return {
          id: user.id,
          name: user.name,
          phone: user.phone,
          departmentId: profile.departmentId,
          designation: profile.designation,
          qualification: profile.qualification,
          isActive: user.isActive,
        };
      });
    } catch (error: any) {
      if (error?.code === 'P2002') throw new ConflictException('Department already has a HOD');
      throw error;
    }
  }

  async setHodStatus(id: string, dto: SetHodStatusDto, adminId: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user || user.role !== 'HOD') throw new NotFoundException('HOD not found');
    await this.prisma.$transaction([
      this.prisma.user.update({ where: { id }, data: { isActive: dto.isActive } }),
      this.prisma.auditLog.create({
        data: { actorId: adminId, action: 'CHANGE_HOD_STATUS', entity: 'HOD', entityId: id, meta: { isActive: dto.isActive } },
      }),
    ]);
    return { id, isActive: dto.isActive };
  }

  async resetHodPassword(id: string, adminId: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user || user.role !== 'HOD') throw new NotFoundException('HOD not found');
    const temporaryPassword = randomTemporaryPassword();
    const passwordHash = await bcrypt.hash(temporaryPassword, 10);
    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id },
        data: { passwordHash, mustChangePassword: true },
      }),
      this.prisma.auditLog.create({
        data: { actorId: adminId, action: 'RESET_HOD_PASSWORD', entity: 'HOD', entityId: id },
      }),
    ]);
    return { loginId: user.loginId, temporaryPassword };
  }
}
