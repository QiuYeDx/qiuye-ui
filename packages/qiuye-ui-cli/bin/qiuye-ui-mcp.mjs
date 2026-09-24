#!/usr/bin/env node

// packages/qiuye-ui-cli/bin/qiuye-ui-mcp.mjs
// QiuYe UI MCP Server for Cursor/Claude

import {
  McpServer,
  ResourceTemplate,
} from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const DEFAULT_REGISTRY_BASE = "https://ui.qiuyedx.com/registry";
const DEFAULT_COMPONENT_NAMES = [
  "responsive-tabs",
  "segmented-control",
  "scrollable-dialog",
  "dot-glass",
  "image-viewer",
  "dual-state-toggle",
  "theme-transition-toggle",
  "code-block",
  "typewriter",
  "animated-number",
  "markdown-renderer",
  "color-picker",
  "smooth-corners",
  "tour",
  "matrix-effect",
];

function parseArgs(argv) {
  const positional = [];
  const flags = {};

  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];

    if (a.startsWith("--")) {
      const key = a.slice(2);
      const next = argv[i + 1];
      if (!next || next.startsWith("--")) {
        flags[key] = true;
      } else {
        flags[key] = next;
        i++;
      }
      continue;
    }

    positional.push(a);
  }

  return { positional, flags };
}

function normalizeRegistryName(input) {
  if (typeof input !== "string") throw new Error("name 必须是字符串");

  let name = input.trim();

  // 支持 @qiuye-ui/xxx
  if (name.startsWith("@")) {
    const parts = name.split("/");
    if (parts.length >= 2) name = parts[1];
  }

  // 支持 URL
  try {
    const u = new URL(name);
    name = u.pathname.split("/").filter(Boolean).pop() ?? name;
  } catch {
    // ignore
  }

  // 支持 xxx.json
  if (name.endsWith(".json")) name = name.slice(0, -".json".length);

  // 防止路径穿越 / 非法名字
  if (!/^[a-z0-9][a-z0-9-]*$/.test(name)) {
    throw new Error(`非法组件名：${input}`);
  }

  return name;
}

