# 张颖 · 个人简历网站

一个无构建依赖的静态作品集网站，面向嵌入式 Linux 岗位求职面试。使用原生 HTML / CSS / JavaScript，打开即可用。

## 文件结构

```text
portfolio-site/
├── index.html
├── assets/
│   ├── styles.css
│   ├── script.js
│   ├── favicon.svg
│   └── rv1126-architecture.png
├── deploy/
│   ├── nginx/
│   ├── cloudflared/
│   └── cloud-server-setup.sh
├── .github/workflows/pages.yml
├── Dockerfile
├── docker-compose.yml
├── netlify.toml
├── DEPLOY.md
└── README.md
```

## 本地打开

直接双击 `index.html` 即可。部分浏览器对 `file://` 下的复制/本地存储有限制，建议用本地服务器：

```powershell
cd portfolio-site
python -m http.server 8080
```

然后打开 `http://localhost:8080`。

如果想默认开启“面试模式”，直接打开：

```text
http://localhost:8080/?interview=1
```

## 面试时怎么用

1. 电脑打开网站，浏览器缩放到 90%–100%，全屏展示。
2. 点右上角 **“面试模式”**：每个项目下方会出现 30 秒讲法、可能追问和职责边界。
3. 先讲 `RV1126 RTK 接收机`：展示系统架构图，按“主控 → 总线 → 三条业务流 → 难点”讲。
4. 再讲 `GD32F303 LCD`：直接操作页面里的 LCD 菜单演示，讲 SPI、菜单状态机、按键和 IAP。
5. 面试官追问时，展开“项目详情”里的 11 个外设模块、三条数据流和职责边界。
6. 手机端也能正常打开；如果线上面试，提前测试屏幕共享和网络。

## 部署

完整部署指南（GitHub Pages / Netlify / Cloudflare Pages / 云服务器 Nginx / Cloudflare Tunnel / 端口防火墙 / 环境变量）：

**[DEPLOY.md](DEPLOY.md)**

### GitHub Pages

1. 新建仓库，把 `portfolio-site` 里的文件放到仓库根目录。
2. Settings → Pages → Source 选择 `Deploy from a branch`，分支 `main`，目录 `/ (root)`。
3. 等待生成 `https://<username>.github.io/<repo>/`。

### Netlify / Vercel

把 `portfolio-site` 文件夹直接拖到 Netlify Drop，或导入 Vercel，Framework 选 “Other / Static”，Build command 留空，Output directory 填 `.`。

## 公开部署前的隐私提醒

公开版只保留邮箱，手机号显示为“面试时提供”，PDF 简历也不放进公开目录。这样招聘方仍能通过邮箱联系，又不会把完整手机号和带手机号的 PDF 暴露在公网。

- 公开联系方式：`792854726@qq.com`
- 手机号：面试时再给
- 完整 PDF 简历：保留在本地，需要时通过邮件发送

如果你以后想改回手机号，修改 `index.html` 里的 `Phone` 行即可；但公开部署前请先想清楚隐私风险。

## 内容更新建议

- 项目成果里的“11 个外设模块”“2 个项目”等数字，按实际情况调整。
- 如果拿到真实项目截图/产品图，替换 `assets/rv1126-architecture.png`，或把 LCD 演示换成真实面板照片。
- 如果面试岗位偏驱动，可把“技能清单”里的 Linux 驱动/内核项提前；如果偏系统集成，保持现在的顺序。
- 新增项目时，复制一个 `.project-card` 结构，并更新导航和 `#projects` 区域。

## 设计说明

- 深蓝 + 青绿配色，偏工程感，不花哨。
- 主控/模块/总线用“系统卡”表达，避免普通简历站点的模板感。
- 面试模式把“讲解要点”藏在页面里，面试时一键展开，不用另外准备小抄。
- 所有内容均为静态资源，无外部 CDN 依赖，离线也能展示。
