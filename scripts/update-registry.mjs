// scripts/update-registry.mjs
import fs from "fs/promises";
import path from "path";

/**
 * CLI:
 * --dir   要扫描的目录（递归），默认 "registry"
 * --base  组件源码所在根目录，默认项目根 "."
 * --dry   仅打印不写入
 *
 * 说明：
 * - 更新每个 registry item 的 files[].content
 * - 为每个文件写入与 path 相同的 files[].target（无需手写）
 * - 同步生成 registry.json（官方 registry 清单）
 *
 * 示例：
 * node scripts/update-registry.mjs --dir registry --base .
 * node scripts/update-registry.mjs --dir ./my-registry --base . --dry
 */
const argv = parseArgs(process.argv.slice(2));
const REGISTRY_DIR = argv.dir ?? "registry";
const COMPONENT_BASE = argv.base ?? ".";
const DRY_RUN = hasFlag(argv, "dry");
const REGISTRY_MANIFEST_NAME = "registry.json";
const REGISTRY_SCHEMA = "https://ui.shadcn.com/schema/registry.json";
const DEFAULT_REGISTRY_NAME = "qiuye-ui";
const DEFAULT_REGISTRY_HOMEPAGE = "https://ui.qiuyedx.com";
const SKIP_FILE_NAMES = new Set(["index.json", REGISTRY_MANIFEST_NAME]);

function parseArgs(args) {
  const out = {};
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a.startsWith("--")) {
      const key = a.slice(2);
      const next = args[i + 1];
      if (!next || next.startsWith("--")) {
        out[key] = true;
      } else {
        out[key] = next;
        i++;
      }
    }
  }
  return out;
}
function hasFlag(obj, key) {
  return Object.prototype.hasOwnProperty.call(obj, key) && obj[key] !== "false";
}

async function* walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const e of entries) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) yield* walk(p);
    else if (e.isFile()) yield p;
  }
}

async function readJSON(p) {
  const raw = await fs.readFile(p, "utf-8");
  try {
    return JSON.parse(raw);
  } catch (e) {
    throw new Error(`JSON 解析失败: ${p}\n${e.message}`);
  }
}

async function getRegistryMeta() {
  const fallback = {
    name: DEFAULT_REGISTRY_NAME,
    homepage: DEFAULT_REGISTRY_HOMEPAGE,
  };

  try {
    const pkgPath = path.resolve(process.cwd(), "package.json");
    const pkg = await readJSON(pkgPath);
    const name =
      typeof pkg?.registryName === "string" && pkg.registryName.trim().length > 0
        ? pkg.registryName.trim()
        : fallback.name;
    const homepage =
      typeof pkg?.homepage === "string" && pkg.homepage.trim().length > 0
        ? pkg.homepage.trim()
        : fallback.homepage;
    return { name, homepage };
  } catch {
    return fallback;
  }
}

