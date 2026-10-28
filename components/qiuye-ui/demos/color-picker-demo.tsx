"use client";

import { useState } from "react";
import { ColorPicker } from "../color-picker";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ViewSourceButton } from "@/components/view-source-button";

/* -------------------------------------------------------------------------- */
/*                              Source Codes                                   */
/* -------------------------------------------------------------------------- */

const sourceCodes = {
  basic: `import { useState } from "react";
import { ColorPicker } from "@/components/qiuye-ui/color-picker";

function BasicDemo() {
  const [color, setColor] = useState("#6366F1");

  return (
    <div className="flex items-center gap-4">
      <ColorPicker value={color} onChange={setColor} />
      <span className="text-sm font-mono">{color}</span>
    </div>
  );
}`,
  uncontrolled: `import { ColorPicker } from "@/components/qiuye-ui/color-picker";

function UncontrolledDemo() {
  return (
    <ColorPicker
      defaultValue="#22C55E"
      onChange={(color) => console.log("选中颜色:", color)}
    />
  );
}`,
  sizes: `import { ColorPicker } from "@/components/qiuye-ui/color-picker";

function SizesDemo() {
  return (
    <div className="flex items-center gap-3">
      <ColorPicker defaultValue="#EF4444" triggerSize="sm" />
      <ColorPicker defaultValue="#F59E0B" triggerSize="md" />
      <ColorPicker defaultValue="#3B82F6" triggerSize="lg" />
    </div>
  );
}`,
  smoothCorners: `import { ColorPicker } from "@/components/qiuye-ui/color-picker";

function SmoothCornersDemo() {
  return (
    <div className="grid gap-6 sm:grid-cols-2">
      <ColorPicker
        mode="inline"
        defaultValue="#F97316"
        smoothCorners={false}
      />
      <ColorPicker
        mode="inline"
        defaultValue="#6366F1"
        smoothCornerSmoothing={0.75}
      />
    </div>
  );
}`,
  inline: `import { useState } from "react";
import { ColorPicker } from "@/components/qiuye-ui/color-picker";

function InlineDemo() {
  const [color, setColor] = useState("#8B5CF6");

  return (
    <div className="space-y-3">
      <ColorPicker mode="inline" value={color} onChange={setColor} />
      <p className="text-sm text-muted-foreground">
        当前颜色: <span className="font-mono">{color}</span>
      </p>
    </div>
  );
}`,
  customPresets: `import { useState } from "react";
import { ColorPicker } from "@/components/qiuye-ui/color-picker";

const brandColors = [
  "#FF6900", "#FCB900", "#7BDCB5", "#00D084",
  "#8ED1FC", "#0693E3", "#EB144C", "#F78DA7",
  "#9900EF", "#ABB8C3",
];

function CustomPresetsDemo() {
  const [color, setColor] = useState("#0693E3");

  return (
    <ColorPicker
      value={color}
      onChange={setColor}
      presetColors={brandColors}
    />
  );
}`,
  alpha: `import { useState } from "react";
import { ColorPicker } from "@/components/qiuye-ui/color-picker";

function AlphaDemo() {
  const [color, setColor] = useState("#6366F180");

  return (
    <div className="flex items-center gap-4">
      <ColorPicker value={color} onChange={setColor} showAlpha />
      <span className="text-sm font-mono">{color}</span>
    </div>
  );
}`,
  alphaInline: `import { useState } from "react";
import { ColorPicker } from "@/components/qiuye-ui/color-picker";

function AlphaInlineDemo() {
  const [color, setColor] = useState("#3B82F6B3");

  return (
    <div className="space-y-3">
      <ColorPicker
        mode="inline"
        value={color}
        onChange={setColor}
        showAlpha
      />
      <p className="text-sm text-muted-foreground">
        当前颜色: <span className="font-mono">{color}</span>
      </p>
    </div>
  );
}`,
  noPresets: `import { ColorPicker } from "@/components/qiuye-ui/color-picker";

function NoPresetsDemo() {
  return (
    <ColorPicker
      defaultValue="#14B8A6"
      presetColors={false}
      showRecent={false}
    />
  );
}`,
  colorPreview: `import { useState } from "react";
import { ColorPicker } from "@/components/qiuye-ui/color-picker";

function ColorPreviewDemo() {
  const [bg, setBg] = useState("#6366F1");
  const [text, setText] = useState("#FFFFFF");

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm">背景色</span>
          <ColorPicker value={bg} onChange={setBg} triggerSize="sm" />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm">文字色</span>
          <ColorPicker value={text} onChange={setText} triggerSize="sm" />
        </div>
      </div>
      <div
        className="rounded-lg p-6 text-center font-semibold"
        style={{ backgroundColor: bg, color: text }}
      >
        预览效果
      </div>
    </div>
  );
}`,
};

