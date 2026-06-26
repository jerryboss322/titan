import path from "node:path";
import type { PrismaConfig } from "prisma";

// Prisma 7 requires connection URLs to be declared here instead of schema.prisma.
// See: https://pris.ly/d/config-datasource

export default {
  earlyAccess: true,
  schema: path.join("prisma", "schema.prisma"),
} satisfies PrismaConfig;
