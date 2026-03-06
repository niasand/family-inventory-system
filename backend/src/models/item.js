const { v4: uuidv4 } = require('uuid');
const { getDatabase } = require('../utils/database');

class Item {
  static create(itemData) {
    return new Promise((resolve, reject) => {
      const db = getDatabase();
      const now = Date.now();
      
      const item = {
        id: uuidv4(),
        name: itemData.name,
        image: itemData.image || null,
        description: itemData.description || null,
        added_at: itemData.added_at || now,
        purchased_at: itemData.purchased_at || null,
        purchase_price: itemData.purchase_price || null,
        category: itemData.category || null,
        tags: itemData.tags ? JSON.stringify(itemData.tags) : null,
        location: itemData.location || null,
        status: itemData.status || 'active',
        created_at: now,
        updated_at: now
      };

      const sql = `
        INSERT INTO items 
        (id, name, image, description, added_at, purchased_at, purchase_price, category, tags, location, status, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      db.run(sql, [
        item.id, item.name, item.image, item.description, item.added_at, 
        item.purchased_at, item.purchase_price, item.category, item.tags,
        item.location, item.status, item.created_at, item.updated_at
      ], function(err) {
        if (err) {
          reject(err);
          return;
        }
        // 使用 UUID 作为 ID，不使用 lastID
        resolve(item);
      });
    });
  }

  static findAll(limit = 50, offset = 0, filters = {}) {
    return new Promise((resolve, reject) => {
      const db = getDatabase();
      let sql = 'SELECT * FROM items WHERE 1=1';
      const params = [];

      if (filters.search) {
        sql += ' AND (name LIKE ? OR description LIKE ? OR category LIKE ?)';
        const searchTerm = `%${filters.search}%`;
        params.push(searchTerm, searchTerm, searchTerm);
      }

      if (filters.category) {
        sql += ' AND category = ?';
        params.push(filters.category);
      }

      if (filters.tags) {
        sql += ' AND tags LIKE ?';
        params.push(`%"${filters.tags}"%`);
      }

      // 按状态筛选
      if (filters.status) {
        sql += ' AND status = ?';
        params.push(filters.status);
      }

      // 按存放位置筛选
      if (filters.location) {
        sql += ' AND location = ?';
        params.push(filters.location);
      }

      sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
      params.push(limit, offset);

      db.all(sql, params, (err, rows) => {
        if (err) {
          reject(err);
          return;
        }
        
        const items = rows.map(row => ({
          ...row,
          tags: row.tags ? JSON.parse(row.tags) : null
        }));
        
        resolve(items);
      });
    });
  }

  static findById(id) {
    return new Promise((resolve, reject) => {
      const db = getDatabase();
      
      const sql = 'SELECT * FROM items WHERE id = ?';
      
      db.get(sql, [id], (err, row) => {
        if (err) {
          reject(err);
          return;
        }
        
        if (!row) {
          resolve(null);
          return;
        }
        
        const item = {
          ...row,
          tags: row.tags ? JSON.parse(row.tags) : null
        };
        
        resolve(item);
      });
    });
  }

  static update(id, itemData) {
    return new Promise((resolve, reject) => {
      const db = getDatabase();
      const now = Date.now();
      
      const updateFields = [];
      const params = [];
      
      if (itemData.name !== undefined) {
        updateFields.push('name = ?');
        params.push(itemData.name);
      }
      if (itemData.image !== undefined) {
        updateFields.push('image = ?');
        params.push(itemData.image);
      }
      if (itemData.description !== undefined) {
        updateFields.push('description = ?');
        params.push(itemData.description);
      }
      if (itemData.added_at !== undefined) {
        updateFields.push('added_at = ?');
        params.push(itemData.added_at);
      }
      if (itemData.purchased_at !== undefined) {
        updateFields.push('purchased_at = ?');
        params.push(itemData.purchased_at);
      }
      if (itemData.purchase_price !== undefined) {
        updateFields.push('purchase_price = ?');
        params.push(itemData.purchase_price);
      }
      if (itemData.category !== undefined) {
        updateFields.push('category = ?');
        params.push(itemData.category);
      }
      if (itemData.tags !== undefined) {
        updateFields.push('tags = ?');
        params.push(itemData.tags ? JSON.stringify(itemData.tags) : null);
      }
      if (itemData.location !== undefined) {
        updateFields.push('location = ?');
        params.push(itemData.location);
      }
      if (itemData.status !== undefined) {
        updateFields.push('status = ?');
        params.push(itemData.status);
      }
      
      updateFields.push('updated_at = ?');
      params.push(now);
      params.push(id);
      
      if (updateFields.length === 1) {
        updateFields.unshift('id');
      }
      
      const sql = `UPDATE items SET ${updateFields.join(', ')} WHERE id = ?`;
      
      db.run(sql, params, function(err) {
        if (err) {
          reject(err);
          return;
        }
        
        if (this.changes === 0) {
          resolve(null);
          return;
        }
        
        Item.findById(id).then(resolve).catch(reject);
      });
    });
  }

  static delete(id) {
    return new Promise((resolve, reject) => {
      const db = getDatabase();
      
      const sql = 'DELETE FROM items WHERE id = ?';
      
      db.run(sql, [id], function(err) {
        if (err) {
          reject(err);
          return;
        }
        
        resolve(this.changes > 0);
      });
    });
  }

  static count(filters = {}) {
    return new Promise((resolve, reject) => {
      const db = getDatabase();
      let sql = 'SELECT COUNT(*) as total FROM items WHERE 1=1';
      const params = [];

      if (filters.search) {
        sql += ' AND (name LIKE ? OR description LIKE ? OR category LIKE ?)';
        const searchTerm = `%${filters.search}%`;
        params.push(searchTerm, searchTerm, searchTerm);
      }

      if (filters.category) {
        sql += ' AND category = ?';
        params.push(filters.category);
      }

      // 按状态筛选
      if (filters.status) {
        sql += ' AND status = ?';
        params.push(filters.status);
      }

      // 按存放位置筛选
      if (filters.location) {
        sql += ' AND location = ?';
        params.push(filters.location);
      }

      db.get(sql, params, (err, row) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(row.total);
      });
    });
  }

  static getCategories() {
    return new Promise((resolve, reject) => {
      const db = getDatabase();
      
      const sql = 'SELECT DISTINCT category FROM items WHERE category IS NOT NULL ORDER BY category';
      
      db.all(sql, [], (err, rows) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(rows.map(row => row.category));
      });
    });
  }

  static getTags() {
    return new Promise((resolve, reject) => {
      const db = getDatabase();
      
      const sql = 'SELECT tags FROM items WHERE tags IS NOT NULL';
      
      db.all(sql, [], (err, rows) => {
        if (err) {
          reject(err);
          return;
        }
        
        const tags = new Set();
        rows.forEach(row => {
          if (row.tags) {
            try {
              const tagArray = JSON.parse(row.tags);
              if (Array.isArray(tagArray)) {
                tagArray.forEach(tag => tags.add(tag));
              }
            } catch (e) {
              console.error('解析标签时出错:', e);
            }
          }
        });
        
        resolve(Array.from(tags).sort());
      });
    });
  }

  // 获取所有状态选项
  static getStatuses() {
    return Promise.resolve([
      { value: 'active', label: '在用', color: '#67c23a' },
      { value: 'idle', label: '闲置', color: '#909399' },
      { value: 'damaged', label: '损坏', color: '#e6a23c' },
      { value: 'discarded', label: '已丢弃', color: '#f56c6c' }
    ]);
  }
}

module.exports = Item;
