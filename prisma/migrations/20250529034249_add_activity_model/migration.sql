-- CreateEnum
CREATE TYPE "ActivityType" AS ENUM ('CLASS_CREATED', 'CLASS_UPDATED', 'LEAD_CREATED', 'LEAD_UPDATED', 'FEE_CREATED', 'FEE_PAID', 'PAYOUT_CREATED', 'PAYOUT_PAID');

-- CreateTable
CREATE TABLE "Activity" (
    "id" TEXT NOT NULL,
    "type" "ActivityType" NOT NULL,
    "description" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Activity_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
