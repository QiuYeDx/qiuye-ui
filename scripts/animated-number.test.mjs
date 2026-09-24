import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import ts from "typescript";
const code = ts.transpileModule(fs.readFileSync(new URL("../lib/animated-number.ts", import.meta.url), "utf8"), { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText;
const { getNumberTokens } = await import("data:text/javascript;base64," + Buffer.from(code).toString("base64"));
test("年份只改变末位字符，9→10 保留个位身份", () => {
  const a = getNumberTokens(2025).tokens;
  const b = getNumberTokens(2024).tokens;
  assert.deepEqual(a.slice(0, 3), b.slice(0, 3));
  assert.equal(a[3].key, b[3].key);
  assert.equal(getNumberTokens(9).tokens[0].key, getNumberTokens(10).tokens[1].key);
});
test("分组符以整数数位定位，小数精度扩展不更换已有小数身份", () => {
  const a = getNumberTokens(999.9, "en-US", { minimumFractionDigits: 2 }).tokens;
  const b = getNumberTokens(1000.01, "en-US", { minimumFractionDigits: 2 }).tokens;
  assert.deepEqual(b.filter(t => t.key.startsWith("group")), [{ key: "group:3", text: "," }]);
  assert.deepEqual(a.filter(t => t.key.startsWith("fraction")).map(t => t.key), b.filter(t => t.key.startsWith("fraction")).map(t => t.key));
});
test("Intl 输出完整，所有槽身份唯一，包含负号/本地数字/非有限值", () => {
  for (const locale of ["en-US", "de-DE", "ar-EG", "zh-CN"]) {
    for (const value of [-1234567.89, -0, 0, 1, 10, 1000.01, NaN, Infinity]) {
      const format = { style: "currency", currency: "CNY", minimumFractionDigits: 2 };
      const { text, tokens } = getNumberTokens(value, locale, format);
      assert.equal(text, new Intl.NumberFormat(locale, format).format(value));
      assert.equal(tokens.map(t => t.text).join(""), text);
      assert.equal(new Set(tokens.map(t => t.key)).size, tokens.length);
    }
  }
});
