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
    const grade = formData.get('grade') as string;
    const school = formData.get('school') as string;
    const mobileNumber = formData.get('mobileNumber') as string;

    // Update user and student
    await prisma.student.update({
      where: { id },
      data: {
        grade,
        school,
        mobileNumber,
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