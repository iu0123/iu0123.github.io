# 个人简历网站部署指南

这个网站是**纯静态站点**：只有 `index.html`、CSS、JS 和图片，没有后端、数据库、构建步骤，也没有运行时环境变量。因此部署的核心只有一件事：**让公网能通过 HTTPS 访问这个文件夹**。

---

## 0. 先选方案

| 方案 | 成本 | 稳定性 | 难度 | HTTPS | 适合 |
|---|---|---|---|---|---|
| localhost.run / Cloudflare Quick Tunnel | 免费 | 临时，进程关了就失效 | 最低 | 有 | 马上发给面试官看 |
| GitHub Pages | 免费 | 稳定 | 低 | 有 | **最推荐**，长期个人主页 |
| Netlify Drop | 免费 | 稳定 | 最低 | 有 | 不想碰 Git，拖拽上线 |
| Cloudflare Pages | 免费 | 稳定 | 低 | 有 | 已有 Cloudflare 账号 |
| 云服务器 + Nginx | 服务器费用 | 稳定 | 中 | 需 Certbot | 想完全自己控制 |
| Cloudflare Tunnel（持久） | 免费 | 稳定 | 中 | 有 | 没有公网 IP / 不想开端口 |

**推荐路线：**

1. 现在先用 **localhost.run 临时 URL** 给面试官看。
2. 同时把代码推到 **GitHub Pages**，作为长期地址。
3. 以后有域名，再加自定义域名和 HTTPS。

---

## 1. 当前临时公网地址

当前会话里已经通过 localhost.run 建了一条 SSH 反向隧道，启动后会输出类似下面的地址（每次重启会变）：

```text
https://<随机子域名>.lhr.life
```

它的原理：

```text
公网用户 → https://<随机子域名>.lhr.life
        → localhost.run 服务器
        → SSH 反向隧道
        → 你的电脑 127.0.0.1:8080
        → portfolio-site 静态文件
```

本机启动命令：

```powershell
cd portfolio-site
python -m http.server 8080 --bind 127.0.0.1

# 另开一个终端
ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=NUL -R 80:127.0.0.1:8080 nokey@localhost.run
```

注意：

- URL 是随机子域名，**每次重连都可能变**。
- 如果旧 URL 显示 `no tunnel`，通常不是网站挂了，而是隧道断开后 localhost.run 分配了新子域名；以最新 SSH 输出为准。
- 电脑关机、休眠、断网或 SSH 进程结束，网站就不可访问。
- 只适合临时演示，不要把它当正式地址。
- 不需要开路由器端口，也不需要公网 IP；只需要能出站访问 SSH 22。
- 公开版已经移除手机号和 PDF 简历，只保留邮箱。

---

## 2. GitHub Pages（最推荐，永久免费）

适合：想要一个长期稳定、免费 HTTPS、可写进简历的地址。

最终地址：

```text
https://<你的GitHub用户名>.github.io/<仓库名>/
```

如果仓库名是 `<用户名>.github.io`，地址就是 `https://<用户名>.github.io/`。

### 2.1 安装 Git

Windows PowerShell：

```powershell
winget install --id Git.Git -e --source winget
git --version
```

如果没有 winget，去 https://git-scm.com/download/win 下载安装。

### 2.2 建仓库

1. 登录 GitHub。
2. New repository。
3. 仓库名建议 `portfolio`（公开）。
4. 不要勾选 README / .gitignore / license，保持空仓库。

### 2.3 本地初始化并推送

```powershell
cd portfolio-site
git init
git add .
git commit -m "Deploy portfolio site"
git branch -M main
git remote add origin https://github.com/<你的用户名>/portfolio.git
git push -u origin main
```

如果推送时要求登录，使用 GitHub 的 Personal Access Token 作为密码，或安装 GitHub CLI 后 `gh auth login`。

### 2.4 开启 Pages

**方式 A：Branch 部署（最简单）**

1. 仓库 → Settings → Pages。
2. Build and deployment → Source 选 `Deploy from a branch`。
3. Branch 选 `main`，目录选 `/ (root)`。
4. Save。
5. 等 1–2 分钟，访问 `https://<用户名>.github.io/portfolio/`。

