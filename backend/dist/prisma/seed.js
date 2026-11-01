"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt = require("bcryptjs");
const prisma = new client_1.PrismaClient();
async function main() {
    const adminLoginId = process.env.ADMIN_LOGIN_ID?.trim();
    const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
    const adminName = process.env.ADMIN_NAME?.trim();
    const adminPhone = process.env.ADMIN_PHONE?.trim();
    const adminPassword = process.env.ADMIN_PASSWORD;
    if (!adminPassword || adminPassword.length < 10) {
        throw new Error('ADMIN_PASSWORD is required and must be at least 10 characters');
    }
    if (!adminLoginId || !adminEmail || !adminName) {
        throw new Error('ADMIN_LOGIN_ID, ADMIN_EMAIL and ADMIN_NAME are required');
    }
    const demoPasswordHash = await bcrypt.hash('Password@123', 10);
    const adminPasswordHash = await bcrypt.hash(adminPassword, 10);
    const dept = await prisma.department.upsert({
        where: { name: 'Computer Applications' },
        update: {},
        create: { name: 'Computer Applications' },
    });
    const cls = await prisma.classRoom.upsert({
        where: { departmentId_name: { departmentId: dept.id, name: 'MCA-1 A' } },
        update: {},
        create: { name: 'MCA-1 A', departmentId: dept.id },
    });
    await prisma.subject.upsert({
        where: { code: 'MCA101' },
        update: {},
        create: { code: 'MCA101', name: 'Data Structures', departmentId: dept.id },
    });
    const mk = (email, loginId, name, role, passwordHash = demoPasswordHash) => prisma.user.upsert({
        where: { email },
        update: { loginId, name, role, isActive: true },
        create: { email, loginId, name, role, passwordHash },
    });
    const admin = await prisma.user.upsert({
        where: { email: adminEmail },
        update: {
            loginId: adminLoginId,
            name: adminName,
            phone: adminPhone || null,
            role: client_1.Role.ADMIN,
            passwordHash: adminPasswordHash,
            isActive: true,
        },
        create: {
            email: adminEmail,
            loginId: adminLoginId,
            name: adminName,
            phone: adminPhone || null,
            role: client_1.Role.ADMIN,
            passwordHash: adminPasswordHash,
        },
    });
    await prisma.adminProfile.upsert({
        where: { userId: admin.id },
        update: {},
        create: { userId: admin.id, designation: 'University Admin' },
    });
    const hod = await mk('hod@lms.test', 'HOD001', 'HOD User', client_1.Role.HOD);
    await prisma.hodProfile.upsert({
        where: { userId: hod.id },
        update: { employeeId: 'HOD001', departmentId: dept.id },
        create: {
            userId: hod.id,
            employeeId: 'HOD001',
            departmentId: dept.id,
            designation: 'Head of Department',
            joiningDate: new Date(),
        },
    });
    const t = await mk('teacher@lms.test', 'EMP001', 'Demo Teacher', client_1.Role.TEACHER);
    await prisma.teacher.upsert({
        where: { userId: t.id },
        update: { employeeId: 'EMP001' },
        create: { userId: t.id, employeeId: 'EMP001' },
    });
    const students = [
        ['student@lms.test', 'MCA001', 'Demo Student'],
        ['student2@lms.test', 'MCA002', 'Second Student'],
        ['student3@lms.test', 'MCA003', 'Third Student'],
    ];
    for (const [email, loginId, name] of students) {
        const u = await mk(email, loginId, name, client_1.Role.STUDENT);
        await prisma.student.upsert({
            where: { userId: u.id },
            update: { rollNo: loginId, classId: cls.id },
            create: { userId: u.id, rollNo: loginId, classId: cls.id },
        });
    }
    console.log('Seed done. Demo password: Password@123');
}
main()
    .catch((e) => {
    console.error(e instanceof Error ? e.message : e);
    process.exit(1);
})
    .finally(() => prisma.$disconnect());
//# sourceMappingURL=seed.js.map