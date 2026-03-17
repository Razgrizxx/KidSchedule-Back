"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const config_1 = require("prisma/config");
exports.default = (0, config_1.defineConfig)({
    schema: "prisma/schema.prisma",
    migrations: {
        path: "prisma/migrations",
    },
    datasource: {
        url: process.env["DATABASE_URL"] ?? "postgresql://postgres:christian_pg_2026!@localhost:5432/christian_db?schema=public",
    },
});
//# sourceMappingURL=prisma.config.js.map