**方式 B：GitHub Actions（仓库里已带 workflow）**

仓库里已经包含 `.github/workflows/pages.yml`。如果使用它：

1. Settings → Pages → Source 选 `GitHub Actions`。
2. 推送到 `main` 后，Actions 会自动部署。
3. 在 Actions 里看 `Deploy static site to Pages` 是否成功。

### 2.5 自定义域名（可选）

1. 在仓库根目录新建 `CNAME`，内容是一行域名，例如：

```text
portfolio.example.com
```

2. 在域名 DNS 里加 CNAME：

```text
portfolio.example.com  →  <你的用户名>.github.io
```

3. GitHub Pages → Custom domain 填入域名，Save。
4. 等 DNS 生效，勾选 **Enforce HTTPS**。

### 2.6 端口 / 防火墙 / 环境变量

- 不需要开任何端口。
- 不需要配置防火墙。
- 不需要环境变量。
- GitHub 负责 HTTPS 证书。
- 唯一注意：`index.html` 里的资源必须用相对路径（本站已经是 `assets/...`），这样在 `/portfolio/` 子路径下也能正常加载。

---

## 3. Netlify Drop（最快，不用 Git）

适合：不想装 Git，只想把文件夹拖上去。

1. 打开 https://app.netlify.com/drop
2. 把整个 `portfolio-site` 文件夹拖进去。
3. 等 10–30 秒，会得到一个 `https://随机名字.netlify.app` 地址。
4. 注册/登录 Netlify 认领这个站点，否则可能过期。
5. Site settings → Change site name，可以改成 `zhangying-portfolio.netlify.app`。
6. Domain management → Add custom domain（可选）。

仓库里已带 `netlify.toml`：

```toml
[build]
  publish = "."
  command = ""
```

- Build command：留空
- Publish directory：`.`
- 环境变量：不需要
- 端口/防火墙：不需要
- HTTPS：自动

---

## 4. Cloudflare Pages

适合：已有 Cloudflare 账号，想要全球 CDN。

### Git 集成

1. Cloudflare Dashboard → Workers & Pages → Create → Pages → Connect to Git。
2. 选择仓库。
3. Framework preset：`None`。
4. Build command：留空。
5. Build output directory：`/`（或 `.`）。
6. Save and Deploy。
7. 得到 `https://<project>.pages.dev`。

### 命令行

```powershell
npx wrangler pages deploy . --project-name=zhangying-portfolio
```

需要先 `npx wrangler login`。

- 环境变量：不需要
- 端口/防火墙：不需要
- HTTPS：自动

---

## 5. 云服务器 + Nginx（完全自控）

适合：你已经有云服务器，或想要自己的域名/服务器。

### 5.1 服务器要求

- Ubuntu 22.04 / 24.04（或其他 Linux）
- 1 核 1G 足够
- 安全组/防火墙放行 **80** 和 **443**
- SSH 22 只对自己的 IP 开放

### 5.2 上传文件

在本地 PowerShell：

```powershell
scp -r .\portfolio-site\* root@<服务器IP>:/var/www/portfolio/
```

或者用 rsync：

```bash
rsync -avz --delete ./portfolio-site/ root@<服务器IP>:/var/www/portfolio/
```

### 5.3 安装 Nginx

```bash
sudo apt update
sudo apt install -y nginx
sudo mkdir -p /var/www/portfolio
sudo chown -R www-data:www-data /var/www/portfolio
```

### 5.4 Nginx 配置

把仓库里的 `deploy/nginx/portfolio.conf` 复制到服务器：

```bash
sudo cp deploy/nginx/portfolio.conf /etc/nginx/sites-available/portfolio
sudo ln -sf /etc/nginx/sites-available/portfolio /etc/nginx/sites-enabled/portfolio
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx
```

配置内容：

