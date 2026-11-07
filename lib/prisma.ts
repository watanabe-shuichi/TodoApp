import { readFileSync } from "node:fs";
import { join } from "node:path";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/app/generated/prisma/client";

// Supabase のダッシュボードからダウンロードした CA 証明書（公開情報）
const CA_CERT_PATH = join(process.cwd(), "certs/supabase-ca.crt");

function createPrismaClient() {
  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
    // DB との通信を暗号化し、接続先の証明書も検証する
    ssl: { ca: readFileSync(CA_CERT_PATH, "utf8") },
  });
  return new PrismaClient({ adapter });
}

// 開発時のホットリロードで接続が増え続けないよう、インスタンスを使い回す
const globalForPrisma = globalThis as unknown as {
  prisma?: ReturnType<typeof createPrismaClient>;
};

export function getPrisma() {
  globalForPrisma.prisma ??= createPrismaClient();
  return globalForPrisma.prisma;
}
