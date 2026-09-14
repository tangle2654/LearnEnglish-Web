# LinguaFlow 英语学习平台 — 部署指南

> 版本：1.0.0  
> 更新日期：2026-09-15

## 目录

1. [环境要求](#1-环境要求)
2. [本地开发部署](#2-本地开发部署)
3. [生产环境部署（Linux + Nginx + PM2）](#3-生产环境部署linux--nginx--pm2)
4. [Docker 部署](#4-docker-部署)
5. [数据库维护与备份](#5-数据库维护与备份)
6. [常见问题排查](#6-常见问题排查)

---

## 1. 环境要求

### 服务器配置

| 项目 | 最低要求 | 推荐配置 |
|------|----------|----------|
| CPU | 1 核 | 2 核 |
| 内存 | 1 GB | 2 GB |
| 磁盘 | 10 GB | 20 GB |
| 系统 | Ubuntu 20.04+ / CentOS 7+ / Debian 11+ | Ubuntu 22.04 LTS |

### 软件版本

| 软件 | 版本要求 |
|------|----------|
| Node.js | >= 18（推荐 20 LTS） |
| npm | >= 9 |
| Nginx | >= 1.18 |
| Python | >= 3.8（编译 better-sqlite3 原生模块需要） |
| make / g++ | 系统自带（编译原生模块需要） |

> `better-sqlite3` 是原生模块，安装时需要编译。若服务器缺少构建工具，请先安装 `build-essential` 和 `python3`。

---

## 2. 本地开发部署

### 2.1 获取代码

```bash
# 若使用 Git
git clone <your-repo-url> linguaflow
cd linguaflow

# 或直接将项目文件放入工作目录
```

### 2.2 安装后端依赖并初始化数据

```bash
cd server
npm install

# 初始化数据库并灌入种子数据
npm run seed
```

成功后会看到：
```
✅ Seed data created successfully!
  Courses: 6 levels
  Lessons: 54
  ...
  Demo user: demo / demo123
```

### 2.3 启动后端开发服务

```bash
npm run dev
```

后端将在 `http://localhost:3001` 启动，支持热重载。

验证接口：
```bash
curl http://localhost:3001/api/health
# {"status":"ok","message":"LinguaFlow API is running"}
```

### 2.4 安装前端依赖并启动

```bash
cd ../client
npm install
npm run dev
```

前端将在 `http://localhost:5173` 启动，Vite 会自动将 `/api` 请求代理到后端 `3001` 端口。

### 2.5 访问平台

浏览器打开 **http://localhost:5173**

- 演示账号：`demo` / `demo123`
- 或点击注册创建新账号

### 2.6 本地开发目录结构

```
linguaflow/
├── server/
│   ├── src/           # 后端源码
│   ├── linguaflow.db  # SQLite 数据库（首次 seed 后生成）
│   └── package.json
└── client/
    ├── src/           # 前端源码
    └── package.json
```

---

## 3. 生产环境部署（Linux + Nginx + PM2）

以下以 **Ubuntu 22.04 LTS** 为例，使用 Nginx 托管前端静态资源并反向代理后端 API，PM2 守护 Node.js 进程。

### 3.1 服务器环境准备

```bash
# 更新系统
sudo apt update && sudo apt upgrade -y

# 安装构建工具（better-sqlite3 编译需要）
sudo apt install -y build-essential python3

# 安装 Node.js 20 LTS（使用 NodeSource）
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# 验证
node -v   # v20.x.x
npm -v    # 10.x.x

# 安装 PM2（进程守护）
sudo npm install -g pm2

# 安装 Nginx
sudo apt install -y nginx
```

### 3.2 上传项目代码

```bash
# 在服务器上创建项目目录
sudo mkdir -p /var/www/linguaflow
sudo chown $USER:$USER /var/www/linguaflow

# 方式一：Git 克隆
cd /var/www/linguaflow
git clone <your-repo-url> .

# 方式二：本地上传（scp）
# 在本地执行：
# scp -r ./server ./client user@your-server:/var/www/linguaflow/
```

### 3.3 构建与初始化

```bash
cd /var/www/linguaflow

# 后端：安装依赖 + 编译 TypeScript + 初始化数据库
cd server
npm install
npm run build
npm run seed

# 前端：安装依赖 + 打包
cd ../client
npm install
npm run build
# 产物在 client/dist/ 目录
```

### 3.4 配置 PM2 启动后端

```bash
cd /var/www/linguaflow/server

# 设置环境变量并启动
PORT=3001 JWT_SECRET=$(openssl rand -hex 32) pm2 start dist/index.js --name linguaflow-server

# 设置开机自启
pm2 startup
pm2 save
```

验证后端：
```bash
curl http://localhost:3001/api/health
```

PM2 常用命令：
```bash
pm2 list                    # 查看进程
pm2 logs linguaflow-server  # 查看日志
pm2 restart linguaflow-server
pm2 stop linguaflow-server
```

### 3.5 配置 Nginx

创建 Nginx 配置文件：

```bash
sudo nano /etc/nginx/sites-available/linguaflow
```

写入以下内容（将 `your-domain.com` 替换为实际域名）：

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # 前端静态资源
    root /var/www/linguaflow/client/dist;
    index index.html;

    # 前端路由 history 模式支持
    location / {
        try_files $uri $uri/ /index.html;
    }

    # 后端 API 反向代理
    location /api/ {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # 静态资源缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff2?)$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
```

启用配置并重启 Nginx：

```bash
sudo ln -s /etc/nginx/sites-available/linguaflow /etc/nginx/sites-enabled/
sudo nginx -t          # 测试配置
sudo systemctl reload nginx
```

### 3.6 配置 HTTPS（推荐）

使用 Certbot 申请免费 SSL 证书：

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

Certbot 会自动修改 Nginx 配置，启用 HTTPS 并设置 HTTP 跳转。

### 3.7 防火墙配置

```bash
sudo ufw allow 'Nginx Full'
sudo ufw allow ssh
sudo ufw enable
```

### 3.8 验证部署

```bash
# 访问首页
curl -I http://your-domain.com

# 测试 API
curl http://your-domain.com/api/health
```

浏览器访问 `https://your-domain.com`，使用 `demo` / `demo123` 登录验证。

---

## 4. Docker 部署

### 4.1 后端 Dockerfile

在 `server/` 目录创建 `Dockerfile`：

```dockerfile
FROM node:20-alpine

WORKDIR /app

# 安装编译依赖（better-sqlite3 需要）
RUN apk add --no-cache python3 make g++

COPY package*.json ./
RUN npm install --production=false

COPY . .
RUN npm run build

ENV PORT=3001
ENV JWT_SECRET=change-me-in-production
EXPOSE 3001

CMD ["node", "dist/index.js"]
```

### 4.2 前端 Dockerfile

在 `client/` 目录创建 `Dockerfile`：

```dockerfile
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

前端 `nginx.conf`：

```nginx
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://linguaflow-server:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### 4.3 docker-compose.yml

在项目根目录创建 `docker-compose.yml`：

```yaml
version: '3.8'

services:
  server:
    build: ./server
    container_name: linguaflow-server
    restart: unless-stopped
    environment:
      - PORT=3001
      - JWT_SECRET=${JWT_SECRET}
    volumes:
      - db-data:/app/linguaflow.db
    ports:
      - "3001:3001"

  client:
    build: ./client
    container_name: linguaflow-client
    restart: unless-stopped
    ports:
      - "80:80"
    depends_on:
      - server

volumes:
  db-data:
```

### 4.4 启动

```bash
# 设置 JWT 密钥
echo "JWT_SECRET=$(openssl rand -hex 32)" > .env

# 初始化数据库（首次需要）
docker compose run --rm server npx tsx src/seed.ts

# 启动服务
docker compose up -d

# 查看日志
docker compose logs -f
```

---

## 5. 数据库维护与备份

### 5.1 数据库文件位置

- 本地 / PM2 部署：`server/linguaflow.db`
- Docker 部署：挂载在 `db-data` volume 中

SQLite 还会生成 `linguaflow.db-shm` 和 `linguaflow.db-wal`（WAL 模式临时文件），备份时只需备份 `.db` 文件即可（WAL 模式下建议先 checkpoint）。

### 5.2 备份脚本

创建 `backup.sh`：

```bash
#!/bin/bash
BACKUP_DIR="/var/backups/linguaflow"
DB_FILE="/var/www/linguaflow/server/linguaflow.db"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# 使用 SQLite 在线备份（安全，不锁库）
sqlite3 $DB_FILE ".backup $BACKUP_DIR/linguaflow_$DATE.db"

# 压缩
gzip $BACKUP_DIR/linguaflow_$DATE.db

# 保留最近 30 天的备份
find $BACKUP_DIR -name "linguaflow_*.db.gz" -mtime +30 -delete

echo "Backup completed: linguaflow_$DATE.db.gz"
```

加入定时任务：
```bash
crontab -e
# 每天凌晨 3 点备份
0 3 * * * /path/to/backup.sh >> /var/log/linguaflow-backup.log 2>&1
```

### 5.3 数据恢复

```bash
# 解压备份
gunzip linguaflow_20260915_030000.db.gz

# 停止服务
pm2 stop linguaflow-server

# 替换数据库文件
cp linguaflow_20260915_030000.db /var/www/linguaflow/server/linguaflow.db

# 重启服务
pm2 start linguaflow-server
```

### 5.4 重置演示数据

如需重新初始化所有数据（**会清空现有数据**）：

```bash
cd server
npm run seed
```

---

## 6. 常见问题排查

### 6.1 后端启动失败：`better-sqlite3` 编译错误

**现象：** `npm install` 时报错 `node-gyp` 编译失败。

**解决：**
```bash
# Ubuntu/Debian
sudo apt install -y build-essential python3

# CentOS/RHEL
sudo yum groupinstall -y "Development Tools"
sudo yum install -y python3
```

### 6.2 前端页面空白或 404（生产环境）

**现象：** 刷新子页面（如 `/courses`）出现 404。

**原因：** React Router 使用 history 模式，Nginx 未配置 fallback。

**解决：** 确认 Nginx 配置中包含：
```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

### 6.3 API 请求 401 未授权

**现象：** 已登录但接口返回 401。

**排查：**
1. 检查浏览器 `localStorage` 中是否存在 `token`
2. 检查请求头是否携带 `Authorization: Bearer <token>`
3. 确认 `JWT_SECRET` 环境变量未被修改（修改后旧 token 失效）

### 6.4 口语功能无法录音

**现象：** 点击"开始录音"无反应。

**原因：** 浏览器不支持 SpeechRecognition API，或未授权麦克风权限。

**解决：**
- 使用 **Chrome** 或 **Edge** 浏览器
- 检查浏览器是否允许网站使用麦克风
- 页面需通过 **HTTPS** 或 **localhost** 访问（浏览器安全策略）

### 6.5 前端无法连接后端（生产环境）

**现象：** 页面加载但 API 请求失败。

**排查：**
1. 确认后端服务运行：`pm2 list`
2. 确认 Nginx 代理配置正确：`location /api/` 指向后端
3. 检查防火墙：`sudo ufw status`
4. 查看 Nginx 错误日志：`sudo tail -f /var/log/nginx/error.log`

### 6.6 数据库文件权限问题

**现象：** 后端报 `SQLITE_CANTOPEN` 错误。

**解决：**
```bash
# 确保运行用户对数据库文件有读写权限
sudo chown www-data:www-data /var/www/linguaflow/server/linguaflow.db
sudo chmod 664 /var/www/linguaflow/server/linguaflow.db
```

### 6.7 端口被占用

**现象：** `EADDRINUSE: address already in use :::3001`

**解决：**
```bash
# 查找占用进程
sudo lsof -i :3001
# 或修改端口启动
PORT=3002 pm2 start dist/index.js --name linguaflow-server
```

---

## 附：快速部署 Checklist

- [ ] 服务器安装 Node.js 20+、Nginx、PM2、build-essential
- [ ] 上传 server 和 client 源码
- [ ] 后端 `npm install && npm run build && npm run seed`
- [ ] 前端 `npm install && npm run build`
- [ ] 设置 `JWT_SECRET` 环境变量（生产环境务必修改）
- [ ] PM2 启动后端并设置开机自启
- [ ] 配置 Nginx（静态资源 + API 反向代理 + history fallback）
- [ ] 配置 HTTPS（Certbot）
- [ ] 防火墙放行 80/443 端口
- [ ] 设置数据库定时备份
- [ ] 使用 demo/demo123 验证全流程
