import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    // registry 组件会被安装到 Vite 等非 Next.js 项目中，源码里不能出现
    // `eslint-disable @next/next/*` 注释（在那些项目里会报 "Definition for rule not found"），
    // 也不能依赖 next/image，因此在这里关闭 Next 专属的 <img> 规则。
    files: ["components/qiuye-ui/**/*.{ts,tsx}"],
    ignores: ["components/qiuye-ui/demos/**"],
    rules: {
      "@next/next/no-img-element": "off",
    },
  },
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
  },
];

export default eslintConfig;
