# 部署指南

家庭物品管理系统部署文档

## 环境要求

- Node.js 18+
- npm 9+
- SQLite 3 (内置)
- 至少 100MB 可用磁盘空间

## 开发环境部署

### 1. 克隆或下载项目

```bash
cd /home/openclaw/.openclaw/workspace/family-inventory
```

### 2. 安装依赖

使用提供的启动脚本：

```bash
./start.sh
```

或手动安装：

```bash
# 安装根项目依赖
npm install

# 安装后端依赖
cd backend
npm install

# 安装前端依赖
cd ../frontend
npm install
```

### 3. 启动开发服务器

```bash
# 同时启动前后端
npm run dev:all

# 或分别启动
cd backend
npm run dev    # 后端: http://localhost:3000

# 新开终端
cd frontend
npm run dev    # 前端: http://localhost:5173
```

## 生产环境部署

### 方案一：使用 PM2（推荐）

#### 安装 PM2

```bash
npm install -g pm2
```

#### 配置 PM2

创建 `ecosystem.config.js`：

```javascript
module.exports = {
  apps: [
    {
      name: 'family-inventory-backend',
      script: './backend/src/app.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      }
    }
  ]
};
```

#### 启动应用

```bash
# 构建前端
cd frontend
npm run build
cd ..

# 复制前端构建文件到后端静态目录
mkdir -p backend/dist
cp -r frontend/dist/* backend/dist/

# 使用 PM2 启动后端
pm2 start ecosystem.config.js

# 设置开机自启
pm2 startup
pm2 save
```

### 方案二：使用 Docker

#### 创建 Dockerfile

项目根目录创建 `Dockerfile`：

```dockerfile
FROM node:18-alpine

# 设置工作目录
WORKDIR /app

# 复制项目文件
COPY . .

# 安装依赖
RUN npm install
RUN cd backend && npm install

# 构建前端
RUN cd frontend && npm install && npm run build

# 复制前端构建文件到后端
RUN mkdir -p backend/dist && \
    cp -r frontend/dist/* backend/dist/

# 创建数据目录
RUN mkdir -p backend/data backend/uploads

# 暴露端口
EXPOSE 3000

# 启动命令
CMD ["node", "backend/src/app.js"]
```

#### 创建 .dockerignore

```
node_modules
frontend/node_modules
backend/node_modules
.git
.gitignore
.env
*.md
docs
```

#### 构建和运行

```bash
# 构建镜像
docker build -t family-inventory:1.0.0 .

# 运行容器
docker run -d \
  --name family-inventory \
  -p 3000:3000 \
  -v /path/to/data:/app/backend/data \
  -v /path/to/uploads:/app/backend/uploads \
  family-inventory:1.0.0

# 查看日志
docker logs -f family-inventory

# 停止容器
docker stop family-inventory

# 启动已存在的容器
docker start family-inventory
```

### 方案三：传统部署

#### 1. 构建前端

```bash
cd frontend
npm run build
```

#### 2. 配置 Nginx

创建 Nginx 配置文件 `/etc/nginx/sites-available/family-inventory`：

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # 前端静态文件
    location / {
        root /path/to/family-inventory/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # API 反向代理
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # 上传文件大小限制
    client_max_body_size 10M;
}
```

启用配置：

```bash
sudo ln -s /etc/nginx/sites-available/family-inventory /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

#### 3. 使用 Systemd 管理后端

创建服务文件 `/etc/systemd/system/family-inventory.service`：

```ini
[Unit]
Description=Family Inventory Backend
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/path/to/family-inventory/backend
ExecStart=/usr/bin/node /path/to/family-inventory/backend/src/app.js
Restart=always
RestartSec=10
Environment=NODE_ENV=production
Environment=PORT=3000

[Install]
WantedBy=multi-user.target
```

启动服务：

```bash
sudo systemctl daemon-reload
sudo systemctl start family-inventory
sudo systemctl enable family-inventory
sudo systemctl status family-inventory
```

## 环境变量配置

### 后端环境变量

创建 `.env` 文件在 `backend` 目录：

```env
NODE_ENV=production
PORT=3000
```

### 前端环境变量

创建 `.env.production` 文件在 `frontend` 目录：

```env
VITE_API_BASE_URL=http://localhost:3000/api
```

## 数据库管理

### 备份数据

```bash
# 方法一：使用 API
curl http://localhost:3000/api/backup/export -o backup-$(date +%Y%m%d).json

# 方法二：直接备份 SQLite 文件
cp backend/data/inventory.db backup/inventory-$(date +%Y%m%d).db
```

