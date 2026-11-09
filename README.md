# OpenClaw 阿罗娜主题

以《蔚蓝档案》的阿罗娜为主题，为 OpenClaw Control UI 带来蓝白配色、半透明面板、全界面背景、漂浮光点和动态表情。

本项目提供修改后的 **Control UI 前端源码**。普通用户可以下载本仓库 **Releases** 中的 `control-ui` 构建压缩包，搭配已有的 OpenClaw Gateway 使用，无需自行编译。

> 本项目是非官方界面定制，不包含独立的 AI 服务。模型配置、Agent 执行、消息处理和 Gateway 仍由 OpenClaw 提供。主题包需要与 Gateway 版本匹配，不能作为通用皮肤安装到任意 OpenClaw 版本。

## 界面改动

| 内容             | 说明                                                                                                      |
| ---------------- | --------------------------------------------------------------------------------------------------------- |
| 蓝白配色         | 浅蓝色按钮、边框和选中状态，调整聊天气泡与输入框的视觉样式。                                              |
| 阿罗娜背景       | 内置背景图片，扩展到应用外层，覆盖聊天界面、左侧导航及右侧详情等区域。                                    |
| 半透明面板       | 左侧导航、导航窄栏、右侧详情与文件侧栏等主要面板采用 35% 底色不透明度，让背景透出。文字保持正常不透明度。 |
| 漂浮光点         | 使用 CSS 制作白色与浅蓝色双色光点，保留轻柔漂浮效果，不使用蓝色描边光圈。                                 |
| 动态表情         | 在 AI 回复气泡中显示阿罗娜表情，从六组 GIF 中选择；同一消息在流式更新期间保持稳定。                       |
| 详情布局修复     | 修复 Agent 工作详情展开后内容被挤压、文字相互覆盖的问题。                                                 |
| 表格布局修复     | 表格保持在回复气泡内部，过宽时可内部横向滚动，保留展开查看与复制功能。                                    |
| 移动端与辅助功能 | 适配窄屏布局；根据系统的减少动态效果、高对比度等偏好调整效果，并为 GIF 提供静态图片。                     |

这里的 **35% 是部分面板底色的 alpha 值**，即 35% 底色、65% 透明，并非对整个界面设置 `opacity: 0.35`。聊天气泡、输入框、代码区与背景图片使用各自的样式参数，以保证可读性。

## 兼容性与准备工作

- 已安装并能正常使用 OpenClaw Gateway。
- 本次主题源码所在的 OpenClaw 工程，其 `package.json` 版本为 **2026.10.10**。具体兼容范围以所下载 Release 的说明为准，其他版本尚未据此获得兼容性保证。
- 下载与 Gateway 版本匹配的主题包。即使版本号相同，不同源码提交也可能有差异；Release 应同时标注构建所用的源码提交或来源快照。
- 在运行 Gateway 的机器上保存并配置主题文件。若 Gateway 在服务器、Docker 或 WSL 中，路径必须在对应运行环境内可访问。
- 备份原有的 `gateway.controlUi.root` 配置值，便于恢复。

查看当前版本和原有配置：

```sh
openclaw --version
openclaw config get gateway.controlUi.root
```

如果第二条命令提示配置项不存在，记下“原来未设置”即可。

以下安装命令以已安装 `openclaw` CLI 为例。源码运行者应在完整 OpenClaw 工程根目录使用 `pnpm openclaw ...` 执行对应命令，并使用自己原有的 Gateway 启动方式。

## 从 Release 安装（推荐）

### 1. 下载并解压

进入本仓库的 **Releases**，下载发布者提供的 `control-ui` 压缩包。GitHub 自动生成的 **Source code** 压缩包是源码，不是可直接部署的页面。

将文件解压到一个固定目录。最终要找到直接包含 `index.html` 的目录，例如：

```text
control-ui/
├── index.html
├── assets/
└── 其他构建生成的文件和目录
```

请保留整个构建目录，包括随包提供的 `.br`、`.gz` 等文件，不要只复制 `index.html` 或某一个 CSS 文件。

示例安装位置：

- Windows：`C:/OpenClawThemes/arona/control-ui`
- Linux：`/opt/openclaw-themes/arona/control-ui`

