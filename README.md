# Ostra — Considered objects for everyday rituals

面向海外消费者的家居器物选购 Web 应用（React 单页应用）。收录 12 件商品、5 个分类，覆盖「浏览 → 筛选 → 查看细节 → 加入购物袋 → 三步结算 → 订单确认」完整链路，桌面与手机双端适配。

![Ostra storefront](./public/img/corner.jpg)

| 项 | 值 |
| --- | --- |
| 在线地址（主） | https://ostra-store.app.workbuddy.host/ |
| 在线地址（Vercel） | https://ostra-store.vercel.app |
| 代码仓库 | https://github.com/sumuzhi/ostra-store |
| 当前版本 | v1.0.0（commit `091a88e`） |
| 交付文档 | [DELIVERY.md](./DELIVERY.md)（功能范围、设计系统、验收记录） |

---

## 1. 技术栈

| 层 | 选型 | 说明 |
| --- | --- | --- |
| 框架 | React 19 | 函数组件 + Hooks，无类组件 |
| 路由 | React Router 7 | `BrowserRouter`，四条路由 + 通配 404 |
| 构建 | Vite 6 | 开发服务器 + 生产打包 |
| 语言 | JavaScript (ESM) | `.jsx` / `.js`，无 TypeScript |
| 样式 | 原生 CSS | 四个文件分层，CSS 变量承载设计令牌 |
| 状态 | Context + `useReducer` | 购物车 / 收藏 / 促销码 / UI 开关 |
| 持久化 | `localStorage` | 读写失败自动降级为纯内存 |