```nginx
server {
    listen 80;
    server_name example.com www.example.com;

    root /var/www/portfolio;
    index index.html;
    charset utf-8;

    location / {
        try_files $uri $uri/ =404;
    }

    location ~* \.(css|js|png|svg|jpg|jpeg|webp|ico)$ {
        expires 7d;
        add_header Cache-Control "public, max-age=604800, immutable";
    }

    add_header X-Content-Type-Options nosniff always;
    add_header Referrer-Policy strict-origin-when-cross-origin always;
}
```

把 `example.com` 换成你的域名；没有域名可以先用 `server_name _;`。

### 5.5 防火墙

```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
sudo ufw status
```

云厂商安全组也要放行：

- 入站 80/tcp
- 入站 443/tcp
- 入站 22/tcp（只对你的 IP）

**不要**把 8080 暴露到公网；8080 只用于本机预览或反向代理后端。

### 5.6 DNS

在域名 DNS 添加 A 记录：

```text
example.com      →  <服务器公网IP>
www.example.com  →  <服务器公网IP>
```

### 5.7 HTTPS

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d example.com -d www.example.com
```

Certbot 会自动改 Nginx 配置并续期。

### 5.8 Docker 方式（可选）

仓库里有 `Dockerfile` 和 `docker-compose.yml`：

```bash
docker compose up -d --build
```

默认映射 `8080:80`，只在本机监听更安全：

```yaml
ports:
  - "127.0.0.1:8080:80"
```

然后让 Nginx 反代到 `127.0.0.1:8080`，或者直接把 compose 改成 `80:80`（确保 80 没被占用）。

环境变量：

```text
PORT=8080
```

只影响 Docker 映射到宿主机的端口，不影响页面内容。

---

## 6. Cloudflare Tunnel（持久，无公网 IP）

适合：不想开 80/443、服务器没有公网 IP、或想隐藏源站 IP。

### 6.1 安装 cloudflared

Windows：

```powershell
winget install --id Cloudflare.cloudflared -e
cloudflared --version
```

或从 Cloudflare 官网下载 `cloudflared-windows-amd64.exe`。

### 6.2 登录并创建隧道

```powershell
cloudflared tunnel login
cloudflared tunnel create portfolio
```

记下输出的 Tunnel UUID。

### 6.3 配置 DNS

```powershell
cloudflared tunnel route dns portfolio portfolio.example.com
```

这会在 Cloudflare DNS 里自动创建 CNAME。

### 6.4 配置文件

`%USERPROFILE%\.cloudflared\config.yml`：

```yaml
tunnel: <TUNNEL_UUID>
credentials-file: C:\Users\<你的用户名>\.cloudflared\<TUNNEL_UUID>.json

ingress:
  - hostname: portfolio.example.com
    service: http://127.0.0.1:8080
  - service: http_status:404
```

### 6.5 运行

```powershell
cloudflared tunnel run portfolio
```

浏览器打开 `https://portfolio.example.com`。

### 6.6 安装为 Windows 服务

```powershell
cloudflared service install
```

或者用 Token 方式（Cloudflare Dashboard 生成）：

```powershell
cloudflared service install <TUNNEL_TOKEN>
```

### 6.7 端口 / 防火墙 / 环境变量

- **不需要**入站 80/443。
- 只需要出站 443/tcp（QUIC 用 7844/udp，若被墙可加 `--protocol http2`）。
- Docker 方式：

```bash
docker run -d --name cloudflared --restart unless-stopped \
  -e TUNNEL_TOKEN=<TOKEN> \
  cloudflare/cloudflared:latest tunnel --no-autoupdate run
```

- 环境变量：`TUNNEL_TOKEN`（仅 Token 方式需要）。
- 如果站点跑在另一个容器里，`service` 要写容器名，例如 `http://portfolio:80`，不要写 `127.0.0.1`。

---

## 7. 端口、防火墙、环境变量总表

