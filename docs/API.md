# API 文档

家庭物品管理系统 RESTful API 文档

## 基本信息

- **基础 URL**: `http://localhost:3000/api`
- **数据格式**: JSON
- **认证方式**: 无（家庭内部使用）

## 错误响应格式

所有错误响应遵循以下格式：

```json
{
  "success": false,
  "error": "错误类型",
  "details": "详细错误信息"
}
```

## 物品管理接口

### 1. 获取物品列表

**请求**
```
GET /items
```

**查询参数**
| 参数 | 类型 | 必填 | 描述 |
|------|------|------|------|
| search | string | 否 | 搜索关键词（搜索名称、描述、分类） |
| category | string | 否 | 按分类筛选 |
| tags | string | 否 | 按标签筛选 |
| limit | number | 否 | 每页数量，默认 50 |
| page | number | 否 | 页码，默认 1 |

**响应示例**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "物品名称",
      "image": "图片URL",
      "description": "描述信息",
      "added_at": 1678900000,
      "purchased_at": 1678800000,
      "purchase_price": 99.99,
      "category": "电子设备",
      "tags": ["标签1", "标签2"],
      "created_at": 1678900000,
      "updated_at": 1678900000
    }
  ],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 50,
    "totalPages": 2
  }
}
```

### 2. 获取物品详情

**请求**
```
GET /items/:id
```

**响应示例**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "物品名称",
    "image": "图片URL",
    "description": "描述信息",
    "added_at": 1678900000,
    "purchased_at": 1678800000,
    "purchase_price": 99.99,
    "category": "电子设备",
    "tags": ["标签1", "标签2"],
    "created_at": 1678900000,
    "updated_at": 1678900000
  }
}
```

### 3. 创建物品

**请求**
```
POST /items
Content-Type: application/json
```

**请求体**
```json
{
  "name": "物品名称",
  "image": "图片URL",
  "description": "描述信息",
  "added_at": 1678900000,
  "purchased_at": 1678800000,
  "purchase_price": 99.99,
  "category": "电子设备",
  "tags": ["标签1", "标签2"]
}
```

**必填字段**
- `name`: 物品名称（1-200 字符）

**响应示例**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "物品名称",
    // ... 其他字段
  },
  "message": "物品创建成功"
}
```

### 4. 更新物品

**请求**
```
PUT /items/:id
Content-Type: application/json
```

**请求体**
```json
{
  "name": "新的物品名称",
  "description": "新的描述信息",
  // ... 其他需要更新的字段
}
```

**响应示例**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "新的物品名称",
    // ... 其他字段
  },
  "message": "物品更新成功"
}
```

### 5. 删除物品

**请求**
```
DELETE /items/:id
```

**响应示例**
```json
{
  "success": true,
  "message": "物品删除成功"
}
```

### 6. 获取分类列表

**请求**
```
GET /items/categories
```

**响应示例**
```json
{
  "success": true,
  "data": ["电子设备", "家具", "衣物", "其他"]
}
```

### 7. 获取标签列表

**请求**
```
GET /items/tags
```

**响应示例**
```json
{
  "success": true,
  "data": ["家用", "办公", "娱乐", "收藏"]
}
```

## 数据管理接口

### 8. 导出数据

**请求**
```
GET /backup/export
```

**响应**
- Content-Type: `application/json`
- Content-Disposition: `attachment; filename=family-inventory-backup-{timestamp}.json`

**数据格式**
```json
{
  "version": "1.0.0",
  "exported_at": "2026-03-04T08:00:00.000Z",
  "items": [
    {
      "id": "uuid",
      "name": "物品名称",
      // ... 其他字段
    }
  ]
}
```

### 9. 导入数据

**请求**
```
POST /backup/import
Content-Type: application/json
```

**请求体**
```json
{
  "data": {
    "version": "1.0.0",
    "exported_at": "2026-03-04T08:00:00.000Z",
    "items": [
      {
        "id": "uuid",
        "name": "物品名称",
        // ... 其他字段
      }
    ]
  },
  "overwrite": false
}
```

**参数说明**
- `data`: 要导入的数据对象
- `overwrite`: 是否覆盖现有数据，默认 false

**响应示例**
```json
{
  "success": true,
  "data": {
    "imported": 10,
    "skipped": 5,
    "total": 15
  },
  "message": "成功导入 10 个物品，跳过 5 个已存在的物品"
}
```

### 10. 获取备份信息

**请求**
```
GET /backup/info
```

**响应示例**
```json
{
  "success": true,
  "data": {
    "total_items": 100,
    "last_update": 1678900000,
    "database_path": "/path/to/inventory.db",
    "database_size": 102400
  }
}
```

## 健康检查接口

### 11. API 健康检查

**请求**
```
GET /health
```

**响应示例**
```json
{
  "status": "ok",
  "message": "家庭物品管理系统 API 正常运行"
}
```

## 数据类型说明

### 时间戳
所有时间字段使用 Unix 时间戳（毫秒），例如：`1678900000` 表示 2023-03-15 08:00:00

### 价格
价格使用浮点数，单位：元，例如：`99.99`

### 标签
标签使用字符串数组，最多 10 个标签，每个标签最多 50 个字符

## 限流规则

- 每个 IP 15 分钟内最多 100 个请求
- 超过限流返回：`429 Too Many Requests`

## 错误码说明

| HTTP 状态码 | 说明 |
|------------|------|
| 200 | 请求成功 |
| 201 | 创建成功 |
| 400 | 请求参数错误 |
| 404 | 资源不存在 |
| 429 | 请求过于频繁 |
| 500 | 服务器内部错误 |

## 数据验证规则

### 物品创建/更新验证
- `name`: 必填，1-200 字符
- `image`: 可选，必须是有效的 URL
- `description`: 可选，最多 1000 字符
- `category`: 可选，最多 100 字符
- `tags`: 可选，最多 10 个标签，每个标签最多 50 字符
- `purchase_price`: 可选，必须 >= 0
- `added_at`: 可选，时间戳
- `purchased_at`: 可选，时间戳

## 使用示例

### cURL 示例

```bash
# 获取物品列表
curl http://localhost:3000/api/items

# 获取物品详情
curl http://localhost:3000/api/items/{uuid}

# 创建物品
curl -X POST http://localhost:3000/api/items \
  -H "Content-Type: application/json" \
  -d '{
    "name": "笔记本电脑",
    "category": "电子设备",
    "purchase_price": 5999.00
  }'

# 更新物品
curl -X PUT http://localhost:3000/api/items/{uuid} \
  -H "Content-Type: application/json" \
  -d '{
    "name": "新的名称"
  }'

# 删除物品
curl -X DELETE http://localhost:3000/api/items/{uuid}

# 导出数据
curl http://localhost:3000/api/backup/export -o backup.json

# 导入数据
curl -X POST http://localhost:3000/api/backup/import \
  -H "Content-Type: application/json" \
  -d @backup.json
```

### JavaScript 示例

```javascript
// 获取物品列表
fetch('http://localhost:3000/api/items')
  .then(res => res.json())
  .then(data => console.log(data));

// 创建物品
fetch('http://localhost:3000/api/items', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: '笔记本电脑',
    category: '电子设备',
    purchase_price: 5999.00
  })
})
.then(res => res.json())
.then(data => console.log(data));
```

## 注意事项

1. 所有时间戳均为毫秒级
2. 价格字段使用浮点数，注意精度
3. 图片必须是有效的 URL，暂不支持直接上传
4. 数据导入时，相同的 ID 会被跳过（除非 overwrite=true）
5. API 限流：15 分钟内最多 100 次请求
