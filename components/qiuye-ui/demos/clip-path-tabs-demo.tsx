"use client";

import { useState } from "react";
import {
  CircleUserRoundIcon,
  CreditCardIcon,
  LayoutDashboardIcon,
  ReceiptTextIcon,
  Settings2Icon,
  SlidersHorizontalIcon,
  UserRoundIcon,
  WalletCardsIcon,
} from "lucide-react";

import {
  ClipPathTabs,
  type ClipPathTabsItem,
} from "@/components/qiuye-ui/clip-path-tabs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ViewSourceButton } from "@/components/view-source-button";

const sourceCodes = {
  shapes: `import { useState } from "react";
import { ClipPathTabs } from "@/components/qiuye-ui/clip-path-tabs";

export function Demo() {
  const [value, setValue] = useState("overview");

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <ClipPathTabs
        ariaLabel="Pill 形状"
        shape="pill"
        value={value}
        onValueChange={setValue}
        items={items}
      />

      <ClipPathTabs
        ariaLabel="Rounded 形状"
        shape="rounded"
        cornerRadius={10}
        smoothCorners
        smoothCornerSmoothing={0.75}
        value={value}
        onValueChange={setValue}
        items={items}
      />
    </div>
  );
}`,
  states: `<ClipPathTabs
  ariaLabel="设置视图"
  defaultValue="general"
  size="sm"
  inactiveBackground="var(--background)"
  activeBackground="#e5484d"
  activeForeground="#ffffff"
  items={[
    { value: "general", label: "通用" },
    { value: "account", label: "账户" },
    { value: "advanced", label: "高级", disabled: true },
  ]}
/>`,
  segmented: `<ClipPathTabs
  ariaLabel="分段过渡示例"
  defaultValue="payments"
  transitionMode="segmented"
  items={items}
/>`,
};

const accountItems: ClipPathTabsItem[] = [
  { value: "payments", label: "支付", icon: <CreditCardIcon /> },
  { value: "balance", label: "余额", icon: <WalletCardsIcon /> },
  { value: "customers", label: "客户", icon: <UserRoundIcon /> },
  { value: "billing", label: "账单", icon: <ReceiptTextIcon /> },
];

const workspaceItems: ClipPathTabsItem[] = [
  { value: "overview", label: "概览", icon: <LayoutDashboardIcon /> },
  { value: "preferences", label: "偏好", icon: <SlidersHorizontalIcon /> },
  { value: "profile", label: "资料", icon: <CircleUserRoundIcon /> },
];

const settingsItems: ClipPathTabsItem[] = [
  { value: "general", label: "通用", icon: <Settings2Icon /> },
  { value: "account", label: "账户", icon: <CircleUserRoundIcon /> },
  { value: "advanced", label: "高级", disabled: true },
];

export function ClipPathTabsDemo() {
  const [shapeView, setShapeView] = useState("overview");

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <CardTitle>形状对比：Pill 与 Rounded</CardTitle>
            <ViewSourceButton
              code={sourceCodes.shapes}
              title="Pill 与 Rounded - 源码"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">Pill</p>
              <ClipPathTabs
                ariaLabel="Pill 形状"
                shape="pill"
                value={shapeView}
                onValueChange={setShapeView}
                items={workspaceItems}
                className="max-w-full"
              />
            </div>

            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">
                Rounded
              </p>
              <ClipPathTabs
                ariaLabel="Rounded 形状"
                shape="rounded"
                cornerRadius={10}
                smoothCorners
                smoothCornerSmoothing={0.75}
                value={shapeView}
                onValueChange={setShapeView}
                items={workspaceItems}
                className="max-w-full"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <CardTitle>保留间隙的分段过渡</CardTitle>
            <ViewSourceButton
              code={sourceCodes.segmented}
              title="分段过渡 - 源码"
            />
          </div>
        </CardHeader>
        <CardContent>
          <ClipPathTabs
            ariaLabel="分段过渡示例"
            defaultValue="payments"
            transitionMode="segmented"
            items={accountItems}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <CardTitle>普通态底色与禁用项</CardTitle>
            <ViewSourceButton
              code={sourceCodes.states}
              title="普通态底色与禁用项 - 源码"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-4 rounded-md bg-muted/50 p-3">
            <ClipPathTabs
              ariaLabel="设置视图"
              defaultValue="general"
              size="sm"
              inactiveBackground="var(--background)"
              activeBackground="#e5484d"
              activeForeground="#ffffff"
              items={settingsItems}
            />
            <Badge variant="outline">高级不可用</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
