// scripts/shadcn-audit.mjs
import { execFileSync } from "child_process";
import fs from "fs/promises";
import os from "os";
import path from "path";

/**
 * 盘点项目中的 shadcn/ui 组件与官方源码的差异，用于迁移风格前确认哪些是自有定制。
 *
 * CLI:
 * <project>   项目根目录（含 components.json），默认当前目录
 * --style     对比的官方风格，默认 "new-york-v4"
 * --out       把每个有差异的组件写成 <name>.diff（官方 → 本地），便于迁移后逐个回填
 *
 * 分类：
 * - 一致：去掉空白、引号、分号与 import 后与官方相同
 * - 有差异：括号内为本地独有的行数；「提交」是该文件在 git 中的提交次数，
 *   只有 1 次通常说明安装后没动过，差异来自官方后续更新而非自有定制
 * - 非官方：官方 registry 中不存在的组件（如 Magic UI 或自写组件）
 *
 * 示例：
 * node scripts/shadcn-audit.mjs ../qiuyedx-blog
 * node scripts/shadcn-audit.mjs ../FusionKit --out ../FusionKit/.shadcn-audit
 */
const args = process.argv.slice(2);
const option = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  return i === -1 ? fallback : args[i + 1];
};
const positional = args.filter(
  (a, i) => !a.startsWith("--") && !args[i - 1]?.startsWith("--")
);

const PROJECT = path.resolve(positional[0] ?? ".");
const STYLE = option("style", "new-york-v4");
const OUT = option("out");
const CACHE = path.join(os.tmpdir(), "shadcn-audit-cache", STYLE);

async function exists(p) {
  return fs
    .stat(p)
    .then(() => true)
    .catch(() => false);
}

/** 根据 components.json 的 ui 别名和 tsconfig paths 找到 ui 目录 */
async function resolveUiDir() {
  const config = JSON.parse(
    await fs.readFile(path.join(PROJECT, "components.json"), "utf8")
  );
  const alias = config.aliases?.ui ?? `${config.aliases.components}/ui`;
  const rest = alias.replace(/^@\//, "");
  const candidates = [path.join(PROJECT, "src", rest), path.join(PROJECT, rest)];
  for (const c of candidates) if (await exists(c)) return c;
  throw new Error(`找不到 ui 目录：${candidates.join(" / ")}`);
}

async function fetchUpstream(name) {
  const cached = path.join(CACHE, `${name}.json`);
  if (!(await exists(cached))) {
    const url = `https://ui.shadcn.com/r/styles/${STYLE}/${name}.json`;
    let res;
    for (let i = 0; i < 3 && !res; i++) {
      res = await fetch(url).catch(() => undefined);
    }
    if (!res) throw new Error(`请求失败：${url}`);
    if (res.status === 404) return null;
    await fs.mkdir(CACHE, { recursive: true });
    await fs.writeFile(cached, await res.text());
  }
  const item = JSON.parse(await fs.readFile(cached, "utf8"));
  return item.files?.[0]?.content ?? null;
}

const normalize = (s) =>
  s
    .replace(/^["']use client["'];?/m, "")
    .replace(/import[^;]*?from\s*["'][^"']+["'];?/gs, "")
    .replace(/[\s;,'"`]/g, "");

const meaningfulLines = (s) =>
  s
    .split(/\r?\n/)
    .map((l) => l.trim().replace(/[;,'"`]/g, ""))
    .filter((l) => l && !l.startsWith("import") && !l.startsWith("//"));

function commitCount(file) {
  try {
    const out = execFileSync(
      "git",
      ["log", "--follow", "--format=%h", "--", path.relative(PROJECT, file)],
      { cwd: PROJECT, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }
    );
    return out.split("\n").filter(Boolean).length;
  } catch {
    return 0;
  }
}

async function writeDiff(name, upstream, localFile) {
  const tmp = path.join(os.tmpdir(), `shadcn-audit-${STYLE}-${name}.tsx`);
  await fs.writeFile(tmp, upstream);
  let diff = "";
  try {
    execFileSync(
      "git",
      ["-c", "core.autocrlf=false", "diff", "--no-index", "-w", "--", tmp, localFile],
      { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }
    );
  } catch (e) {
    // 有差异时 git diff 以退出码 1 结束
    diff = e.stdout ?? "";
  }
  await fs.writeFile(path.join(OUT, `${name}.diff`), diff);
}

(async function main() {
  const uiDir = await resolveUiDir();
  const files = (await fs.readdir(uiDir)).filter((f) => f.endsWith(".tsx"));
  if (OUT) await fs.mkdir(OUT, { recursive: true });

  const same = [];
  const changed = [];
  const unofficial = [];

  for (const file of files.sort()) {
    const name = file.replace(/\.tsx$/, "");
    const localFile = path.join(uiDir, file);
    const local = await fs.readFile(localFile, "utf8");
    const upstream = await fetchUpstream(name);

    if (upstream === null) {
      unofficial.push(name);
      continue;
    }
    if (normalize(local) === normalize(upstream)) {
      same.push(name);
      continue;
    }

    const upstreamLines = new Set(meaningfulLines(upstream));
    const own = meaningfulLines(local).filter((l) => !upstreamLines.has(l));
    changed.push({ name, lines: own.length, commits: commitCount(localFile) });
    if (OUT) await writeDiff(name, upstream, localFile);
  }

  console.log(`项目：${PROJECT}`);
  console.log(`ui 目录：${path.relative(PROJECT, uiDir)}（对比 ${STYLE}）\n`);
  console.log(`一致（${same.length}）：${same.join(" ") || "—"}`);
  console.log(`非官方（${unofficial.length}）：${unofficial.join(" ") || "—"}`);
  console.log(`有差异（${changed.length}）：`);
  for (const c of changed.sort((a, b) => b.lines - a.lines)) {
    const hint = c.commits > 1 ? "  ← 安装后改动过" : "";
    console.log(
      `  ${c.name.padEnd(18)} 本地独有 ${String(c.lines).padStart(3)} 行  提交 ${c.commits}${hint}`
    );
  }
  if (OUT) console.log(`\n差异文件已写入：${OUT}`);
  console.log(`\n重装命令：pnpm dlx shadcn@latest add ${[...same, ...changed.map((c) => c.name)].join(" ")} -o`);
})().catch((e) => {
  console.error(e.message);
  process.exitCode = 1;
});
