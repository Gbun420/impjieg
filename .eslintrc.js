module.exports = {
  extends: ["next/core-web-vitals"],
  rules: {
    "@next/next/no-img-element": "off",
  },
  ignorePatterns: [
    ".next/**",
    "out/**",
    "build/**",
    ".worktrees/**",
    ".vercel/output/**",
    "test-results/**",
    "next-env.d.ts",
  ],
};