const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');

// 确保数据目录存在
const dbDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// 数据库文件路径
const dbPath = path.join(dbDir, 'leetcode-tracker.sqlite');

// 数据库连接
let _db = null;

function getDB() {
  if (!_db) {
    _db = new Database(dbPath);
  }
  return _db;
}

// 初始化数据库表
function initDB() {
  const db = getDB();
  
  // 创建problems表
  db.exec(`
    CREATE TABLE IF NOT EXISTS problems (
      id INTEGER PRIMARY KEY,
      title TEXT NOT NULL,
      difficulty TEXT,
      tags TEXT, -- JSON存储
      status_last TEXT DEFAULT 'Not Started',
      status_tried INTEGER DEFAULT 0,
      status_passed INTEGER DEFAULT 0,
      status_partial INTEGER DEFAULT 0,
      favorite INTEGER DEFAULT 0, -- 布尔值使用0/1
      link TEXT,
      note TEXT,
      history TEXT DEFAULT '[]' -- JSON存储
    )
  `);
  
  // 创建notes表
  db.exec(`
    CREATE TABLE IF NOT EXISTS notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      content TEXT,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 创建problem_sets表
  db.exec(`
    CREATE TABLE IF NOT EXISTS problem_sets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      problems TEXT DEFAULT '[]', -- JSON存储
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  return db;
}

// 表查询构建器
const db = {
  table: function(tableName) {
    return {
      select: function(columns = '*') {
        const cols = Array.isArray(columns) ? columns.join(', ') : columns;
        return {
          all: function() {
            return getDB().prepare(`SELECT ${cols} FROM ${tableName}`).all();
          },
          where: function(conditions) {
            const whereClause = Object.entries(conditions)
              .map(([key, _]) => `${key} = ?`)
              .join(' AND ');
            const values = Object.values(conditions);
            
            return {
              all: function() {
                return getDB().prepare(`SELECT ${cols} FROM ${tableName} WHERE ${whereClause}`).all(...values);
              },
              get: function() {
                return getDB().prepare(`SELECT ${cols} FROM ${tableName} WHERE ${whereClause}`).get(...values);
              }
            };
          },
          get: function(id) {
            return getDB().prepare(`SELECT ${cols} FROM ${tableName} WHERE id = ?`).get(id);
          },
          orderBy: function(column, direction = 'ASC') {
            return {
              all: function() {
                return getDB().prepare(`SELECT ${cols} FROM ${tableName} ORDER BY ${column} ${direction}`).all();
              }
            };
          }
        };
      },
      insert: function(data) {
        const columns = Object.keys(data).join(', ');
        const placeholders = Object.keys(data).map(() => '?').join(', ');
        const values = Object.values(data);
        
        return getDB().prepare(`INSERT INTO ${tableName} (${columns}) VALUES (${placeholders})`).run(...values);
      },
      update: function(data) {
        const setClause = Object.keys(data.values)
          .map(key => `${key} = ?`)
          .join(', ');
        const whereClause = Object.keys(data.where)
          .map(key => `${key} = ?`)
          .join(' AND ');
          
        const values = [...Object.values(data.values), ...Object.values(data.where)];
        
        return getDB().prepare(`UPDATE ${tableName} SET ${setClause} WHERE ${whereClause}`).run(...values);
      },
      delete: function(where) {
        const whereClause = Object.keys(where)
          .map(key => `${key} = ?`)
          .join(' AND ');
        const values = Object.values(where);
        
        return getDB().prepare(`DELETE FROM ${tableName} WHERE ${whereClause}`).run(...values);
      }
    };
  }
};

module.exports = { 
  db,
  getDB,
  initDB 
}; 