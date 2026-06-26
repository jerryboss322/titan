const path = require("node:path");

/** @type {import("prisma").PrismaConfig} */
module.exports = {
  earlyAccess: true,
  schema: path.join("prisma", "schema.prisma"),
};
