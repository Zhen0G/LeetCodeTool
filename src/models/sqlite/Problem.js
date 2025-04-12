const { getDB, serialize, deserialize } = require('../../lib/sqlite');

const Problem = {
  // 获取所有问题
  findAll: (sort = { field: 'id', order: 'asc' }) => {
    const db = getDB();
    const orderClause = `${sort.field} ${sort.order === 'desc' ? 'DESC' : 'ASC'}`;
    const problems = db.prepare(`SELECT * FROM problems ORDER BY ${orderClause}`).all();
    
    return problems.map(problem => {
      // 获取问题历史记录
      const history = db.prepare('SELECT * FROM problem_history WHERE problem_id = ? ORDER BY date ASC')
        .all(problem.id);
      
      // 处理标签（字符串转数组）
      const tags = problem.tags ? deserialize(problem.tags) : [];
      
      // 重构为与MongoDB模型相同的结构
      return {
        id: problem.id,
        title: problem.title,
        tags,
        difficulty: problem.difficulty,
        status: {
          last: problem.status_last,
          stats: {
            tried: problem.stats_tried,
            passed: problem.stats_passed,
            partial: problem.stats_partial
          }
        },
        favorite: Boolean(problem.favorite),
        link: problem.link,
        note: problem.note,
        history: history.map(h => ({
          date: new Date(h.date),
          status: h.status,
          duration: h.duration
        }))
      };
    });
  },
  
  // 按ID查找问题
  findById: (id) => {
    const db = getDB();
    const problem = db.prepare('SELECT * FROM problems WHERE id = ?').get(id);
    
    if (!problem) return null;
    
    // 获取问题历史记录
    const history = db.prepare('SELECT * FROM problem_history WHERE problem_id = ? ORDER BY date ASC')
      .all(problem.id);
    
    // 处理标签（字符串转数组）
    const tags = problem.tags ? deserialize(problem.tags) : [];
    
    // 重构为与MongoDB模型相同的结构
    return {
      id: problem.id,
      title: problem.title,
      tags,
      difficulty: problem.difficulty,
      status: {
        last: problem.status_last,
        stats: {
          tried: problem.stats_tried,
          passed: problem.stats_passed,
          partial: problem.stats_partial
        }
      },
      favorite: Boolean(problem.favorite),
      link: problem.link,
      note: problem.note,
      history: history.map(h => ({
        date: new Date(h.date),
        status: h.status,
        duration: h.duration
      }))
    };
  },
  
  // 创建新问题
  create: (data) => {
    const db = getDB();
    
    try {
      // 准备数据
      const tags = data.tags ? serialize(data.tags) : '[]';
      
      // 开始事务
      db.prepare('BEGIN').run();
      
      // 插入问题数据
      db.prepare(`
        INSERT INTO problems (
          id, title, tags, difficulty, 
          status_last, stats_tried, stats_passed, stats_partial,
          favorite, link, note
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        data.id,
        data.title,
        tags,
        data.difficulty,
        data.status?.last || 'Not Started',
        data.status?.stats?.tried || 0,
        data.status?.stats?.passed || 0,
        data.status?.stats?.partial || 0,
        data.favorite ? 1 : 0,
        data.link,
        data.note || ''
      );
      
      // 插入历史记录（如果有）
      if (data.history && Array.isArray(data.history) && data.history.length > 0) {
        const insertHistory = db.prepare(`
          INSERT INTO problem_history (problem_id, date, status, duration)
          VALUES (?, ?, ?, ?)
        `);
        
        for (const item of data.history) {
          insertHistory.run(
            data.id,
            item.date instanceof Date ? item.date.toISOString() : item.date,
            item.status,
            item.duration || 0
          );
        }
      }
      
      // 提交事务
      db.prepare('COMMIT').run();
      
      // 返回创建的问题
      return Problem.findById(data.id);
    } catch (error) {
      // 回滚事务
      db.prepare('ROLLBACK').run();
      throw error;
    }
  },
  
  // 更新问题
  update: (id, data) => {
    const db = getDB();
    
    try {
      // 开始事务
      db.prepare('BEGIN').run();
      
      const updates = [];
      const params = [];
      
      // 构建更新字段
      if (data.title !== undefined) {
        updates.push('title = ?');
        params.push(data.title);
      }
      
      if (data.tags !== undefined) {
        updates.push('tags = ?');
        params.push(serialize(data.tags));
      }
      
      if (data.difficulty !== undefined) {
        updates.push('difficulty = ?');
        params.push(data.difficulty);
      }
      
      if (data.status?.last !== undefined) {
        updates.push('status_last = ?');
        params.push(data.status.last);
      }
      
      if (data.status?.stats?.tried !== undefined) {
        updates.push('stats_tried = ?');
        params.push(data.status.stats.tried);
      }
      
      if (data.status?.stats?.passed !== undefined) {
        updates.push('stats_passed = ?');
        params.push(data.status.stats.passed);
      }
      
      if (data.status?.stats?.partial !== undefined) {
        updates.push('stats_partial = ?');
        params.push(data.status.stats.partial);
      }
      
      if (data.favorite !== undefined) {
        updates.push('favorite = ?');
        params.push(data.favorite ? 1 : 0);
      }
      
      if (data.link !== undefined) {
        updates.push('link = ?');
        params.push(data.link);
      }
      
      if (data.note !== undefined) {
        updates.push('note = ?');
        params.push(data.note);
      }
      
      // 如果有要更新的字段
      if (updates.length > 0) {
        params.push(id); // 添加WHERE条件的参数
        db.prepare(`UPDATE problems SET ${updates.join(', ')} WHERE id = ?`).run(...params);
      }
      
      // 处理历史记录更新
      if (data.history && Array.isArray(data.history) && data.history.length > 0) {
        // 先删除现有的历史记录
        db.prepare('DELETE FROM problem_history WHERE problem_id = ?').run(id);
        
        // 添加新的历史记录
        const insertHistory = db.prepare(`
          INSERT INTO problem_history (problem_id, date, status, duration)
          VALUES (?, ?, ?, ?)
        `);
        
        for (const item of data.history) {
          insertHistory.run(
            id,
            item.date instanceof Date ? item.date.toISOString() : item.date,
            item.status,
            item.duration || 0
          );
        }
      }
      
      // 提交事务
      db.prepare('COMMIT').run();
      
      // 返回更新后的问题
      return Problem.findById(id);
    } catch (error) {
      // 回滚事务
      db.prepare('ROLLBACK').run();
      throw error;
    }
  },
  
  // 删除问题
  delete: (id) => {
    const db = getDB();
    
    try {
      // 开始事务
      db.prepare('BEGIN').run();
      
      // 删除关联的历史记录
      db.prepare('DELETE FROM problem_history WHERE problem_id = ?').run(id);
      
      // 删除题集中的关联
      db.prepare('DELETE FROM problem_set_problems WHERE problem_id = ?').run(id);
      
      // 删除问题
      const result = db.prepare('DELETE FROM problems WHERE id = ?').run(id);
      
      // 提交事务
      db.prepare('COMMIT').run();
      
      return { deleted: result.changes > 0 };
    } catch (error) {
      // 回滚事务
      db.prepare('ROLLBACK').run();
      throw error;
    }
  },
  
  // 添加历史记录
  addHistory: (id, historyItem) => {
    const db = getDB();
    
    try {
      const date = historyItem.date instanceof Date 
        ? historyItem.date.toISOString() 
        : historyItem.date;
      
      db.prepare(`
        INSERT INTO problem_history (problem_id, date, status, duration)
        VALUES (?, ?, ?, ?)
      `).run(
        id,
        date,
        historyItem.status,
        historyItem.duration || 0
      );
      
      return Problem.findById(id);
    } catch (error) {
      throw error;
    }
  }
};

module.exports = Problem; 