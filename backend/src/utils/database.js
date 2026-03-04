const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../../data/inventory.db');
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
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      )
    `;

    db.run(createItemsTable, (err) => {
      if (err) {
        console.error('创建表失败:', err);
        reject(err);
        return;
      }
      console.log('✅ 数据表创建成功');
      resolve();
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
