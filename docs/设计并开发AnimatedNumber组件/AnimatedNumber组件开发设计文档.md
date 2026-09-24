# AnimatedNumber · 逐位数字过渡

## 需求与范围

用于计数、金额和年月导航。稳定数位不退场，变化数字局部位移、透明度与可选模糊；位数增减时真实占位连续变化。默认 280ms、无回弹、3px 模糊。名称为 AnimatedNumber，registry id 为 animated-number。

## 结构与动画归属

- Intl.NumberFormat.formatToParts 分离整数、小数、分组及符号。整数从个位向左编号，小数从十分位向右编号；不按全文字符下标匹配。
- 稳定字符槽控制 width；槽内字形按字符值切换，AnimatePresence 保留退出字形。变宽时不缩放文字。
- 隐藏自然排版行一次测量各槽宽，并用单个 ResizeObserver 跟随字体或字号变化。测量对象不受动画宽度约束。
- 年/月分别调用组件，单位由业务侧固定渲染。跨年方向由完整日期比较后统一传给两个数字。
- 首次渲染无入场；高频更新接续当前动画，不排队生成中间数字。减少动态效果/animated=false/duration=0 直接显示当前值。
- 读屏只暴露当前完整数字；动画副本与测量行隐藏，不设置自动 live 播报。需要播报的业务自行在外层设置 aria-live。
- locales 默认 en-US，SSR 与客户端使用相同显式配置。格式化遵循 Intl；不处理任意日期字符串或任意文本动画。

## 接入清单

源码、公共格式化工具、完整 Demo、快速预览、首页卡片、基础用法、Props API、registry item、MCP 兜底列表和 README 同步。CLI 页面通过 getAllComponents 自动读取元信息，无需手写列表。

博客按 registry 源码复制方式消费，保留同路径 lib 工具，源码与组件库保持一致；不为未发布组件依赖线上 registry，也不建立跨仓库运行时引用。

## 验收

关注 2025→2024 的前三位不动；9↔10、99↔100、999↔1,000 的宽度及单位位置连续；小数位、负号、无 blur、快速反向、减少动态效果、浅深主题和窄屏。类型/构建不能替代运行中采样。

## 实施与验证记录（2026-09-24）

- 位数退出改用 usePresence + 实际占位动画完成回调；连续 1000→9→10 后仅有最终两个槽，未残留宽度为零的退出副本。内部字形继续使用独立 Presence。
- 测量 flex 子项的 computed width，避免首页祖先的入场 transform 缩放污染尺寸。
- 浏览器采样：静止年份前三位 opacity=1、无位移；变化位存在中间透明度和 blur；进退位与单位坐标连续，关闭 blur 后为 0px。
- 已检查详情页演示和 API、首页按钮交互、浅深主题、390px 详情页及博客 Header，无横向溢出。
- 修复详情页已有代码示例在深色初访时的主题 hydration 属性不一致，使用 SSR/client 一致快照。
- node --test scripts/animated-number.test.mjs：3 组通过，涵盖数位身份、分组/精度、4 个 locale 及负号/非有限值。
- 系统减少动态效果使用 useSyncExternalStore 媒体查询订阅，支持运行时更新；浏览器验证覆盖 animated=false 的相同立即显示分支，未修改系统偏好。

最终验证：组件库 next build 完成 22 个静态页面（含新详情页）；博客相关 ESLint 与 TypeScript 通过；registry 内容与两仓库源码逐字比对通过。

提交前同步远端 main（ba85d62）：保留新版 README 与 ClipPathTabs，AnimatedNumber 归入「视觉与动效」分类；重新生成 registry 后共 16 个组件，回归测试与 23 个静态页面的完整构建通过。

## 跨年变宽尾段抖动修复（2026-09-24）

- 复现：2025 年 12 月 ↔ 2026 年 1 月；关闭 blur，放慢至 1 秒观察变化字形和宽度尾段。
- 采样旧实现时，布局坐标连续，但字形的 transform 在动画结束时切换为 none，且 blur=false 仍输出 blur(0px)。这些绘制路径切换可能引起字形重新栅格化；DOM 坐标采样本身不能证明浏览器内部的栅格化原因。
- 拆为只控制 width 的占位层、保持 max-content 的字面层，以及独立切换的字形层；缩窄槽位不再同时缩窄视觉层。
- 字面与字形保留 translateZ(0) 和 transform 绘制提示，静止与过渡使用一致的 transform 路径。模糊强度由 CSS 变量驱动，关闭时直接设置 filter:none，避免 Motion 将 none 插值成 blur(0px)。
- 不改变数位键、默认时长、真实占位过渡、退出生命周期及减少动态效果分支。
- Demo 新增 2026 年 1 月预设，方便与 2025 年 12 月反复对比。
- 浏览器检查：跨年双向连续画面；退位 140 次 DOM 采样宽度无反向，尾帧稳定；blur=false 实际 filter 为 none，blur=true 可见中间 blur 值；1000→9→10 后仅保留两个槽；关闭动画后直接显示数值。控制台无新增警告/错误。
