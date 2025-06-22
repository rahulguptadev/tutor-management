import { prisma } from './prisma'
import type { Activity } from '../generated/prisma'

export async function logActivity(
  type: Activity['type'],
  description: string,
  userId: string
) {
  try {
    await prisma.activity.create({
      data: {
        type,
        description,
        userId,
      },
    })
  } catch (error) {
    console.error('Failed to log activity:', error)
    // Don't throw the error to prevent disrupting the main operation
  }
} 