/* -------------------------------------------------------------------------- */
/*                              Demo Components                               */
/* -------------------------------------------------------------------------- */

export function ColorPickerDemo() {
  const [basicColor, setBasicColor] = useState("#6366F1");
  const [inlineColor, setInlineColor] = useState("#8B5CF6");
  const [customColor, setCustomColor] = useState("#0693E3");
  const [bgColor, setBgColor] = useState("#6366F1");
  const [textColor, setTextColor] = useState("#FFFFFF");
  const [uncontrolledLog, setUncontrolledLog] = useState<string | null>(null);
  const [alphaColor, setAlphaColor] = useState("#6366F180");
  const [alphaInlineColor, setAlphaInlineColor] = useState("#3B82F6B3");

  const brandColors = [
    "#FF6900", "#FCB900", "#7BDCB5", "#00D084",
    "#8ED1FC", "#0693E3", "#EB144C", "#F78DA7",
    "#9900EF", "#ABB8C3",
  ];

  return (
    <div className="space-y-8">
      {/* 基础用法 */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-1.5">
              <CardTitle>基础用法</CardTitle>
              <CardDescription>
                受控模式，点击色块弹出取色面板
              </CardDescription>
            </div>
            <ViewSourceButton code={sourceCodes.basic} title="基础用法 - 源码" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <ColorPicker value={basicColor} onChange={setBasicColor} />
            <span className="text-sm font-mono text-muted-foreground">
              {basicColor}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* 非受控模式 */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-1.5">
              <CardTitle>非受控模式</CardTitle>
              <CardDescription>
                使用 defaultValue 设置初始颜色，无需维护外部状态
              </CardDescription>
            </div>
            <ViewSourceButton
              code={sourceCodes.uncontrolled}
              title="非受控模式 - 源码"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <ColorPicker
              defaultValue="#22C55E"
              onChange={(c) => setUncontrolledLog(c)}
            />
            {uncontrolledLog && (
              <span className="text-sm text-muted-foreground">
                onChange: <code className="font-mono">{uncontrolledLog}</code>
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 触发器尺寸 */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-1.5">
              <CardTitle>触发器尺寸</CardTitle>
              <CardDescription>
                三种触发器大小：sm / md / lg
              </CardDescription>
            </div>
            <ViewSourceButton
              code={sourceCodes.sizes}
              title="触发器尺寸 - 源码"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">sm</Badge>
            <Badge variant="secondary">md</Badge>
            <Badge variant="secondary">lg</Badge>
          </div>
          <div className="flex items-center gap-3 mt-4">
            <div className="flex flex-col items-center gap-2">
              <ColorPicker defaultValue="#EF4444" triggerSize="sm" />
              <span className="text-xs text-muted-foreground">sm</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <ColorPicker defaultValue="#F59E0B" triggerSize="md" />
              <span className="text-xs text-muted-foreground">md</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <ColorPicker defaultValue="#3B82F6" triggerSize="lg" />
              <span className="text-xs text-muted-foreground">lg</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 平滑圆角 */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-1.5">
              <CardTitle>平滑圆角</CardTitle>
              <CardDescription>
                默认启用渐进增强平滑圆角，也可关闭或调整平滑强度；容器圆角由内层圆角加内边距推出，四角内外间距一致
              </CardDescription>
            </div>
            <ViewSourceButton
              code={sourceCodes.smoothCorners}
              title="平滑圆角 - 源码"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-3">
              <Badge variant="secondary">标准圆角</Badge>
              <ColorPicker
                mode="inline"
                defaultValue="#F97316"
                smoothCorners={false}
              />
            </div>
            <div className="space-y-3">
              <Badge variant="secondary">平滑圆角 · 0.75</Badge>
              <ColorPicker
                mode="inline"
                defaultValue="#6366F1"
                smoothCornerSmoothing={0.75}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 内嵌模式 */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-1.5">
              <CardTitle>内嵌模式</CardTitle>
              <CardDescription>
                设置 mode=&quot;inline&quot; 直接将取色面板嵌入页面
              </CardDescription>
            </div>
            <ViewSourceButton
              code={sourceCodes.inline}
              title="内嵌模式 - 源码"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <ColorPicker mode="inline" value={inlineColor} onChange={setInlineColor} />
            <p className="text-sm text-muted-foreground">
              当前颜色: <code className="font-mono">{inlineColor}</code>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* 自定义预设 */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-1.5">
              <CardTitle>自定义预设色卡</CardTitle>
              <CardDescription>
                传入自定义颜色数组替换默认预设
              </CardDescription>
            </div>
            <ViewSourceButton
              code={sourceCodes.customPresets}
              title="自定义预设 - 源码"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <ColorPicker
              value={customColor}
              onChange={setCustomColor}
              presetColors={brandColors}
            />
            <span className="text-sm font-mono text-muted-foreground">
              {customColor}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* 透明度选择 */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-1.5">
              <CardTitle>透明度选择</CardTitle>
              <CardDescription>
                启用 showAlpha 后可选择颜色透明度，输出 8 位十六进制格式
                (#RRGGBBAA)
              </CardDescription>
            </div>
            <ViewSourceButton
              code={sourceCodes.alpha}
              title="透明度选择 - 源码"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <ColorPicker
              value={alphaColor}
              onChange={setAlphaColor}
              showAlpha
            />
            <span className="text-sm font-mono text-muted-foreground">
              {alphaColor}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* 透明度 + 内嵌模式 */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-1.5">
              <CardTitle>透明度 + 内嵌模式</CardTitle>
              <CardDescription>
                showAlpha 与 mode=&quot;inline&quot; 可组合使用
              </CardDescription>
            </div>
            <ViewSourceButton
              code={sourceCodes.alphaInline}
              title="透明度内嵌模式 - 源码"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <ColorPicker
              mode="inline"
              value={alphaInlineColor}
              onChange={setAlphaInlineColor}
              showAlpha
            />
            <p className="text-sm text-muted-foreground">
              当前颜色:{" "}
              <code className="font-mono">{alphaInlineColor}</code>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* 极简模式 */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-1.5">
              <CardTitle>极简模式</CardTitle>
              <CardDescription>
                隐藏预设色卡和最近使用，仅保留 HSV 面板与 Hex 输入
              </CardDescription>
            </div>
            <ViewSourceButton
              code={sourceCodes.noPresets}
              title="极简模式 - 源码"
            />
          </div>
        </CardHeader>
        <CardContent>
          <ColorPicker
            defaultValue="#14B8A6"
            presetColors={false}
            showRecent={false}
          />
        </CardContent>
      </Card>

      {/* 实际应用场景 */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-1.5">
              <CardTitle>实际应用：颜色配置</CardTitle>
              <CardDescription>
                使用 ColorPicker 配置背景色与文字色，实时预览效果
              </CardDescription>
            </div>
            <ViewSourceButton
              code={sourceCodes.colorPreview}
              title="颜色配置 - 源码"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm">背景色</span>
                <ColorPicker
                  value={bgColor}
                  onChange={setBgColor}
                  triggerSize="sm"
                />
                <code className="text-xs font-mono text-muted-foreground">
                  {bgColor}
                </code>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm">文字色</span>
                <ColorPicker
                  value={textColor}
                  onChange={setTextColor}
                  triggerSize="sm"
                />
                <code className="text-xs font-mono text-muted-foreground">
                  {textColor}
                </code>
              </div>
            </div>
            <div
              className="rounded-lg p-6 text-center font-semibold transition-colors"
              style={{ backgroundColor: bgColor, color: textColor }}
            >
              预览效果
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
