import { prisma } from './prisma'
import type { Activity } from '../generated/prisma'

export async function logActivity(
  type: Activity['type'],
  description: string,
  userId: string
) {
  try {
    // Check if userId exists before creating activity
    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) {
      console.warn('User not found for activity logging:', userId)
      return
    }
    
    await prisma.activity.create({
      data: {
        type,
        description,
        userId,
      },
    })
  } catch (error) {
    console.warn('Failed to log activity:', error)
  }
} 