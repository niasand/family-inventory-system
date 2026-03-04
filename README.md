# 家庭物品管理系统

一个现代化的家庭物品管理系统，使用 Vue.js + Node.js 构建，提供完整的物品管理功能和数据备份/恢复功能。

## 🌟 功能特色

### 📋 物品管理
- **完整的物品属性**：名称、图片、描述、添加时间、购买时间、价格、分类、标签
- **列表展示**：支持搜索、筛选、分页
- **详情查看**：直观的物品详情页面
- **增删改查**：完整的 CRUD 操作
- **标签分类**：灵活的分类和标签系统

### 💾 数据管理
- **数据导出**：一键导出完整的 JSON 格式数据
- **数据导入**：支持数据导入，可选择是否覆盖现有数据
- **实时备份**：系统自动保存所有操作
- **数据统计**：物品数量、分类、标签统计

### 🎨 用户界面
- **响应式设计**：适配桌面和移动设备
- **现代化 UI**：基于 Element Plus 构建的友好界面
- **直观操作**：简单易用的操作流程
- **实时反馈**：完整的用户操作反馈

## 🚀 快速开始

### 环境要求
- Node.js 18+
- npm 或 yarn

### 安装依赖

```bash
# 安装后端依赖
cd backend
npm install

# 安装前端依赖
cd ../frontend
npm install
```

### 启动应用

#### 方式一：同时启动前后端
```bash
# 在项目根目录
npm run dev:all
```

#### 方式二：分别启动
```bash
# 启动后端 (端口 3000)
cd backend
npm run dev

# 启动前端 (端口 5173)
cd frontend
npm run dev
```

### 访问应用
- **前端界面**：http://localhost:5173
- **后端 API**：http://localhost:3000
- **API 健康检查**：http://localhost:3000/api/health

## 📁 项目结构

```
family-inventory/
├── backend/                 # Node.js 后端
│   ├── src/
│   │   ├── app.js          # 应用入口
│   │   ├── config/         # 配置文件
│   │   ├── controllers/    # 控制器
│   │   ├── models/         # 数据模型
│   │   ├── routes/         # 路由
│   │   ├── middleware/     # 中间件
│   │   ├── services/       # 业务逻辑
│   │   └── utils/          # 工具函数
│   ├── data/               # SQLite 数据文件
│   └── uploads/            # 图片上传目录
├── frontend/               # Vue.js 前端
│   ├── src/
│   │   ├── components/     # Vue 组件
│   │   ├── views/          # 页面视图
│   │   ├── store/          # Pinia 状态管理
│   │   ├── api/            # API 接口
│   │   ├── router/         # 路由配置
│   │   └── assets/         # 静态资源
│   └── public/             # 静态文件
├── docs/                   # 文档
└── README.md               # 项目说明
```

## 📖 使用指南

### 基本操作

1. **查看物品列表**
   - 访问首页查看所有物品
   - 使用搜索框搜索物品
   - 通过分类和标签筛选

2. **添加物品**
   - 点击"新增物品"按钮
   - 填写物品信息
   - 支持添加图片链接
   - 设置分类和标签

3. **编辑物品**
   - 点击物品卡片查看详情
   - 点击"编辑"按钮修改信息
   - 支持修改所有属性

4. **删除物品**
   - 在详情页面点击"删除"
   - 确认删除操作

5. **数据管理**
   - 访问"数据管理"页面
   - 导出数据用于备份
   - 导入数据进行恢复

### API 接口

#### 物品管理
- `GET /api/items` - 获取物品列表
- `GET /api/items/:id` - 获取物品详情
- `POST /api/items` - 创建物品
- `PUT /api/items/:id` - 更新物品
- `DELETE /api/items/:id` - 删除物品
- `GET /api/items/categories` - 获取分类列表
- `GET /api/items/tags` - 获取标签列表

#### 数据管理
- `GET /api/backup/export` - 导出数据
- `POST /api/backup/import` - 导入数据
- `GET /api/backup/info` - 获取备份信息

## 🔧 技术栈

### 后端
- **Node.js 18+** - 运行时环境
- **Express 4.x** - Web 框架
- **SQLite 3** - 数据库
- **Multer** - 文件上传
- **Joi** - 数据验证
- **uuid** - ID 生成
- **CORS** - 跨域支持
- **Helmet** - 安全中间件
- **Express-rate-limit** - 限流中间件

### 前端
- **Vue 3** - 前端框架
- **Vite** - 构建工具
- **Element Plus** - UI 组件库
- **Vue Router** - 路由管理
- **Pinia** - 状态管理
- **Axios** - HTTP 客户端
- **ESLint** - 代码检查

## 📊 数据模型

### 物品表结构
```json
{
  "id": "string",
  "name": "string",
  "image": "string",
  "description": "string",
  "added_at": "timestamp",
  "purchased_at": "timestamp",
  "purchase_price": "number",
  "category": "string",
  "tags": "array",
  "created_at": "timestamp",
  "updated_at": "timestamp"
}
```

## 🛡️ 安全特性

- 输入验证和清理
- SQL 注入防护
- XSS 防护
- 请求限流
- CORS 跨域控制
- 文件类型验证

## 🔧 开发工具

### 代码格式化
```bash
# 使用 ESLint 检查代码
npm run lint
```

### 构建生产版本
```bash
# 构建前端
cd frontend
npm run build

# 启动生产环境
cd ../backend
npm start
```

## 🚀 部署指南

### 开发环境
```bash
# 同时启动前后端
npm run dev:all
```

### 生产环境
```bash
# 1. 构建前端
cd frontend
npm run build

# 2. 启动后端
cd ../backend
npm start

# 3. 配置 Nginx（可选）
# 使用 Nginx 反向代理，将前端静态文件和 API 代理到正确的端口
```

### Docker 部署（可选）
```bash
# 构建镜像
docker build -t family-inventory .

# 运行容器
docker run -p 3000:3000 -p 5173:5173 family-inventory
```

## 📝 更新日志

### v1.0.0 (2026-03-04)
- ✅ 完整的物品管理系统
- ✅ 支持增删改查操作
- ✅ 数据导出导入功能
- ✅ 响应式 Web 界面
- ✅ 分类和标签系统
- ✅ 搜索和筛选功能
- ✅ 完整的项目文档

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支
3. 提交更改
4. 推送到分支
5. 创建 Pull Request

## 📄 许可证

MIT License

## 📞 支持

如有问题或建议，请创建 Issue 或联系开发者。