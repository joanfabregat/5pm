import type { NextConfig } from "next";
import { execSync } from "child_process";

const gitTag = execSync("git describe --tags --always 2>/dev/null || echo 'untagged'")
  .toString()
  .trim();
const gitCommit = execSync("git rev-parse HEAD").toString().trim();

const nextConfig: NextConfig = {
  output: 'export',
  reactCompiler: true,
  env: {
    NEXT_PUBLIC_GIT_TAG: gitTag,
    NEXT_PUBLIC_GIT_COMMIT: gitCommit,
  },
};

export default nextConfig;
