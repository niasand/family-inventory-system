-- 添加购买架价格和持有成本相关字段

-- 添加 purchase_shelf_price 字段
ALTER TABLE items ADD COLUMN purchase_shelf_price REAL;

-- 添加 holding_days 字段（实际计算得出，存储缓存值）
ALTER TABLE items ADD COLUMN holding_days INTEGER;

-- 添加 holding_cost 字段（实际计算得出，存储缓存值）
ALTER TABLE items ADD COLUMN holding_cost REAL;
