import type { NextConfig } from "next";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
	serverExternalPackages: ["@prisma/client", "@prisma/adapter-pg", "pg"],
	turbopack: {
		root: projectRoot,
	},
};

export default nextConfig;