**有意不引入的依赖**：UI 组件库（MUI / Ant Design）、CSS 框架（Tailwind）、状态库（Redux / Zustand）、动画库（Framer Motion）、图标库、表单库。视觉与交互全部手写，因此运行时不依赖任何第三方 UI 代码，包体与样式冲突都可控。
**也没有引入**：测试框架、ESLint / Prettier。当前唯一的质量门是 `npm run build`（会做完整的模块解析与产物压缩），详见 [§7 质量与限制](#7-质量与已知限制)。

---

## 2. 依赖库清单

### 2.1 运行时依赖（`dependencies`）

| 包 | package.json 声明 | 实际安装 | 用途 |
| --- | --- | --- | --- |
| `react` | `^19.1.0` | 19.3.1 | 组件与 Hooks |
| `react-dom` | `^19.1.0` | 19.3.1 | DOM 渲染 |
| `react-router-dom` | `^7.1.1` | 7.18.4 | 客户端路由、`Link`、`useSearchParams` |

### 2.2 开发依赖（`devDependencies`）

| 包 | package.json 声明 | 实际安装 | 用途 |
| --- | --- | --- | --- |
| `vite` | `^6.0.7` | 6.4.4 | 开发服务器、HMR、生产打包 |
| `@vitejs/plugin-react` | `^4.3.4` | 4.7.0 | JSX 转换与 Fast Refresh |

### 2.3 构建期脚本的依赖

`scripts/prerender-shells.mjs` 只使用 Node 内置模块（`node:fs`、`node:path`），**不需要额外安装任何包**，也不参与浏览器运行时。

> `package-lock.json` 锁定全部传递依赖（lockfileVersion 3），`npm ci` 可复现完全一致的依赖树。

### 2.4 外部资源依赖（非 npm）

| 资源 | 来源 | 用途 | 断网影响 |
| --- | --- | --- | --- |
| Fraunces | Google Fonts | 标题衬线字体 | 回退到系统衬线体，版式仍可用 |
| Inter | Google Fonts | 正文无衬线字体 | 回退到系统无衬线体 |

字体通过 `index.html` 中的 `preconnect` + 一条 `fonts.googleapis.com` 样式表加载。若演示环境需要**完全离线**，把字体文件下载到 `public/fonts/` 并改用本地 `@font-face` 即可，不涉及任何代码改动。

图片全部是仓库内的静态文件（`public/img/`，约 2.1 MB），不依赖外部图床。

---

## 3. 环境要求

| 项 | 要求 | 本项目验证环境 |
| --- | --- | --- |
| Node.js | ≥ 18（Vite 6 支持 18 / 20 / 22+；推荐 22 LTS） | v22.22.2 |
| npm | ≥ 9 | 10.9.7 |
| 浏览器 | 支持 ES2020、CSS `aspect-ratio`、`backdrop-filter` | Chrome / Safari / Firefox 近两年版本 |

Node 版本过低时 `vite` 会在启动阶段直接报引擎不兼容，升级 Node 即可，无需改动代码。

---

## 4. 快速开始

```bash
# 1. 安装依赖（首次或 package-lock.json 变更后）
npm install

# 2. 启动开发服务器
npm run dev
```

打开 **http://localhost:5180** 即可。

> 端口固定为 `5180` 且开启了 `strictPort`：若被占用会直接报错退出，而不会静默换端口。需要换端口时显式指定：`npm run dev -- --port 5181`。
> 请使用 `localhost` 而非 `127.0.0.1`：Vite 在某些环境下只监听 IPv6 的 `::1`，此时 `127.0.0.1` 会连不上而 `localhost` 正常。

### 生产构建与本地预览

```bash
npm run build     # 打包到 dist/，并生成深链接路由外壳
npm run preview   # 以生产产物启动本地服务（同样在 5180）
```

`npm run build` 是**发布前必须执行的一步**：它会先由 Vite 产出 `dist/`，再由后置脚本补写路由外壳。跳过它直接部署源码目录是不行的。

---

## 5. 可用脚本

| 命令 | 实际执行 | 作用 |
| --- | --- | --- |
| `npm run dev` | `vite --port 5180 --strictPort` | 开发服务器，带 HMR |
| `npm run build` | `vite build && node scripts/prerender-shells.mjs` | 生产构建 + 深链接外壳 |
| `npm run preview` | `vite preview --port 5180 --strictPort` | 本地预览生产产物 |

`scripts/` 下另有三个脚本，不属于应用运行链路：

| 脚本 | 作用 |
| --- | --- |
| `scripts/prerender-shells.mjs` | 构建后置步骤，见 [§6.2](#62-为什么构建产物里有-14-个-indexhtml) |
| `scripts/md-to-sheet.py` | 把 `DELIVERY.md` 渲染为排版样张 HTML |
| `scripts/docx-polish.py` | 校正由样张转换出的 `.docx` 的页面尺寸与中文字体 |

后两个脚本仅供重新生成交付文档使用，需要 Python 3 与 `markdown`、`python-docx`、`pymupdf`（仅在重跑文档流水线时安装）。

---

## 6. 构建产物与部署

### 6.1 dist 结构

```
dist/
├── index.html            # 应用外壳
├── assets/index-*.js     # 打包后的 JS
├── assets/index-*.css    # 打包后的 CSS
├── img/                  # 14 张商品与场景图（来自 public/img）
├── favicon.svg
├── shop/index.html
└── product/<slug>/index.html   # 12 个商品页外壳
```

整体约 **2.9 MB**，其中图片 2.1 MB、JS 318 KB、CSS 42 KB。单文件产物的实际传输体积：

| 文件 | 原始 | gzip |
| --- | --- | --- |
| `assets/index-*.js` | 325 KB | **101 KB** |
| `assets/index-*.css` | 43 KB | 9.4 KB |
| `index.html` | 1.4 KB | 0.65 KB |

### 6.2 为什么构建产物里有 14 个 index.html

当前使用的静态托管对未知路径返回自己的 404 页面，**没有 SPA rewrite 规则**。这意味着在 `/shop` 上按刷新、或把 `/product/terra-mug` 直接发给别人，会看到 404 而不是应用。

`scripts/prerender-shells.mjs` 在 `vite build` 之后把应用外壳复制到每条路由的真实路径（`shop` + 12 个商品 slug），任何普通文件服务器都能直接命中，从而保留干净 URL 且不引入运行时依赖。slug 由 `src/data/products.js` 正则抽取，**新增商品后无需手动维护这份清单**，重新构建即可。

### 6.3 部署

产物是纯静态文件，任何静态托管都可直接使用：

| 平台 | 要点 |
| --- | --- |
| WorkBuddy Sites（主） | 发布目录指向 `dist`，入口 `index.html`；无 rewrite，依赖路由外壳 |
| Vercel（镜像，已上线） | 已连接 GitHub 仓库，push 到 `main` 即自动构建；`vercel.json` 提供 SPA 回退与缓存头 |
| Netlify | Build command `npm run build`，output `dist`；建议同样配置 SPA 回退 |
| Nginx / Apache | 根目录指向 `dist`；或配置 `try_files $uri $uri/ /index.html` 后无需外壳 |
| GitHub Pages | 需在 `vite.config.js` 增加 `base: '/<repo>/'`，否则资源路径 404 |

> 若部署在**子路径**（如 `example.com/store/`），必须设置 `base`，否则 `/assets/...` 与 `/img/...` 都会失效。

### 6.4 Vercel 部署（当前生产环境）

项目 `ostra-store`（team `sumuzhi's projects`，Hobby）已绑定 GitHub 仓库 `sumuzhi/ostra-store`，两种发布方式：

| 方式 | 操作 |
| --- | --- |
| 自动（推荐） | 推送到 `main` 分支，Vercel 自动构建并发布生产版本 |
| 手动 | `npx vercel --prod`（或已全局安装的 `vercel --prod`）；首次需 `vercel login` 与 `vercel link` |

`vercel.json` 只做三件事，与本地构建互不冲突：

| 配置 | 作用 |
| --- | --- |
| `installCommand: npm ci` / `buildCommand: npm run build` / `outputDirectory: dist` | 显式声明构建方式，避免依赖平台自动探测 |
| `rewrites` | 除 `assets/`、`img/` 外的路径回退到 `/index.html`：未知路径交给前端 404 页，静态文件仍优先命中，不影响路由外壳 |
| `headers` | `assets/*` 强缓存一年（`immutable`），`img/*` 一周；HTML 保持 `must-revalidate`，发版即生效 |

两个容易踩的坑：

- **Deployment Protection 默认开启**，`.vercel.app` 域名会要求登录 Vercel，客户打不开。已通过 `vercel project protection disable ostra-store --sso` 关闭；新建项目时记得检查。
- **域名别名**：`https://ostra-store.vercel.app` 指向最新生产部署，可直接分发；每次部署还会生成一个带 hash 的预览地址，不要拿去给客户。

---

## 7. 质量与已知限制

- **质量门**：`npm run build` 通过即视为可发布（当前 61 个模块、无警告阻塞）。
- **无自动化测试**：项目未引入测试框架。验收依赖逐断点截图走查与脚本化的端到端操作回放，记录见 `DELIVERY.md`。
- **无 lint / format 配置**：代码风格靠约定统一，提交前无强制校验。
- **结算为前端模拟**：不发起任何网络请求，不校验真实支付，刷新后订单状态不保留（购物袋本身会持久化）。
- **商品数据为静态文件**：改价、上下架需修改 `src/data/products.js` 并重新构建。
- **图片为本地静态资源**：`public/img/*.jpg`，无 CDN、无响应式 `srcset`，弱网首屏偏重。

---

## 8. 目录结构

```
.
├── index.html                    # Vite 入口 HTML（meta / OG / Google Fonts）
├── vite.config.js                # 端口 5180、strictPort、React 插件
├── package.json
├── DELIVERY.md                   # 交付文档
├── public/
│   ├── favicon.svg
│   └── img/                      # 14 张商品与场景图
├── scripts/
│   ├── prerender-shells.mjs      # 深链接路由外壳
│   ├── md-to-sheet.py            # 交付文档 → 排版样张
│   └── docx-polish.py            # 样张 → docx 后处理
└── src/
    ├── main.jsx                  # 挂载 React、注入 StoreProvider / BrowserRouter
    ├── App.jsx                   # 路由表、滚动复位、全局浮层
    ├── data/products.js          # 商品目录、分类、排序项、运费常量
    ├── lib/format.js             # 金额格式化、折扣判断、到货日期
    ├── store/StoreContext.jsx    # reducer + 持久化 + 派生金额
    ├── components/               # Header / Footer / ProductCard / CartDrawer /
    │                             # SearchOverlay / Toaster / Rating / QtyStepper /
    │                             # Reveal / Icons
    ├── pages/                    # Home / Shop / Product / NotFound
    └── styles/
        ├── base.css              # 设计令牌（颜色/字体/间距）、reset、排版
        ├── layout.css            # 头部、hero、页脚、抽屉、浮层
        ├── shop.css              # 商品卡、筛选栏、详情页
        └── responsive.css        # 1100 / 860 / 640 / 380 四档断点
```

规模：JSX + JS 约 **2,725 行**，CSS 约 **3,514 行**，商品数据 330 行。

---

## 9. 路由

| 路径 | 页面 | 说明 |
| --- | --- | --- |
| `/` | Home | Hero + 分类入口 + 编辑精选 + 品牌故事 |
| `/shop` | Shop | 全量商品网格，筛选与排序全部由查询参数驱动 |
| `/product/:slug` | Product | 图库、色卡、数量、加购、收藏、规格折叠、评价、搭配推荐 |
| `*` | NotFound | 404 页，提供返回入口 |

`/shop` 支持的查询参数（可直接拼链接、也可由界面点击写入）：

| 参数 | 取值 | 含义 |
| --- | --- | --- |
| `cat` | 分类 id，逗号分隔多个：`kitchen,textiles` | 分类筛选，如 `/shop?cat=kitchen` |
| `q` | 关键词 | 搜索词，来自搜索浮层跳转 |
| `tag` | `new` / `bestseller` | 标签筛选，对应头部「New in」「Bestsellers」 |
| `saved` | `1` | 只看收藏 |
| `price` | `u50` / `50-100` / `o100` | 价格区间 |
| `stock` | `1` | 只看有货 |
| `sort` | `featured` / `price-asc` / `price-desc` / `rating` | 排序方式 |

购物袋、搜索、结算均为**浮层而非独立路由**：不打断浏览上下文，关闭后回到原位。

---

## 10. 实现约定（改代码前值得先看）

| 主题 | 约定 |
| --- | --- |
| 金额 | 一律以**整数分**存储与计算（`2800` = `$28.00`），展示时经 `lib/format.js` 的 `money()` 转换，避免浮点误差 |
| 运费 | 满 `$120` 免运费（`FREE_SHIPPING_THRESHOLD = 12000`），未满收 `$8`（`SHIPPING_FLAT = 800`） |
| 促销码 | `WELCOME10`（首单 9 折）、`FREESHIP`（免运费），定义在 `StoreContext.jsx` 的 `PROMOS` |
| 购物车行标识 | `lineKey = id \| color \| option`，同一商品不同变体是独立行 |
| 数量上限 | 单行最多 12 件，超过即封顶而非报错 |
| 持久化 | `localStorage` 键 `ostra.store.v1`；结构变更时**升级版本号**，旧数据会被安全丢弃而不是导致崩溃 |
| 派生金额 | `subtotal / discount / shipping / total` 在 Provider 内统一计算，组件只读不重算 |
| 图片 | 固定比例容器 + `object-fit: cover`；不要给 `<img>` 写死 `height` 属性，会覆盖 CSS 宽高比导致图片撑爆布局 |
| 动画 | 只做进场与浮层过渡，不使用统一「淡入 + 上滑」；`prefers-reduced-motion` 下全部关闭 |

---

## 11. 常见问题

**端口 5180 被占用**
`strictPort` 会直接报错。换端口：`npm run dev -- --port 5181`；或先释放 5180。

**本地打不开，但服务已启动**
用 `http://localhost:5180`。若只监听 IPv6，`127.0.0.1` 会连接失败。

**终端里 `npm run dev` 正常，浏览器请求被代理拦截**
`HTTP_PROXY` 会把 `localhost` 也送去代理。临时绕过：`NO_PROXY=localhost,127.0.0.1 npm run dev`。

**部署后 `/shop` 是 404**
没有执行 `npm run build`，或部署时漏掉了 `dist/shop/index.html`、`dist/product/*/index.html`。重新构建后整目录发布；若托管支持 rewrite，也可改用服务器规则。

**部署后页面白屏、控制台报资源 404**
把站点放在了子路径但没设 `vite.config.js` 的 `base`。

**改了价格但页面没变**
商品数据编译进 JS 产物，改完必须重新 `npm run build`。

**清了缓存购物袋还在**
这是预期行为，数据在 `localStorage` 的 `ostra.store.v1` 下。要重置：控制台执行 `localStorage.removeItem('ostra.store.v1')` 后刷新。

---

## 12. 许可与数据说明

商品、品牌名、评价、产地与价格均为演示用虚构数据，不指向任何真实品牌或交易。图片为演示素材，随仓库一并分发。

仓库当前**未附带开源许可证**（默认保留所有权利）。用于对外演示或作品集展示没有问题；若要开源发布或商用，请先补一份 `LICENSE`，并替换 `src/data/products.js` 与 `public/img/` 下的全部素材、接入真实商品与订单接口。