### 恢复数据

```bash
# 使用 API 恢复
curl -X POST http://localhost:3000/api/backup/import \
  -H "Content-Type: application/json" \
  -d @backup.json

# 或使用 SQLite 文件恢复
cp backup/inventory-20240304.db backend/data/inventory.db
```

### 数据迁移

如需迁移到新的服务器：

1. 导出数据
2. 部署新服务器
3. 导入数据
4. 验证数据完整性

## 安全配置

### 1. 防火墙配置

```bash
# 只开放必要端口
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### 2. 启用 HTTPS

使用 Let's Encrypt：

```bash
sudo apt-get install certbot python3-certbot-nginx

# 生成证书
sudo certbot --nginx -d your-domain.com

# 自动续期
sudo certbot renew --dry-run
```

### 3. 限制访问

修改 Nginx 配置，添加访问限制：

```nginx
location /api {
    # 允许的 IP 地址（可选）
    allow 192.168.1.0/24;
    allow 127.0.0.1;
    deny all;

    # 或使用基本认证
    auth_basic "Restricted";
    auth_basic_user_file /etc/nginx/.htpasswd;

    proxy_pass http://localhost:3000;
    # ... 其他配置
}
```

创建密码文件：

```bash
sudo htpasswd -c /etc/nginx/.htpasswd username
```

## 监控和日志

### 查看日志

```bash
# PM2 日志
pm2 logs family-inventory-backend

# Docker 日志
docker logs -f family-inventory

# Systemd 日志
sudo journalctl -u family-inventory -f

# Nginx 日志
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### 监控资源使用

```bash
# CPU 和内存
htop

# 磁盘空间
df -h

# 进程监控
ps aux | grep node
```

## 性能优化

### 1. 启用 Gzip 压缩

Nginx 配置：

```nginx
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json application/javascript;
```

### 2. 静态资源缓存

Nginx 配置：

```nginx
location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
    expires 30d;
    add_header Cache-Control "public, immutable";
}
```

### 3. 数据库优化

- 定期清理旧数据
- 添加适当的索引（SQLite 自动处理）
- 使用事务批量操作

## 故障排除

### 问题：端口被占用

```bash
# 查找占用端口的进程
sudo lsof -i :3000

# 终止进程
sudo kill -9 <PID>
```

### 问题：权限错误

```bash
# 修复文件权限
sudo chown -R www-data:www-data /path/to/family-inventory
sudo chmod -R 755 /path/to/family-inventory
```

### 问题：数据库锁定

```bash
# 检查是否有进程锁定数据库
sudo lsof /path/to/inventory.db

# 重启服务
sudo systemctl restart family-inventory
```

## 更新应用

### 更新代码

```bash
# 拉取最新代码
git pull origin main

# 安装新依赖
npm install
cd backend && npm install
cd ../frontend && npm install

# 重新构建
npm run build

# 重启服务
pm2 restart family-inventory-backend
```

### 回滚

```bash
# 回滚到上一个版本
git checkout HEAD~1

# 重新构建和部署
npm install
cd backend && npm install
cd ../frontend && npm install && npm run build
pm2 restart family-inventory-backend
```

## 备份策略

建议的备份策略：

1. **每日备份**：使用 cron 每天自动备份数据
2. **每周归档**：保留每周的备份至少 4 周
3. **异地备份**：将备份复制到其他位置

自动备份脚本 `backup.sh`：

```bash
#!/bin/bash

BACKUP_DIR="/backups/family-inventory"
DATE=$(date +%Y%m%d)
mkdir -p $BACKUP_DIR

# API 备份
curl http://localhost:3000/api/backup/export -o $BACKUP_DIR/data-$DATE.json

# SQLite 备份
cp /path/to/family-inventory/backend/data/inventory.db $BACKUP_DIR/db-$DATE.db

# 删除 7 天前的备份
find $BACKUP_DIR -name "data-*.json" -mtime +7 -delete
find $BACKUP_DIR -name "db-*.db" -mtime +7 -delete
```

添加到 crontab：

```bash
# 每天凌晨 2 点备份
0 2 * * * /path/to/backup.sh
```

## 支持和维护

如有问题，请查看：
1. 应用日志
2. API 文档
3. 项目 GitHub Issues

## 联系方式

- 项目文档：`README.md`
- API 文档：`docs/API.md`
