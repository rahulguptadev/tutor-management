import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const formData = await request.formData();
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const gradeId = formData.get('gradeId') as string;
    const school = formData.get('school') as string;
    const mobileNumber = formData.get('mobileNumber') as string;
    const fatherName = formData.get('fatherName') as string;
    const fatherContact = formData.get('fatherContact') as string;
    const motherName = formData.get('motherName') as string;
    const motherContact = formData.get('motherContact') as string;
    // Parse enrolledSubjects from formData (assume it's sent as JSON string)
    const enrolledSubjectsRaw = formData.get('enrolledSubjects') as string;
    const enrolledSubjects = enrolledSubjectsRaw ? JSON.parse(enrolledSubjectsRaw) : [];

    // Update user and student
    await prisma.student.update({
      where: { id },
      data: {
        grade: gradeId ? { connect: { id: gradeId } } : { disconnect: true },
        school,
        mobileNumber,
        fatherName,
        fatherContact,
        motherName,
        motherContact,
        // Remove all previous enrolledSubjects and add new ones
        enrolledSubjects: {
          deleteMany: {},
          create: enrolledSubjects.map((row: any) => ({
            subject: { connect: { id: row.subjectId } },
            sessions: Number(row.sessions),
            fee: Number(row.fee),
          })),
        },
        user: {
          update: {
            name,
            email,
          },
        },
      },
      include: {
        user: true,
      },
    });

    // Redirect to the student detail page with an absolute URL
    const redirectUrl = new URL(`/students/${id}`, request.url);
    return NextResponse.redirect(redirectUrl.toString());
  } catch (error) {
    console.error('Failed to update student:', error);
    return new NextResponse('Failed to update student', { status: 500 });
  }
} 