这些只是示例路径，可以自行更换。如果解压后出现 `control-ui/control-ui/index.html`，应选择内层直接包含 `index.html` 的目录。

### 2. 指定自定义界面目录

Windows PowerShell：

```powershell
openclaw config set gateway.controlUi.root "C:/OpenClawThemes/arona/control-ui"
```

Linux：

```sh
openclaw config set gateway.controlUi.root "/opt/openclaw-themes/arona/control-ui"
```

此配置让 Gateway 从指定目录提供前端页面。使用运行当前 Gateway 的同一用户、配置文件及 profile 执行命令；服务进程需要有读取该目录的权限。

Docker 用户需先将主题目录挂载到容器内，再把配置设为**容器内路径**。不要将宿主机路径直接当作容器内路径使用。

### 3. 应用配置并打开页面

按照 CLI 输出的提示应用配置。如果使用 OpenClaw 安装的 Gateway 服务，可以执行：

```sh
openclaw gateway restart
```

如果使用前台进程、Docker 或其他进程管理器，请通过原有管理方式重启对应实例；重启会短暂中断当前连接，建议等待正在进行的工作结束。

重新打开原来的 OpenClaw 地址，并强制刷新页面。Windows / Linux 通常使用 `Ctrl + Shift + R`。

### 4. 开启阿罗娜外观

在界面的 **设置 → 外观（Appearance）** 中：

1. 选择默认 `claw` 主题。
2. 将显示模式设为浅色（Light）。
3. 将背景选为主题插画（Theme artwork），以显示内置阿罗娜图片和光点。

已有用户的外观设置可能继续沿用原值，安装主题包不会强制重置所有偏好。若选择了自定义背景图片，内置阿罗娜背景可能不会显示；其他配色主题和深色模式也不提供同样的完整效果。

安装后可发送一条普通消息和一条包含多列表格的消息，确认表情能够显示、表格在气泡内滚动，并展开右侧详情检查背景与文字布局。

## 更新与恢复

### 更新主题

将新 Release 解压到一个**新的目录**，检查版本兼容性，再将 `gateway.controlUi.root` 改为新目录。按需重启 Gateway 并刷新页面。保留旧目录，出现问题时可将配置切回。

OpenClaw 升级后，应重新确认主题包兼容性。自定义目录中的文件不会因为升级 OpenClaw 自动变成匹配的新版本。

### 恢复原界面

如果安装前没有设置 `gateway.controlUi.root`：

```sh
openclaw config unset gateway.controlUi.root
```

如果安装前已经使用其他自定义界面，请使用 `openclaw config set gateway.controlUi.root` 恢复之前记录的路径，不要直接删除配置。

按照配置命令的提示应用变更，必要时重启 Gateway，再强制刷新页面。默认界面的构建资源仍需存在于 OpenClaw 安装中；本安装方式无需覆盖这些原始资源。

## 从源码构建

本仓库上传的是 OpenClaw 的 `ui` 目录。它依赖完整工程中的 `scripts/`、`src/`、`packages/` 及多个 `workspace:*` 包，**不能把这个目录当作独立前端项目直接安装和构建**。

1. 准备与主题 Release 对应的完整 OpenClaw 源码快照。
2. 备份完整工程原有的 `ui` 目录，再将本项目内容放入该工程的 `ui` 目录。如果本仓库根目录已经包含 `package.json`、`src/`、`public/`，复制这些内容到目标 `ui/` 内，不要形成 `ui/ui/`。
3. 在完整 OpenClaw 工程根目录安装依赖并构建。

本次基础工程声明的工具版本为：

- Node.js：`>=24.16.0 <25 || >=26.1.0`。
- pnpm：`12.15.0`，以完整工程根目录 `package.json` 的 `packageManager` 声明为准。

```sh
# 在完整 OpenClaw 工程根目录执行
pnpm install --frozen-lockfile
pnpm ui:build
```

默认构建输出为完整工程中的 `dist/control-ui/`。将整个目录作为部署内容，按照前面的自定义目录方式加载。

如果修改了源码，不应只覆盖不同版本工程中的几个文件来追求“能编译”；先对齐基础源码，再检查 Gateway 与页面交互。

### 发布构建包

发布者可将构建成功的整个 `dist/control-ui/` 目录打包，作为 Release 附件。Release 说明建议包含：

