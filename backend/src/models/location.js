const { v4: uuidv4 } = require('uuid');
const { getDatabase } = require('../utils/database');

class Location {
  static create(locationData) {
    return new Promise((resolve, reject) => {
      const db = getDatabase();
      const now = Date.now();
      
      const location = {
        id: uuidv4(),
        name: locationData.name,
        description: locationData.description || null,
        parent_id: locationData.parent_id || null,
        created_at: now,
        updated_at: now
      };

      const sql = `
        INSERT INTO locations (id, name, description, parent_id, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `;

      db.run(sql, [
        location.id, location.name, location.description, 
        location.parent_id, location.created_at, location.updated_at
      ], function(err) {
        if (err) {
          reject(err);
          return;
        }
        resolve(location);
      });
    });
  }

  static findAll() {
    return new Promise((resolve, reject) => {
      const db = getDatabase();
      
      const sql = 'SELECT * FROM locations ORDER BY name';
      
      db.all(sql, [], (err, rows) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(rows);
      });
    });
  }

  static findById(id) {
    return new Promise((resolve, reject) => {
      const db = getDatabase();
      
      const sql = 'SELECT * FROM locations WHERE id = ?';
      
      db.get(sql, [id], (err, row) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(row || null);
      });
    });
  }

  static findByName(name) {
    return new Promise((resolve, reject) => {
      const db = getDatabase();
      
      const sql = 'SELECT * FROM locations WHERE name = ?';
      
      db.get(sql, [name], (err, row) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(row || null);
      });
    });
  }

  static update(id, locationData) {
    return new Promise((resolve, reject) => {
      const db = getDatabase();
      const now = Date.now();
      
      const updateFields = [];
      const params = [];
      
      if (locationData.name !== undefined) {
        updateFields.push('name = ?');
        params.push(locationData.name);
      }
      if (locationData.description !== undefined) {
        updateFields.push('description = ?');
        params.push(locationData.description);
      }
      if (locationData.parent_id !== undefined) {
        updateFields.push('parent_id = ?');
        params.push(locationData.parent_id);
      }
      
      updateFields.push('updated_at = ?');
      params.push(now);
      params.push(id);
      
      const sql = `UPDATE locations SET ${updateFields.join(', ')} WHERE id = ?`;
      
      db.run(sql, params, function(err) {
        if (err) {
          reject(err);
          return;
        }
        
        if (this.changes === 0) {
          resolve(null);
          return;
        }
        
        Location.findById(id).then(resolve).catch(reject);
      });
    });
  }

  static delete(id) {
    return new Promise((resolve, reject) => {
      const db = getDatabase();
      
      const sql = 'DELETE FROM locations WHERE id = ?';
      
      db.run(sql, [id], function(err) {
        if (err) {
          reject(err);
          return;
        }
        
        resolve(this.changes > 0);
      });
    });
  }

  // 获取物品数量统计（按存放位置）
  static getItemCounts() {
    return new Promise((resolve, reject) => {
      const db = getDatabase();
      
      const sql = `
        SELECT l.id, l.name, COUNT(i.id) as item_count
        FROM locations l
        LEFT JOIN items i ON l.name = i.location AND i.status != 'discarded'
        GROUP BY l.id, l.name
        ORDER BY l.name
      `;
      
      db.all(sql, [], (err, rows) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(rows);
      });
    });
  }
}

module.exports = Location;