function joinUrl(base, path) {
  const b = base.endsWith("/") ? base.slice(0, -1) : base;
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${b}${p}`;
}

async function fetchJson(url, { timeoutMs = 12_000 } = {}) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "accept": "application/json",
      },
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`HTTP ${res.status} ${res.statusText}: ${text.slice(0, 400)}`);
    }

    return await res.json();
  } finally {
    clearTimeout(id);
  }
}

function toArray(v) {
  return Array.isArray(v) ? v : [];
}

function stripRegistryFilesContent(item) {
  const files = toArray(item?.files).map((f) => {
    if (!f || typeof f !== "object") return f;
    const out = { ...f };
    delete out.content;
    return out;
  });

  return {
    ...item,
    files,
  };
}

function toIndexItem(item) {
  const files = toArray(item?.files).map((f) => {
    const file = {
      type: f?.type,
      path: f?.path,
    };

    if (typeof f?.target === "string" && f.target.length > 0) {
      file.target = f.target;
    }

    return file;
  });

  return {
    name: item?.name ?? "",
    title: item?.title ?? "",
    type: item?.type ?? "",
    author: item?.author ?? "",
    dependencies: toArray(item?.dependencies),
    registryDependencies: toArray(item?.registryDependencies),
    fileCount: files.length,
    files,
  };
}

function searchIndex(index, query) {
  const q = query.trim().toLowerCase();
  if (!q) return index;

  return index.filter((it) => {
    const hay = [
      it.name,
      it.title,
      it.type,
      it.author,
      ...(it.dependencies ?? []),
      ...(it.registryDependencies ?? []),
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return hay.includes(q);
  });
}

function toolText(payload) {
  const text =
    typeof payload === "string" ? payload : JSON.stringify(payload, null, 2);
  return { content: [{ type: "text", text }] };
}

function getRegistryBase(flags) {
  const fromFlag =
    typeof flags["registry-base"] === "string"
      ? flags["registry-base"]
      : typeof flags.base === "string"
        ? flags.base
        : null;

  const fromEnv = process.env.QIUIYE_UI_REGISTRY_BASE;

  const base = (fromFlag || fromEnv || DEFAULT_REGISTRY_BASE).trim();
  return base.endsWith("/") ? base.slice(0, -1) : base;
}

async function getRegistryItemByName(base, name) {
  const normalized = normalizeRegistryName(name);
  const url = joinUrl(base, `${normalized}.json`);
  const item = await fetchJson(url);
  return { name: normalized, url, item };
}

function normalizeIndexItems(items) {
  return items
    .map((x) => {
      if (
        x &&
        typeof x === "object" &&
        typeof x.name === "string" &&
        Array.isArray(x.files)
      ) {
        return toIndexItem(x);
      }
      return x;
    })
    .filter((x) => x && typeof x === "object" && typeof x.name === "string");
}

async function fetchIndexFromRemote(base) {
  const registryUrl = joinUrl(base, "registry.json");

  try {
    const data = await fetchJson(registryUrl);
    const items = Array.isArray(data)
      ? data
      : Array.isArray(data?.items)
        ? data.items
        : null;

    if (!items) {
      throw new Error("registry.json 缺少 items 数组");
    }

    return normalizeIndexItems(items);
  } catch {
    const indexUrl = joinUrl(base, "index.json");
    const data = await fetchJson(indexUrl);

    if (!Array.isArray(data)) {
      throw new Error("index.json 不是数组结构");
    }

    return normalizeIndexItems(data);
  }
}

async function buildIndexFallback(base) {
  const results = await Promise.allSettled(
    DEFAULT_COMPONENT_NAMES.map(async (name) => {
      const { item } = await getRegistryItemByName(base, name);
      return toIndexItem(item);
    })
  );

  const ok = results
    .filter((r) => r.status === "fulfilled")
    .map((r) => r.value);

  return ok.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
}

async function getIndex(base) {
  try {
    const index = await fetchIndexFromRemote(base);
    return index.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
  } catch {
    // 远端没提供 registry.json/index.json 时，使用内置组件列表兜底
    return await buildIndexFallback(base);
  }
}

async function runCheck(flags) {
  const base = getRegistryBase(flags);

  const index = await getIndex(base);

  const sampleName = index?.[0]?.name || DEFAULT_COMPONENT_NAMES[0];
  const { item, url } = await getRegistryItemByName(base, sampleName);

  console.log(`✅ registry base: ${base}`);
  console.log(`✅ index items: ${index.length}`);
  console.log(index.map((x) => `- ${x.name}`).join("\n"));
  console.log("\n—— sample item ——");
  console.log(`GET ${url}`);
  console.log(JSON.stringify(stripRegistryFilesContent(item), null, 2));
}

async function runMcp(flags) {
  const base = getRegistryBase(flags);

  const server = new McpServer({
    name: "qiuye-ui-registry",
    version: "1.0.0",
  });

  server.registerTool(
    "qiuye_ui_list_registry_items",
    {
      title: "List QiuYe UI registry items",
      description:
        "列出 QiuYe UI registry（从远端 /registry/registry.json 拉取；若不存在则用内置列表兜底）。",
      inputSchema: z
        .object({
          includeFiles: z
            .boolean()
            .optional()
            .describe("是否包含 files 的 path/target（target 可选）"),
        })
        .strict(),
      annotations: { readOnlyHint: true },
    },
    async ({ includeFiles }) => {
      const index = await getIndex(base);
      if (includeFiles) return toolText(index);

      const minimal = index.map((x) => {
        const out = { ...x };
        delete out.files;
        return out;
      });
      return toolText(minimal);
    }
  );

  server.registerTool(
    "qiuye_ui_search_registry_items",
    {
      title: "Search QiuYe UI registry items",
      description:
        "在 registry index 中按 name/title/type/author/dependencies/registryDependencies 搜索组件。",
      inputSchema: z
        .object({
          query: z.string().min(1).describe("搜索关键词"),
          includeFiles: z
            .boolean()
            .optional()
            .describe("是否包含 files 的 path/target（target 可选）"),
        })
        .strict(),
      annotations: { readOnlyHint: true },
    },
    async ({ query, includeFiles }) => {
      const index = await getIndex(base);
      const hits = searchIndex(index, query);

      if (includeFiles) return toolText(hits);
      const minimal = hits.map((x) => {
        const out = { ...x };
        delete out.files;
        return out;
      });
      return toolText(minimal);
    }
  );

  server.registerTool(
    "qiuye_ui_get_registry_item",
    {
      title: "Get a registry item JSON",
      description:
        "读取指定组件的 registry JSON（从远端 /registry/<name>.json 拉取）。支持 name / name.json / @qiuye-ui/name / URL。",
      inputSchema: z
        .object({
          name: z.string().min(1).describe("组件名（或 @qiuye-ui/name 或 URL）"),
          includeContent: z
            .boolean()
            .optional()
            .describe("是否返回 files[].content（可能很长）"),
        })
        .strict(),
      annotations: { readOnlyHint: true },
    },
    async ({ name, includeContent }) => {
      const { item } = await getRegistryItemByName(base, name);
      return toolText(includeContent ? item : stripRegistryFilesContent(item));
    }
  );

  server.registerTool(
    "qiuye_ui_get_registry_file_content",
    {
      title: "Get registry file content",
      description:
        "从 registry item 的 files[] 中读取指定文件的 content（默认取 files[0]）。",
      inputSchema: z
        .object({
          name: z.string().min(1).describe("组件名（或 @qiuye-ui/name 或 URL）"),
          index: z
            .number()
            .int()
            .nonnegative()
            .optional()
            .describe("files[] 下标，默认 0"),
        })
        .strict(),
      annotations: { readOnlyHint: true },
    },
    async ({ name, index }) => {
      const { item } = await getRegistryItemByName(base, name);
      const i = typeof index === "number" ? index : 0;
      const file = toArray(item?.files)[i];

      if (!file) {
        return toolText({
          error: `files[${i}] 不存在`,
          available: toArray(item?.files).map((f, idx) => ({
            index: idx,
            path: f?.path,
            target: f?.target,
            type: f?.type,
          })),
        });
      }

      return toolText({
        index: i,
        path: file?.path,
        target: file?.target,
        type: file?.type,
        content: file?.content ?? "",
      });
    }
  );

  server.registerTool(
    "qiuye_ui_get_shadcn_add_command",
    {
      title: "Get shadcn add command",
      description:
        "生成安装命令（npx 或 pnpm dlx）。默认使用 @qiuye-ui registry alias。",
      inputSchema: z
        .object({
          name: z.string().min(1).describe("组件名（例如 responsive-tabs）"),
          pm: z
            .enum(["npx", "pnpm"])
            .optional()
            .describe("包管理器：npx 或 pnpm（默认 npx）"),
          alias: z
            .string()
            .optional()
            .describe("registry alias（默认 @qiuye-ui）"),
        })
        .strict(),
      annotations: { readOnlyHint: true },
    },
    async ({ name, pm, alias }) => {
      const normalized = normalizeRegistryName(name);
      const regAlias = alias?.trim() || "@qiuye-ui";
      const cmd =
        pm === "pnpm"
          ? `pnpm dlx shadcn@latest add ${regAlias}/${normalized}`
          : `npx shadcn@latest add ${regAlias}/${normalized}`;
      return toolText(cmd);
    }
  );

  // Resources
  server.registerResource(
    "qiuye_ui_registry_index",
    "qiuye-ui://registry/index",
    {
      title: "QiuYe UI registry index",
      description: "List of all QiuYe UI registry items.",
      mimeType: "application/json",
    },
    async (uri) => {
      const index = await getIndex(base);
      return {
        contents: [
          {
            uri: uri.href,
            json: index,
          },
        ],
      };
    }
  );

  server.registerResource(
    "qiuye_ui_registry_item",
    new ResourceTemplate("qiuye-ui://registry/{name}", { list: undefined }),
    {
      title: "QiuYe UI registry item",
      description:
        "Registry item JSON for a specific component (includes files[].content).",
      mimeType: "application/json",
    },
    async (uri, { name }) => {
      const { item } = await getRegistryItemByName(base, name);
      return {
        contents: [
          {
            uri: uri.href,
            json: item,
          },
        ],
      };
    }
  );

  const transport = new StdioServerTransport();
  await server.connect(transport);

  console.error(`QiuYe UI MCP Server (stdio) is running... (base=${base})`);

  process.stdin.on("close", () => {
    console.error("stdin closed, shutting down MCP server...");
    server.close();
  });
}

function printHelp() {
  console.log(`qiuye-ui-mcp (CLI)\n\nUsage:\n  qiuye-ui-mcp mcp [--registry-base <url>]\n  qiuye-ui-mcp --check [--registry-base <url>]\n\nEnv:\n  QIUIYE_UI_REGISTRY_BASE=...\n\nExamples:\n  qiuye-ui-mcp mcp\n  qiuye-ui-mcp mcp --registry-base http://localhost:3000/registry\n  qiuye-ui-mcp --check\n`);
}

(async function main() {
  const { positional, flags } = parseArgs(process.argv.slice(2));

  if (flags.help || flags.h) {
    printHelp();
    return;
  }

  if (flags.check) {
    await runCheck(flags);
    return;
  }

  // 兼容：无 subcommand 时默认启动 mcp
  const sub = positional[0];

  if (!sub || sub === "mcp") {
    await runMcp(flags);
    return;
  }

  printHelp();
  process.exitCode = 1;
})().catch((e) => {
  console.error("❌ qiuye-ui-mcp CLI error:", e);
  process.exit(1);
});