- 主题版本、构建日期与对应的 OpenClaw 版本。
- 构建所用源码提交或来源快照、已验证的 Gateway 版本。
- 本次修改、已知限制及安装目录结构。

不要把 `node_modules/`、本地 Gateway 配置、令牌、聊天记录、`.artifacts/` 或测试日志放进发布包。仅发布源码时，也应排除 `ui/.vitest/` 等本地测试产物。

## 主要修改位置

以下路径以本项目目录为基准；放回完整 OpenClaw 工程后均位于 `ui/` 下。

| 路径                                                                                                                                         | 用途                                                     |
| -------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| `src/styles/arona.css`                                                                                                                       | 主题主体、半透明面板、光点动画、GIF 布局及表格溢出修复。 |
| `src/styles/base.css`                                                                                                                        | 蓝白色板与颜色变量。                                     |
| `src/styles/theme-backgrounds.css`                                                                                                           | 内置背景图片及图片叠色。                                 |
| `src/styles/layout.css`、`src/app/app-shell-view.tsx`                                                                                        | 全界面背景的布局与挂载。                                 |
| `src/styles/chat/tool-cards.css`                                                                                                             | 工作详情展开后的布局修复。                               |
| `src/pages/chat/components/arona-stickers.ts`                                                                                                | 表情资源与稳定选择逻辑。                                 |
| `src/pages/chat/components/chat-message-bubble-view.tsx`                                                                                     | 在回复中渲染表情。                                       |
| `src/assets/themes/arona-background.jpg`                                                                                                     | 内置阿罗娜背景。                                         |
| `src/assets/arona-stickers/`                                                                                                                 | 六个 GIF 及六张静态 PNG。                                |
| `src/app/settings-contract.ts`、`index.html`、`src/styles.css`                                                                               | 默认外观、初始页面颜色及主题样式入口。                   |
| `src/app/server-prefs.test.ts`、`src/e2e/theme-background.test-support.ts`、`src/pages/chat/components/chat-activity-layout.browser.test.ts` | 外观与布局相关的测试调整。                               |
| `config/control-ui-boot-modules.json`                                                                                                        | 重新生成的启动模块清单。                                 |

图片和 GIF 均已包含在项目中，不依赖原作者电脑的图片目录。修改素材或 CSS 后需要重新构建，已部署的压缩包不会自动同步源码变化。

## 常见问题

**安装后仍是原来的页面。**

检查配置是否写入正在运行的 Gateway 实例，`gateway.controlUi.root` 是否指向正确目录；根据提示应用配置后强制刷新。仍有问题时可用隐私窗口打开，以区分缓存与安装问题。

**提示找不到 Control UI 资源，或页面空白。**

确认配置目录直接包含 `index.html`，`assets/` 和其他文件均完整解压，Gateway 服务用户可读取文件。不要通过双击 HTML 或 `file://` 打开，应从 Gateway 的原有访问地址进入。

**页面显示，但无法连接、提示版本不匹配或部分功能失效。**

核对主题包和 Gateway 的版本及来源快照。使用匹配构建；暂时没有匹配版本时，先恢复原界面。不要通过关闭身份验证或放宽安全配置解决主题兼容问题。

**看不到阿罗娜背景或漂浮光点。**

检查是否启用了默认 `claw` 主题、浅色模式及主题插画背景；自定义背景可能覆盖内置图片。系统的减少动态效果、高对比度或减少透明度设置也可能有意关闭动画或改变背景表现。

**GIF 不动。**

检查系统是否启用了减少动态效果；这种情况下显示静态图片属于预期行为。也请检查压缩包是否完整以及浏览器是否加载到对应资源。

**只下载源码后执行安装，提示缺少工作区依赖。**

本项目依赖完整 OpenClaw 工作区。普通用户请选择 Release 构建包；开发者请按照“从源码构建”章节操作。

## 说明与致谢

本项目基于 OpenClaw Control UI，主题灵感来自《蔚蓝档案》与阿罗娜。项目不代表 OpenClaw 或《蔚蓝档案》官方。

OpenClaw 上游代码采用 MIT License，分发时请保留上游许可证及版权声明。角色、背景图片和 GIF 的权利属于各自权利人，不因代码采用 MIT License 而自动取得相同授权。
