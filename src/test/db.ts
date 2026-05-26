import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

let _prisma: PrismaClient | null = null;

export function getTestPrisma(): PrismaClient {
  if (!_prisma) {
    const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
    _prisma = new PrismaClient({ adapter });
  }
  return _prisma;
}

export async function cleanupTestUsers(emails: string[]) {
  const prisma = getTestPrisma();
  await prisma.post.deleteMany({ where: { author: { email: { in: emails } } } });
  await prisma.user.deleteMany({ where: { email: { in: emails } } });
}
