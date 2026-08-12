import { PrismaClient } from '@prisma/client';

const DEFAULT_DB_URL = "postgresql://postgres:%40Readydeath0@db.xkslvfdguwvrhxetbmyw.supabase.co:5432/postgres";

const prismaClientSingleton = () => {
  const connectionString = process.env.DATABASE_URL || DEFAULT_DB_URL;
  return new PrismaClient({
    datasources: {
      db: {
        url: connectionString,
      },
    },
  });
};

declare global {
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>;
}

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma;
