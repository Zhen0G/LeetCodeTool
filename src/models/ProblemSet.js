// src/models/ProblemSet.js
const { db, getDB } = require('@/lib/db-sqlite');

class ProblemSet {
  static async findAll() {
    const sets = getDB().prepare('SELECT * FROM problem_sets ORDER BY createdAt DESC').all();
    return sets.map(this.deserialize);
  }

  static async findById(id) {
    const set = getDB().prepare('SELECT * FROM problem_sets WHERE id = ?').get(id);
    return set ? this.deserialize(set) : null;
  }

  static async create(data) {
    const setData = {
      name: data.name,
      description: data.description || '',
      problems: JSON.stringify(data.problems || []),
      createdAt: data.createdAt || new Date().toISOString()
    };
    
    const result = db.table('problem_sets').insert(setData);
    return this.findById(result.lastInsertRowid);
  }

  static async update(id, data) {
    try {
      const numId = Number(id);
      if (isNaN(numId)) throw new Error(`Invalid ID format: ${id}`);
  
      const updateData = {};
  
      if (data.name) updateData.name = data.name;
      if (data.description !== undefined) updateData.description = data.description;
  
      if (data.problems) {
        if (!Array.isArray(data.problems)) {
          throw new Error('Problems must be an array');
        }
        updateData.problems = JSON.stringify(data.problems);
      }
  
      if (data.solved_problems !== undefined) {
        if (!Array.isArray(data.solved_problems) && typeof data.solved_problems !== 'string') {
          throw new Error('solved_problems must be an array or JSON string');
        }
        updateData.solved_problems = Array.isArray(data.solved_problems)
          ? JSON.stringify(data.solved_problems)
          : data.solved_problems;
      }
  
      if (Object.keys(updateData).length > 0) {
        db.table('problem_sets').update({
          values: updateData,
          where: { id: numId }
        });
      }
  
      return this.findById(numId);
    } catch (error) {
      console.error(`Error updating problem set ${id}:`, error);
      throw error;
    }
  }
  

  static async delete(id) {
    const set = await this.findById(id);
    if (!set) return null;
    
    db.table('problem_sets').delete({ id });
    return set;
  }
  
  // 将数据库行转换为 JS 对象
  static deserialize(row) {
    return {
      id: row.id,
      name: row.name,
      description: row.description || '',
      problems: JSON.parse(row.problems || '[]'),
      solved_problems: JSON.parse(row.solved_problems || '[]'),
      createdAt: row.createdAt
    };
  }
  
}

module.exports = ProblemSet;