| 项目 | 端口 | 防火墙 | 环境变量 |
|---|---|---|---|
| GitHub Pages | 无 | 无 | 无 |
| Netlify | 无 | 无 | 无 |
| Cloudflare Pages | 无 | 无 | 无 |
| 云服务器 Nginx | 入站 80/443 | 安全组 + ufw 放行 80/443 | 无 |
| 云服务器 Docker | 宿主 8080→容器 80 | 只开 80/443，8080 不对外 | `PORT=8080` |
| Cloudflare Tunnel | 无入站 | 出站 443（可选 7844/udp） | `TUNNEL_TOKEN`（Token 方式） |
| localhost.run | 无入站 | 出站 SSH 22 | 无 |
| 本地预览 | 8080 | 不需要 | 无 |

**结论：** 这个静态站不需要任何运行时环境变量。唯一可能用到的是 Docker 的 `PORT` 和 Cloudflare Tunnel 的 `TUNNEL_TOKEN`，它们都属于部署层，不影响页面内容。

---

## 8. 安全与隐私

- 公开版只保留邮箱：`792854726@qq.com`。
- 手机号显示为“面试时提供”。
- `assets/resume.pdf` 已从公开目录移除，避免 PDF 里的手机号泄露。
- 不要把 `.env`、Token、服务器密码提交到 Git。
- 建议加 `.gitignore`：

```gitignore
.env
.env.*
!.env.example
node_modules/
.DS_Store
Thumbs.db
```

- 云服务器建议：
  - SSH 禁用密码登录，改用密钥；
  - 只对自己的 IP 开放 22；
  - 安装 fail2ban；
  - 定期 `apt upgrade`；
  - 不要把 8080 直接暴露公网。

---

## 9. 常见问题

### 页面打开是 404

- GitHub Pages 子路径部署时，资源必须用相对路径；本站已经是 `assets/...`。
- 确认 `index.html` 在仓库根目录，不是多套了一层文件夹。
- 如果是 Nginx，确认 `root` 指向包含 `index.html` 的目录。

### CSS/JS 加载失败

- 打开浏览器 DevTools → Network，看 `assets/styles.css` 是否 404。
- 检查大小写：Linux 服务器区分大小写。
- 检查是否把 `portfolio-site` 文件夹本身上传成了 `/var/www/portfolio/portfolio-site/`。

### GitHub Pages 显示 404 但 Actions 成功

- Settings → Pages → Source 是否选对。
- 仓库是否 Public（免费账号的 Pages 需要公开仓库）。
- 等 1–2 分钟，CDN 有延迟。

### 自定义域名开启 HTTPS 失败

- DNS 还没生效，等 10–30 分钟。
- CNAME 是否指向 `<用户名>.github.io`。
- GitHub Pages 的 Enforce HTTPS 需要证书签发完成。

### Cloudflare Tunnel 502

- `service` 地址不对：本机用 `http://127.0.0.1:8080`，Docker 内用容器名。
- 本地站点没启动：先确认 `http://127.0.0.1:8080` 能打开。
- Windows 服务方式默认用户目录不同，建议用 Token 方式。

### 手机打开排版错乱

- 确认 `<meta name="viewport" content="width=device-width, initial-scale=1.0">` 存在（本站已有）。
- 清缓存或换浏览器。

### localhost.run 显示 `no tunnel`

- 先确认本地站点正常：`http://127.0.0.1:8080/` 能打开。
- 再看启动隧道的终端，最新一行会输出新的 `https://xxxx.lhr.life`。
- 旧 URL 在隧道重连后通常会失效，直接换最新 URL。
- 想固定地址，不要依赖免费随机隧道；用 GitHub Pages、Netlify、Cloudflare Pages，或给 Cloudflare Tunnel 配自己的域名。

---

## 10. 上线检查清单

- [ ] 公开版没有手机号、没有带手机号的 PDF。
- [ ] `index.html`、`assets/` 路径正确。
- [ ] HTTPS 能打开，浏览器没有 mixed content 警告。
- [ ] 手机和电脑都能正常显示。
- [ ] 面试模式能开关。
- [ ] 架构图能点击放大。
- [ ] LCD 演示按钮能切换页面。
- [ ] 邮箱链接能打开邮件客户端。
- [ ] 404 页面/首页链接正常。
- [ ] 自定义域名（如有）已开 HTTPS。
- [ ] 服务器 SSH 只对自己的 IP 开放。
