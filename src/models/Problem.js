const { db, getDB } = require('@/lib/db-sqlite');

class Problem {
  static async findAll() {
    const rows = getDB().prepare('SELECT * FROM problems ORDER BY id').all();
    return rows.map(this.deserialize);
  }

  static async findById(id) {
    const row = getDB().prepare('SELECT * FROM problems WHERE id = ?').get(id);
    return row ? this.deserialize(row) : null;
  }

  static async create(data) {
    const problemData = {
      id: data.id,
      title: data.title,
      difficulty: data.difficulty,
      tags: JSON.stringify(data.tags || []),
      status_last: data.status?.last || 'Not Started',
      status_tried: data.status?.stats?.tried || 0,
      status_passed: data.status?.stats?.passed || 0,
      status_partial: data.status?.stats?.partial || 0,
      favorite: data.favorite ? 1 : 0,
      link: data.link,
      note: data.note || '',
      history: JSON.stringify(data.history || [])
    };
    
    db.table('problems').insert(problemData);
    return this.findById(data.id);
  }

  static async update(id, data) {
    const problem = await this.findById(id);
    if (!problem) return null;
    
    const updateData = {};
    
    // 处理基本字段
    if (data.title) updateData.title = data.title;
    if (data.difficulty) updateData.difficulty = data.difficulty;
    if (data.tags) updateData.tags = JSON.stringify(data.tags);
    if (data.link) updateData.link = data.link;
    
    // 处理状态更新
    if (data.status) {
      updateData.status_last = data.status;
      updateData.status_tried = (problem.status.stats.tried || 0) + 1;
      
      if (data.status === 'Solved') {
        updateData.status_passed = (problem.status.stats.passed || 0) + 1;
      }
      
      if (data.status === 'Partially Solved') {
        updateData.status_partial = (problem.status.stats.partial || 0) + 1;
      }
      
      // 添加历史记录
      const history = problem.history || [];
      history.push({
        date: new Date().toISOString(),
        status: data.status,
        duration: Number(data.duration) || 0
      });
      
      updateData.history = JSON.stringify(history);
    }
    
    // 处理收藏状态
    if (typeof data.favorite === 'boolean') {
      updateData.favorite = data.favorite ? 1 : 0;
    }
    
    // 处理笔记
    if (typeof data.note === 'string') {
      updateData.note = data.note;
    }
    
    // 处理删除历史记录
    if (data.deleteHistory) {
      const history = problem.history.filter(h => {
        return !(
          new Date(h.date).getTime() === new Date(data.deleteHistory.date).getTime() &&
          h.status === data.deleteHistory.status &&
          (h.duration || 0) === (data.deleteHistory.duration || 0)
        );
      });
      
      updateData.history = JSON.stringify(history);
    }
    
    // 执行更新
    if (Object.keys(updateData).length > 0) {
      db.table('problems').update({
        values: updateData,
        where: { id }
      });
    }
    
    return this.findById(id);
  }

  static async delete(id) {
    const problem = await this.findById(id);
    if (!problem) return null;
    
    getDB().prepare('DELETE FROM problems WHERE id = ?').run(id);
    return problem;
  }

  static async findRandom() {
    const count = getDB().prepare('SELECT COUNT(*) as count FROM problems').get();
    if (count.count === 0) return null;
    
    const offset = Math.floor(Math.random() * count.count);
    const row = getDB().prepare('SELECT * FROM problems LIMIT 1 OFFSET ?').get(offset);
    
    return row ? this.deserialize(row) : null;
  }
  
  // 反序列化
  static deserialize(row) {
    return {
      id: row.id,
      title: row.title,
      difficulty: row.difficulty,
      tags: JSON.parse(row.tags || '[]'),
      status: {
        last: row.status_last,
        stats: {
          tried: row.status_tried,
          passed: row.status_passed,
          partial: row.status_partial
        }
      },
      favorite: Boolean(row.favorite),
      link: row.link,
      note: row.note || '',
      history: JSON.parse(row.history || '[]')
    };
  }
}

module.exports = Problem;
