这是一个针对大屏编辑器画布交互与标尺系统的 **技术设计文档 (Spec)**。它总结了我们解决布局挤压、缩放滚动、以及标尺同步问题的核心架构方案。

---

## 🎨 大屏编辑器画布与标尺系统技术文档

### 1. 项目概述

本方案旨在构建一个高性能、可缩放的 Web 图形编辑器核心。重点解决在大分辨率画布（如 1920x1080）下，UI 布局的稳定性、画布缩放平滑度、以及专业级标尺同步显示。

### 2. 核心架构设计

#### 2.1 布局架构 (Grid Layout)

采用 CSS Grid 将编辑器划分为四层结构，确保 UI 控件（标尺、Footer）与滚动区域分离。

* **层级管理**：通过 `z-index` 确保标尺容器 (`z: 20`) 和角落方块 (`z: 30`) 始终覆盖在画布视口 (`z: 10`) 之上。
* **溢出控制**：对 `designer-content` 使用 `min-width: 0` 防止 Flex 子元素被内部大尺寸画布撑破。

#### 2.2 标尺渲染机制 (Canvas Based)

为了性能最优，标尺不使用 DOM 节点，而是使用 HTML5 Canvas 绘制。

* **坐标换算公式**：`绘制位置 = (逻辑坐标 * 缩放) + (内边距 * 缩放) - 滚动偏移`。
* **动态步长**：根据 `scale` 自动切换刻度密度（50px -> 100px -> 200px）。
* **高清适配**：引入 `devicePixelRatio (DPR)` 修正 Canvas 物理像素，解决 Retina 屏模糊问题。

#### 2.3 交互逻辑

* **缩放控制**：监听 `wheel` 事件，仅在 `ctrlKey` 按下时触发缩放 Signal 更新。
* **同步策略**：`canvas-viewport` 作为唯一滚动源，通过 `scroll` 事件驱动标尺容器位移。

---

### 3. 任务列表 (Implementation Checklist)

#### 第一阶段：布局与视口修复 (已完成)

* [x] **修复布局挤压**：给中间容器添加 `min-width: 0` 和 `overflow: hidden`。
* [x] **悬浮 Footer**：将缩放控件移出滚动流，改为绝对定位。
* [x] **画布缩放逻辑**：实现基于 Signal 的 `scale` 状态管理及滚轮监听。

#### 第二阶段：标尺系统开发 (已完成)

* [x] **标尺组件化**：创建支持水平/垂直模式的 `RulerComponent`。
* [x] **Canvas 绘制逻辑**：
* [x] 实现 DPR 高清处理。
* [x] 实现基于 `scale` 的动态刻度步长。
* [x] 实现垂直文字旋转绘制。


* [x] **零点对齐**：在绘图逻辑中加入 `canvasPadding` 偏移量。

#### 第三阶段：同步与性能优化 (进行中)

* [ ] **滚动双向同步**：
* [ ] 在 `canvas-viewport` 绑定 `(scroll)="syncRulers($event)"`。
* [ ] 编写 `syncRulers` 函数同步 `scrollLeft/Top` 到标尺容器。


* [ ] **重绘频率限制**：
* [ ] 引入 `requestAnimationFrame` 封装 `drawRuler`。
* [ ] 引入 `drawScheduled` 标志位防止缩放时 Canvas 崩溃。


* [ ] **视觉精修**：
* [ ] 调整标尺字号为 10px，调整刻度线颜色与背景对比度。



---

### 4. 核心代码参考

#### 滚动同步函数

```typescript
syncRulers(event: Event) {
  const viewport = event.target as HTMLElement;
  const hRuler = document.querySelector('.ruler-h-container');
  const vRuler = document.querySelector('.ruler-v-container');

  requestAnimationFrame(() => {
    if (hRuler) hRuler.scrollLeft = viewport.scrollLeft;
    if (vRuler) vRuler.scrollTop = viewport.scrollTop;
  });
}

```

#### 标尺坐标计算逻辑

```typescript
const drawPos = (logicValue * scale) + (padding * scale) - scrollOffset;

```

---

### 5. 后续扩展计划

1. **参考线系统**：支持从标尺区点击并拖出辅助线。
2. **吸附功能**：拖拽组件时自动吸附到标尺刻度或参考线。
3. **多选缩放**：支持选中多个组件后，根据缩放比例统计算变换矩阵。