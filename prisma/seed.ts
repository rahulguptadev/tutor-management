import { PrismaClient } from '@prisma/client'
import { hash } from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  // Clear existing data
  await prisma.activity.deleteMany()
  await prisma.fee.deleteMany()
  await prisma.payout.deleteMany()
  await prisma.class.deleteMany()
  await prisma.lead.deleteMany()
  await prisma.teacherAvailability.deleteMany()
  await prisma.teacher.deleteMany()
  await prisma.student.deleteMany()
  await prisma.user.deleteMany()

  // Create admin user
  const adminPassword = await hash('admin123', 10)
  const admin = await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@example.com',
      password: adminPassword,
      role: 'ADMIN',
    },
  })

  // Create subjects
  const mathematics = await prisma.subject.create({
    data: {
      name: 'Mathematics',
      description: 'Advanced mathematics including algebra, calculus, and geometry',
    },
  })

  const english = await prisma.subject.create({
    data: {
      name: 'English',
      description: 'English language and literature',
    },
  })

  const science = await prisma.subject.create({
    data: {
      name: 'Science',
      description: 'General science including physics, chemistry, and biology',
    },
  })

  // Create grades
  const grade10 = await prisma.grade.create({
    data: {
      name: '10th Grade',
      level: 10,
      curriculum: 'CBSE',
      description: 'Class 10 CBSE curriculum',
      isActive: true,
    },
  })

  const grade11 = await prisma.grade.create({
    data: {
      name: '11th Grade',
      level: 11,
      curriculum: 'CBSE',
      description: 'Class 11 CBSE curriculum',
      isActive: true,
    },
  })

  // Create grade-subject relationships
  await prisma.gradeSubject.createMany({
    data: [
      { gradeId: grade10.id, subjectId: mathematics.id, isCore: true, order: 1 },
      { gradeId: grade10.id, subjectId: english.id, isCore: true, order: 2 },
      { gradeId: grade10.id, subjectId: science.id, isCore: true, order: 3 },
      { gradeId: grade11.id, subjectId: mathematics.id, isCore: true, order: 1 },
      { gradeId: grade11.id, subjectId: english.id, isCore: true, order: 2 },
      { gradeId: grade11.id, subjectId: science.id, isCore: true, order: 3 },
    ],
  })

  // Create teacher users and teachers
  const teacherPassword = await hash('teacher123', 10)
  const teacherUser1 = await prisma.user.create({
    data: {
      name: 'John Smith',
      email: 'john@example.com',
      password: teacherPassword,
      role: 'TEACHER',
    },
  })
  const teacher1 = await prisma.teacher.create({
    data: {
      userId: teacherUser1.id,
      bio: 'Experienced math and physics teacher.',
      hourlyRate: 50,
      availability: JSON.stringify({
        Monday: [{ start: '09:00', end: '17:00' }],
        Tuesday: [{ start: '09:00', end: '17:00' }],
      }),
    },
  })

  // Link teacher1 to subjects
  await prisma.teacherSubject.createMany({
    data: [
      { teacherId: teacher1.id, subjectId: mathematics.id },
      { teacherId: teacher1.id, subjectId: science.id },
    ],
  })

  await prisma.teacherAvailability.createMany({
    data: [
      { teacherId: teacher1.id, dayOfWeek: 1, startTime: '09:00', endTime: '17:00', isAvailable: true },
      { teacherId: teacher1.id, dayOfWeek: 2, startTime: '09:00', endTime: '17:00', isAvailable: true },
    ],
  })

  const teacherUser2 = await prisma.user.create({
    data: {
      name: 'Sarah Johnson',
      email: 'sarah@example.com',
      password: teacherPassword,
      role: 'TEACHER',
    },
  })
  const teacher2 = await prisma.teacher.create({
    data: {
      userId: teacherUser2.id,
      bio: 'English literature specialist.',
      hourlyRate: 45,
      availability: JSON.stringify({
        Wednesday: [{ start: '10:00', end: '18:00' }],
        Thursday: [{ start: '10:00', end: '18:00' }],
      }),
    },
  })

  // Link teacher2 to subjects
  await prisma.teacherSubject.createMany({
    data: [
      { teacherId: teacher2.id, subjectId: english.id },
      { teacherId: teacher2.id, subjectId: science.id },
    ],
  })

  await prisma.teacherAvailability.createMany({
    data: [
      { teacherId: teacher2.id, dayOfWeek: 3, startTime: '10:00', endTime: '18:00', isAvailable: true },
      { teacherId: teacher2.id, dayOfWeek: 4, startTime: '10:00', endTime: '18:00', isAvailable: true },
    ],
  })

  // Create student users and students
  const studentPassword = await hash('student123', 10)
  const studentUser1 = await prisma.user.create({
    data: {
      name: 'Alice Brown',
      email: 'alice@example.com',
      password: studentPassword,
      role: 'STUDENT',
    },
  })
  const student1 = await prisma.student.create({
    data: {
      userId: studentUser1.id,
      gradeId: grade10.id,
      school: 'Central High',
    },
  })
  const studentUser2 = await prisma.user.create({
    data: {
      name: 'Bob Wilson',
      email: 'bob@example.com',
      password: studentPassword,
      role: 'STUDENT',
    },
  })
  const student2 = await prisma.student.create({
    data: {
      userId: studentUser2.id,
      gradeId: grade11.id,
      school: 'Westview School',
    },
  })

  // Create classes (each class must have a teacher and a student)
  const now = new Date()
  const class1 = await prisma.class.create({
    data: {
      teacherId: teacher1.id,
      studentId: student1.id,
      subjectId: mathematics.id,
      startTime: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 10, 0),
      endTime: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 11, 0),
      status: 'SCHEDULED',
      isRecurring: false,
    },
  })
  const class2 = await prisma.class.create({
    data: {
      teacherId: teacher2.id,
      studentId: student2.id,
      subjectId: english.id,
      startTime: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 14, 0),
      endTime: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 15, 0),
      status: 'SCHEDULED',
      isRecurring: false,
    },
  })

  // Create fees
  await prisma.fee.create({
    data: {
      studentId: student1.id,
      amount: 500,
      dueDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 7),
      status: 'PENDING',
    },
  })
  await prisma.fee.create({
    data: {
      studentId: student2.id,
      amount: 450,
      dueDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 10),
      status: 'PAID',
      paidAmount: 450,
      paidAt: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 9),
    },
  })

  // Create payouts
  await prisma.payout.create({
    data: {
      teacherId: teacher1.id,
      amount: 250,
      status: 'PENDING',
    },
  })
  await prisma.payout.create({
    data: {
      teacherId: teacher2.id,
      amount: 225,
      status: 'PAID',
      paidAt: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 9),
    },
  })

  // Create leads (each lead must have a user)
  const leadUser1 = await prisma.user.create({
    data: {
      name: 'Charlie Davis',
      email: 'charlie@example.com',
      password: await hash('lead123', 10),
      role: 'STUDENT',
    },
  })
  await prisma.lead.create({
    data: {
      userId: leadUser1.id,
      status: 'NEW',
      source: 'Website',
      notes: 'Interested in advanced math classes',
    },
  })
  const leadUser2 = await prisma.user.create({
    data: {
      name: 'Diana Evans',
      email: 'diana@example.com',
      password: await hash('lead123', 10),
      role: 'STUDENT',
    },
  })
  await prisma.lead.create({
    data: {
      userId: leadUser2.id,
      status: 'CONTACTED',
      source: 'Referral',
      notes: 'Looking for literature classes',
    },
  })

  // Create some activity logs
  await prisma.activity.create({
    data: {
      type: 'CLASS_CREATED',
      description: 'Created new class for Alice Brown',
      userId: admin.id,
    },
  })
  await prisma.activity.create({
    data: {
      type: 'LEAD_CREATED',
      description: 'New lead: Charlie Davis',
      userId: admin.id,
    },
  })

  console.log('Database has been seeded!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 