async function tryReadFileByCandidates(base, relPath) {
  const candidates = [
    path.join(base, relPath),
    // 常见：registry 的 path 带了 src/，而实际源码不在 src 下
    path.join(base, relPath.replace(/^src\//, "")),
    // 有时 path 是以 ./ 开头
    path.join(base, relPath.replace(/^\.\//, "")),
  ];

  for (const c of candidates) {
    try {
      const stat = await fs.stat(c);
      if (stat.isFile()) {
        const content = await fs.readFile(c, "utf-8");
        return { found: true, content, resolved: c };
      }
    } catch {
      // ignore
    }
  }
  return { found: false, content: null, resolved: null };
}

/** 写入与 path 相同的 target，并保持 path / type / target 在前、content 在末尾的字段顺序 */
function withTarget(file) {
  const { path: filePath, type, content, ...rest } = file;
  // 先占位 target 让它排在 type 之后，再用 rest 补其余字段，最后覆盖 rest 里旧的 target
  const out = { path: filePath, type, target: filePath, ...rest };
  out.target = filePath;
  if (content !== undefined) out.content = content;
  return out;
}

function isRegistryItemLike(obj) {
  return (
    obj &&
    typeof obj === "object" &&
    Array.isArray(obj.files) &&
    typeof obj.name === "string"
  );
}

async function processRegistryJson(jsonPath) {
  const data = await readJSON(jsonPath);
  if (!isRegistryItemLike(data)) {
    console.warn(`⚠️ 跳过（不是 registry-item 结构）：${jsonPath}`);
    return { updated: false, details: [] };
  }

  const details = [];
  let changed = false;

  for (let i = 0; i < data.files.length; i++) {
    const f = data.files[i];
    if (!f || typeof f !== "object") continue;

    // 处理需要同步源码 content 的 file 类型
    const SYNCABLE_TYPES = new Set([
      "registry:component",
      "registry:hook",
      "registry:lib",
      "registry:style",
    ]);
    if (!SYNCABLE_TYPES.has(f.type)) {
      details.push(`- 跳过 files[${i}]（type=${f.type ?? "N/A"}）`);
      continue;
    }

    const rel = f.path;
    if (!rel || typeof rel !== "string") {
      details.push(`- 跳过 files[${i}]：缺少 path`);
      continue;
    }

    // target 始终与 path 保持一致：shadcn CLI 4 遇到无 target 的文件会按 type
    // 拍平到 components/ 等目录根部，导致多文件组件的 index.ts / types.ts 互相覆盖、
    // 相对导入失效。写上 target 后 CLI 会保留子目录，并自动适配 src/ 目录。
    const targetChanged = f.target !== rel;
    if (targetChanged) {
      changed = true;
      details.push(`- ✅ files[${i}] 同步 target：${rel}`);
    }

    const attempt = await tryReadFileByCandidates(COMPONENT_BASE, rel);
    if (!attempt.found) {
      details.push(`- ❌ files[${i}] 未找到源码：${rel}`);
      if (targetChanged && !DRY_RUN) {
        data.files[i] = withTarget(f);
      }
      continue;
    }

    const contentChanged = f.content !== attempt.content;
    if (contentChanged) {
      changed = true;
      details.push(
        `- ✅ files[${i}] 更新 content：${rel}  ←  ${path.relative(process.cwd(), attempt.resolved)}`
      );
    } else {
      details.push(`- ℹ️ files[${i}] 内容无变化：${rel}`);
    }

    if ((contentChanged || targetChanged) && !DRY_RUN) {
      data.files[i] = withTarget({ ...f, content: attempt.content });
    }
  }

  if (changed && !DRY_RUN) {
    // 保持漂亮的缩进
    await fs.writeFile(jsonPath, JSON.stringify(data, null, 2) + "\n", "utf-8");
  }

  return { updated: changed, details };
}

function stripRegistryFileContent(file) {
  if (!file || typeof file !== "object") return file;
  const out = { ...file };
  delete out.content;
  return out;
}

function toRegistryManifestItem(data) {
  const files = Array.isArray(data.files)
    ? data.files.map(stripRegistryFileContent)
    : [];

  const item = {
    name: data?.name ?? "",
    type: data?.type ?? "",
    title: data?.title ?? "",
    author: data?.author ?? "",
    dependencies: Array.isArray(data?.dependencies) ? data.dependencies : [],
    registryDependencies: Array.isArray(data?.registryDependencies)
      ? data.registryDependencies
      : [],
    files,
  };

  if (typeof data?.description === "string" && data.description.trim()) {
    item.description = data.description;
  }

  if (Array.isArray(data?.devDependencies) && data.devDependencies.length > 0) {
    item.devDependencies = data.devDependencies;
  }

  return item;
}

async function buildRegistryManifestItems(absRegistryDir) {
  const items = [];

  for await (const p of walk(absRegistryDir)) {
    if (!p.endsWith(".json")) continue;
    if (SKIP_FILE_NAMES.has(path.basename(p))) continue;

    const data = await readJSON(p);
    if (!isRegistryItemLike(data)) continue;

    items.push(toRegistryManifestItem(data));
  }

  items.sort((a, b) => a.name.localeCompare(b.name));
  return items;
}

async function writeRegistryManifest(absRegistryDir) {
  const manifestPath = path.join(absRegistryDir, REGISTRY_MANIFEST_NAME);
  const meta = await getRegistryMeta();
  const items = await buildRegistryManifestItems(absRegistryDir);
  const manifest = {
    $schema: REGISTRY_SCHEMA,
    name: meta.name,
    homepage: meta.homepage,
    items,
  };

  if (DRY_RUN) {
    console.log(
      `\n🧾 将要生成: ${path.relative(process.cwd(), manifestPath)}`
    );
    console.log(`- items: ${items.length}`);
    return;
  }

  await fs.writeFile(
    manifestPath,
    JSON.stringify(manifest, null, 2) + "\n",
    "utf-8"
  );
  console.log(`\n🧾 已生成: ${path.relative(process.cwd(), manifestPath)}`);
  console.log(`- items: ${items.length}`);
}

(async function main() {
  const absRegistryDir = path.resolve(process.cwd(), REGISTRY_DIR);
  const absBase = path.resolve(process.cwd(), COMPONENT_BASE);
  console.log(`🔎 扫描目录: ${absRegistryDir}`);
  console.log(`📦 组件根目录: ${absBase}`);
  if (DRY_RUN) console.log(`🧪 当前为 dry run，仅预览更改\n`);

  let total = 0;
  let changed = 0;

  try {
    for await (const p of walk(absRegistryDir)) {
      if (!p.endsWith(".json")) continue;
      if (SKIP_FILE_NAMES.has(path.basename(p))) continue;
      total++;
      const rel = path.relative(process.cwd(), p);
      try {
        const { updated, details } = await processRegistryJson(p);
        if (updated) changed++;
        console.log(`\n📄 ${rel}`);
        details.forEach((d) => console.log(d));
      } catch (e) {
        console.error(`\n❌ 处理失败：${rel}\n${e.message}`);
      }
    }
  } catch (e) {
    console.error(`\n❌ 扫描失败：${e.message}`);
    process.exitCode = 1;
    return;
  }

  try {
    await writeRegistryManifest(absRegistryDir);
  } catch (e) {
    console.error(`\n❌ 生成 registry.json 失败：${e.message}`);
    process.exitCode = 1;
  }

  console.log(`\n—— 完成 ——`);
  console.log(`共发现 JSON：${total}，实际${DRY_RUN ? "将要" : "已"}更新：${changed}`);
})();
