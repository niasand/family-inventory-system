const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, '../../data/inventory.db');
const migrationsPath = path.join(__dirname, '../migrations');
let db = null;

async function initialize() {
  return new Promise((resolve, reject) => {
    db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('数据库连接失败:', err);
        reject(err);
        return;
      }
      console.log('✅ SQLite 数据库连接成功');
      
      createTables()
        .then(() => runMigrations())
        .then(() => resolve())
        .catch(reject);
    });
  });
}

function createTables() {
  return new Promise((resolve, reject) => {
    const createItemsTable = `
      CREATE TABLE IF NOT EXISTS items (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        image TEXT,
        description TEXT,
        added_at INTEGER NOT NULL,
        purchased_at INTEGER,
        purchase_price REAL,
        category TEXT,
        tags TEXT,
        location TEXT,
        status TEXT DEFAULT 'active',
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      )
    `;

    const createLocationsTable = `
      CREATE TABLE IF NOT EXISTS locations (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        description TEXT,
        parent_id TEXT,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL,
        FOREIGN KEY (parent_id) REFERENCES locations(id) ON DELETE SET NULL
      )
    `;

    db.run(createItemsTable, (err) => {
      if (err) {
        console.error('创建 items 表失败:', err);
        reject(err);
        return;
      }
      console.log('✅ items 表创建/更新成功');
      
      db.run(createLocationsTable, (err) => {
        if (err) {
          console.error('创建 locations 表失败:', err);
          reject(err);
          return;
        }
        console.log('✅ locations 表创建/更新成功');
        resolve();
      });
    });
  });
}

// 运行迁移脚本
async function runMigrations() {
  return new Promise((resolve, reject) => {
    // 创建迁移记录表
    const createMigrationsTable = `
      CREATE TABLE IF NOT EXISTS migrations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        filename TEXT UNIQUE NOT NULL,
        applied_at INTEGER NOT NULL
      )
    `;
    
    db.run(createMigrationsTable, (err) => {
      if (err) {
        console.error('创建迁移记录表失败:', err);
        reject(err);
        return;
      }
      
      // 检查并执行迁移脚本
      if (!fs.existsSync(migrationsPath)) {
        fs.mkdirSync(migrationsPath, { recursive: true });
        resolve();
        return;
      }
      
      const files = fs.readdirSync(migrationsPath)
        .filter(f => f.endsWith('.sql'))
        .sort();
      
      let index = 0;
      
      function runNext() {
        if (index >= files.length) {
          resolve();
          return;
        }
        
        const filename = files[index++];
        
        // 检查是否已执行
        db.get('SELECT * FROM migrations WHERE filename = ?', [filename], (err, row) => {
          if (err) {
            reject(err);
            return;
          }
          
          if (row) {
            console.log(`⏭️ 迁移 ${filename} 已执行，跳过`);
            runNext();
            return;
          }
          
          // 执行迁移脚本
          const sql = fs.readFileSync(path.join(migrationsPath, filename), 'utf8');
          
          db.exec(sql, (err) => {
            if (err) {
              console.error(`❌ 执行迁移 ${filename} 失败:`, err);
              reject(err);
              return;
            }
            
            // 记录迁移
            db.run(
              'INSERT INTO migrations (filename, applied_at) VALUES (?, ?)',
              [filename, Date.now()],
              (err) => {
                if (err) {
                  reject(err);
                  return;
                }
                console.log(`✅ 迁移 ${filename} 执行成功`);
                runNext();
              }
            );
          });
        });
      }
      
      runNext();
    });
  });
}

function getDatabase() {
  if (!db) {
    throw new Error('数据库未初始化');
  }
  return db;
}

module.exports = {
  initialize,
  getDatabase
};
