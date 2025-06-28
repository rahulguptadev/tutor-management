import { PrismaClient } from '@prisma/client'
import { hash } from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  const email = 'admin@example.com'
  const password = 'admin123'
  const name = 'Admin User'

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email }
  })

  if (existingUser) {
    console.log('User already exists:', existingUser.email)
    return
  }

  // Hash the password
  const hashedPassword = await hash(password, 10)

  // Create the user
  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role: 'ADMIN'
    }
  })

  console.log('Admin user created successfully:')
  console.log('Email:', user.email)
  console.log('Name:', user.name)
  console.log('Role:', user.role)
  console.log('ID:', user.id)
}

main()
  .catch((e) => {
    console.error('Error creating admin user:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 