const fs = require('fs');
const path = require('path');
const { getDatabase } = require('../utils/database');

class BackupController {
  static async exportData(req, res) {
    try {
      const db = getDatabase();
      
      const items = await new Promise((resolve, reject) => {
        db.all('SELECT * FROM items', [], (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        });
      });

      const data = {
        version: '1.0.0',
        exported_at: new Date().toISOString(),
        items: items.map(row => ({
          ...row,
          tags: row.tags ? JSON.parse(row.tags) : null
        }))
      };

      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename=family-inventory-backup-${Date.now()}.json`);
      
      res.json(data);
    } catch (error) {
      console.error('导出数据失败:', error);
      res.status(500).json({
        success: false,
        error: '导出数据失败',
        details: error.message
      });
    }
  }

  static async importData(req, res) {
    try {
      const { data, overwrite } = req.body;

      if (!data || !Array.isArray(data.items)) {
        return res.status(400).json({
          success: false,
          error: '数据格式不正确'
        });
      }

      const db = getDatabase();
      
      // 如果覆盖模式，先清空现有数据
      if (overwrite === true) {
        await new Promise((resolve, reject) => {
          db.run('DELETE FROM items', [], function(err) {
            if (err) reject(err);
            else resolve(this.changes);
          });
        });
      }

      let imported = 0;
      let skipped = 0;
      
      for (const item of data.items) {
        try {
          const existing = await new Promise((resolve, reject) => {
            db.get('SELECT id FROM items WHERE id = ?', [item.id], (err, row) => {
              if (err) reject(err);
              else resolve(row);
            });
          });

          if (existing) {
            skipped++;
          } else {
            await new Promise((resolve, reject) => {
              const sql = `
                INSERT INTO items 
                (id, name, image, description, added_at, purchased_at, purchase_price, category, tags, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
              `;
              
              db.run(sql, [
                item.id,
                item.name,
                item.image,
                item.description,
                item.added_at,
                item.purchased_at,
                item.purchase_price,
                item.category,
                item.tags ? JSON.stringify(item.tags) : null,
                item.created_at,
                item.updated_at
              ], function(err) {
                if (err) reject(err);
                else resolve(this.lastID);
              });
            });
            imported++;
          }
        } catch (error) {
          console.error('导入物品失败:', item.id, error);
        }
      }

      res.json({
        success: true,
        data: {
          imported,
          skipped,
          total: data.items.length
        },
        message: `成功导入 ${imported} 个物品，跳过 ${skipped} 个已存在的物品`
      });
    } catch (error) {
      console.error('导入数据失败:', error);
      res.status(500).json({
        success: false,
        error: '导入数据失败',
        details: error.message
      });
    }
  }

  static async getBackupInfo(req, res) {
    try {
      const db = getDatabase();
      
      const [countResult, items] = await Promise.all([
        new Promise((resolve, reject) => {
          db.get('SELECT COUNT(*) as total FROM items', [], (err, row) => {
            if (err) reject(err);
            else resolve(row);
          });
        }),
        new Promise((resolve, reject) => {
          db.all('SELECT created_at FROM items ORDER BY created_at DESC LIMIT 1', [], (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
          });
        })
      ]);

      const info = {
        total_items: countResult.total,
        last_update: items.length > 0 ? items[0].created_at : null,
        database_path: path.join(__dirname, '../../data/inventory.db'),
        database_size: await getDatabaseSize()
      };

      res.json({
        success: true,
        data: info
      });
    } catch (error) {
      console.error('获取备份信息失败:', error);
      res.status(500).json({
        success: false,
        error: '获取备份信息失败',
        details: error.message
      });
    }
  }
}

function getDatabaseSize() {
  return new Promise((resolve) => {
    const dbPath = path.join(__dirname, '../../data/inventory.db');
    fs.stat(dbPath, (err, stats) => {
      if (err) {
        resolve(0);
      } else {
        resolve(stats.size);
      }
    });
  });
}

module.exports = BackupController;