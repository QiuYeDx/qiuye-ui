"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight, Minus, Plus } from "lucide-react";
import { AnimatedNumber } from "@/components/qiuye-ui/animated-number";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ViewSourceButton } from "@/components/view-source-button";

const dateCode = `const [date, setDate] = useState(2025 * 12 + 8);
const [direction, setDirection] = useState<"up" | "down">("up");
function step(delta: number) {
  setDirection(delta > 0 ? "up" : "down");
  setDate(value => value + delta);
}
return (
  <div className="flex items-baseline">
    <AnimatedNumber value={Math.floor(date / 12)} direction={direction} />
    <span className="mx-2">年</span>
    <AnimatedNumber value={date % 12 + 1} direction={direction} />
    <span className="ml-2">月</span>
    <button onClick={() => step(-1)}>上个月</button>
    <button onClick={() => step(1)}>下个月</button>
  </div>
);`;

/** 首页与详情快速预览：可主动触发进位和退位，没有自动循环。 */
export function AnimatedNumberPreview() {
  const [value, setValue] = useState(99);
  return (
    <div className="flex flex-col items-center gap-5 py-4">
      <div className="flex items-baseline text-5xl font-medium tracking-tight">
        <AnimatedNumber value={value} />
        <span className="ml-2 text-sm font-normal tracking-normal text-muted-foreground">
          次探索
        </span>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          aria-label="减一"
          onClick={() => setValue((v) => v - 1)}
        >
          <Minus className="size-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          aria-label="加一"
          onClick={() => setValue((v) => v + 1)}
        >
          <Plus className="size-4" />
        </Button>
      </div>
    </div>
  );
}

/** AnimatedNumber 完整演示：日期、宽度边界、格式化和动效开关。 */
export function AnimatedNumberDemo() {
  const [date, setDate] = useState(2025 * 12 + 8);
  const [direction, setDirection] = useState<"up" | "down">("up");
  const [blur, setBlur] = useState(true);
  const [animated, setAnimated] = useState(true);
  const [duration, setDuration] = useState(0.28);
  const [count, setCount] = useState(99);
  const [amount, setAmount] = useState(999.9);
  function changeDate(next: number) {
    setDirection(next >= date ? "up" : "down");
    setDate(next);
  }
  const motionProps = { blur, animated, duration };
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <CardTitle>时间漫游</CardTitle>
            <ViewSourceButton
              code={dateCode}
              description="分别动画年份和月份，单位保持稳定。"
            />
          </div>
          <CardDescription>
            只更新变化的数位。试试 9 月到 10 月，或跨过新年。
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex min-h-32 items-center justify-center gap-4 rounded-xl bg-muted/35 px-3 sm:gap-8">
            <Button
              variant="ghost"
              size="icon"
              aria-label="上个月"
              onClick={() => changeDate(date - 1)}
            >
              <ArrowLeft className="size-4" />
            </Button>
            <div
              data-demo-date=""
              className="flex items-baseline whitespace-nowrap text-2xl font-medium sm:text-4xl"
            >
              <AnimatedNumber
                value={Math.floor(date / 12)}
                direction={direction}
                {...motionProps}
              />
              <span className="mx-2 text-base font-normal text-muted-foreground">
                年
              </span>
              <AnimatedNumber
                value={(date % 12) + 1}
                direction={direction}
                {...motionProps}
              />
              <span className="ml-2 text-base font-normal text-muted-foreground">
                月
              </span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              aria-label="下个月"
              onClick={() => changeDate(date + 1)}
            >
              <ArrowRight className="size-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              ["2025 年 9 月", 2025 * 12 + 8],
              ["2025 年 12 月", 2025 * 12 + 11],
              ["2024 年 12 月", 2024 * 12 + 11],
            ].map(([label, value]) => (
              <Button
                key={label}
                size="sm"
                variant="outline"
                onClick={() => changeDate(Number(value))}
              >
                {label}
              </Button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-4 border-t pt-5 text-sm">
            <label className="flex items-center gap-2">
              <Switch
                checked={blur}
                onCheckedChange={setBlur}
                aria-label="字形模糊"
              />
              字形模糊
            </label>
            <label className="flex items-center gap-2">
              <Switch
                checked={animated}
                onCheckedChange={setAnimated}
                aria-label="启用动画"
              />
              启用动画
            </label>
            <label className="flex items-center gap-2">
              时长
              <input
                aria-label="过渡时长"
                type="range"
                min="0.15"
                max="1"
                step="0.01"
                value={duration}
                onChange={(event) => setDuration(Number(event.target.value))}
                className="w-24 accent-current"
              />
              <span className="w-12 tabular-nums text-muted-foreground">
                {duration.toFixed(2)}s
              </span>
            </label>
          </div>
        </CardContent>
      </Card>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>进位与退位</CardTitle>
            <CardDescription>
              数字的实际占位随位数变化，后面的单位平滑跟随。
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div
              data-demo-count=""
              className="flex min-h-24 items-baseline justify-center pt-4 text-5xl font-medium"
            >
              <AnimatedNumber value={count} {...motionProps} />
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                次
              </span>
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              {[9, 10, 99, 100, 999, 1000].map((value) => (
                <Button
                  key={value}
                  size="sm"
                  variant="outline"
                  onClick={() => setCount(value)}
                >
                  {value}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>金额与小数</CardTitle>
            <CardDescription>
              按数位匹配，同时处理负号、千分位和固定小数位。
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div
              data-demo-amount=""
              className="flex min-h-24 items-baseline justify-center pt-4 text-4xl font-medium"
            >
              <AnimatedNumber
                value={amount}
                format={{
                  style: "currency",
                  currency: "CNY",
                  minimumFractionDigits: 2,
                }}
                {...motionProps}
              />
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              {[999.9, 1000.01, -12.5, 0].map((value) => (
                <Button
                  key={value}
                  size="sm"
                  variant="outline"
                  onClick={() => setAmount(value)}
                >
                  {value.toFixed(2)}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      <p className="text-sm leading-relaxed text-muted-foreground">
        组件继承字号和颜色；模糊仅作用于变化的字形。系统开启“减少动态效果”时会立即显示当前数值。用于滚动进度时，建议在业务层按可见精度更新。
      </p>
    </div>
  );
}
