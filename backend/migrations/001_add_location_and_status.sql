-- 数据库迁移脚本：添加 location 和 status 字段，创建 locations 表

-- 1. 添加 location 字段到 items 表
ALTER TABLE items ADD COLUMN location TEXT;

-- 2. 添加 status 字段到 items 表，默认值为 'active'（在用）
ALTER TABLE items ADD COLUMN status TEXT DEFAULT 'active';

-- 3. 创建 locations 表管理存放位置
CREATE TABLE IF NOT EXISTS locations (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  parent_id TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  FOREIGN KEY (parent_id) REFERENCES locations(id) ON DELETE SET NULL
);

-- 4. 插入默认存放位置
INSERT OR IGNORE INTO locations (id, name, description, created_at, updated_at) VALUES
  ('loc_001', '客厅', '主要活动区域', strftime('%s', 'now') * 1000, strftime('%s', 'now') * 1000),
  ('loc_002', '卧室', '休息区域', strftime('%s', 'now') * 1000, strftime('%s', 'now') * 1000),
  ('loc_003', '厨房', '烹饪区域', strftime('%s', 'now') * 1000, strftime('%s', 'now') * 1000),
  ('loc_004', '书房', '工作学习区域', strftime('%s', 'now') * 1000, strftime('%s', 'now') * 1000),
  ('loc_005', '储藏室', '存储区域', strftime('%s', 'now') * 1000, strftime('%s', 'now') * 1000),
  ('loc_006', '车库', '车辆及工具存放', strftime('%s', 'now') * 1000, strftime('%s', 'now') * 1000);

-- 5. 创建索引优化查询
CREATE INDEX IF NOT EXISTS idx_items_status ON items(status);
CREATE INDEX IF NOT EXISTS idx_items_location ON items(location);
CREATE INDEX IF NOT EXISTS idx_items_category ON items(category);
