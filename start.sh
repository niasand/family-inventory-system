#!/bin/bash

# 家庭物品管理系统启动脚本

set -e

echo "🚀 启动家庭物品管理系统..."

# 检查 Node.js
if ! command -v node &> /dev/null; then
    echo "❌ 请先安装 Node.js 18+"
    echo "💡 安装方法: curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash - && sudo apt-get install -y nodejs"
    exit 1
fi

# 检查 npm
if ! command -v npm &> /dev/null; then
    echo "❌ 请先安装 npm"
    exit 1
fi

# 安装根项目依赖
echo "📦 安装根项目依赖..."
npm install

# 安装后端依赖
echo "📦 安装后端依赖..."
cd backend
npm install

# 创建必要的目录
mkdir -p data uploads
chmod 755 data uploads

# 返回根目录
cd ..

# 安装前端依赖
echo "📦 安装前端依赖..."
cd frontend
npm install

# 返回根目录
cd ..

echo "✅ 依赖安装完成"
echo ""
echo "🎉 家庭物品管理系统已准备就绪！"
echo ""
echo "📋 启动方式："
echo "  • 方式一: npm run dev:all    # 同时启动前后端"
echo "  • 方式二: cd backend && npm run dev   # 仅启动后端 (端口 3000)"
echo "  • 方式三: cd frontend && npm run dev  # 仅启动前端 (端口 5173)"
echo ""
echo "🌐 访问地址："
echo "  • 前端界面: http://localhost:5173"
echo "  • 后端 API: http://localhost:3000"
echo "  • API 健康检查: http://localhost:3000/api/health"
echo ""
echo "📖 详细文档请查看 README.md"
echo ""

# 如果需要立即启动，取消下面的注释
# npm run dev:all