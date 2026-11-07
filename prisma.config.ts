import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // CLI（db push / migrate）は pgbouncer を経由しない DIRECT_URL を使う。
    // アプリ実行時は DATABASE_URL（プーラー）を driver adapter に渡す。
    url: env("DIRECT_URL"),
  },
});
