const { getDB, serialize, deserialize } = require('@/lib/sqlite');
const Problem = require('./Problem');

const ProblemSet = {
  // 获取所有题集
  findAll: () => {
    const db = getDB();
    const sets = db.prepare('SELECT * FROM problem_sets ORDER BY created_at DESC').all();
    
    return sets.map(set => {
      // 获取题集包含的问题ID
      const problemIds = db.prepare('SELECT problem_id FROM problem_set_problems WHERE set_id = ?')
        .all(set.id)
        .map(row => row.problem_id);
      
      // 计算问题数量
      const problemCount = problemIds.length;
      
      return {
        _id: set.id, // 兼容MongoDB的_id字段
        id: set.id,
        name: set.name,
        description: set.description || '',
        problems: problemIds,
        problemCount,
        createdAt: new Date(set.created_at)
      };
    });
  },
  
  // 按ID查找题集
  findById: (id) => {
    const db = getDB();
    
    // 确保ID是数字
    const numId = Number(id);
    if (isNaN(numId)) {
      console.error(`Invalid ID format: ${id}`);
      return null;
    }
    
    const set = db.prepare('SELECT * FROM problem_sets WHERE id = ?').get(numId);
    
    if (!set) return null;
    
    // 获取题集包含的问题ID
    const problemIds = db.prepare('SELECT problem_id FROM problem_set_problems WHERE set_id = ?')
      .all(set.id)
      .map(row => row.problem_id);
    
    // 计算问题数量
    const problemCount = problemIds.length;
    
    return {
      _id: set.id, // 兼容MongoDB的_id字段
      id: set.id,
      name: set.name,
      description: set.description || '',
      problems: problemIds,
      problemCount,
      createdAt: new Date(set.created_at)
    };
  },
  
  // 创建新题集
  create: (data) => {
    const db = getDB();
    
    // 额外的日志记录
    console.log('ProblemSet.create called with data:', {
      name: data.name,
      description: data.description ? data.description.substring(0, 20) + '...' : '',
      problemsCount: data.problems ? data.problems.length : 0
    });
    
    try {
      // 验证数据
      if (!data.name) {
        throw new Error('题集名称不能为空');
      }
      
      // 开始事务
      db.prepare('BEGIN').run();
      
      // 插入题集
      const insertResult = db.prepare(`
        INSERT INTO problem_sets (name, description)
        VALUES (?, ?)
      `);
      
      console.log('Executing insert with params:', [data.name, data.description || '']);
      
      const result = insertResult.run(
        data.name,
        data.description || ''
      );
      
      console.log('Insert result:', {
        lastInsertRowid: result.lastInsertRowid,
        changes: result.changes
      });
      
      const setId = result.lastInsertRowid;
      
      // 如果有问题列表，添加关联
      if (data.problems && Array.isArray(data.problems) && data.problems.length > 0) {
        const insertProblem = db.prepare(`
          INSERT INTO problem_set_problems (set_id, problem_id)
          VALUES (?, ?)
        `);
        
        for (const problemId of data.problems) {
          try {
            insertProblem.run(setId, problemId);
          } catch (err) {
            console.warn(`Failed to add problem ${problemId} to set ${setId}:`, err.message);
          }
        }
      }
      
      // 提交事务
      db.prepare('COMMIT').run();
      
      // 返回创建的题集
      const createdSet = ProblemSet.findById(setId);
      console.log('Created set:', createdSet ? { id: createdSet.id, name: createdSet.name } : null);
      return createdSet;
    } catch (error) {
      // 回滚事务
      try {
        db.prepare('ROLLBACK').run();
      } catch (rollbackError) {
        console.error('Failed to rollback transaction:', rollbackError);
      }
      
      console.error('Failed to create problem set:', error);
      throw error;
    }
  },
  
  // 更新题集
  update: (id, data) => {
    const db = getDB();
    
    try {
      // 开始事务
      db.prepare('BEGIN').run();
      
      const updates = [];
      const params = [];
      
      // 构建更新字段
      if (data.name !== undefined) {
        updates.push('name = ?');
        params.push(data.name);
      }
      
      if (data.description !== undefined) {
        updates.push('description = ?');
        params.push(data.description);
      }
      
      // 如果有要更新的字段
      if (updates.length > 0) {
        params.push(id); // 添加WHERE条件的参数
        db.prepare(`UPDATE problem_sets SET ${updates.join(', ')} WHERE id = ?`).run(...params);
      }
      
      // 处理问题列表更新
      if (data.problems !== undefined) {
        // 先删除现有的关联
        db.prepare('DELETE FROM problem_set_problems WHERE set_id = ?').run(id);
        
        // 添加新的关联
        if (Array.isArray(data.problems) && data.problems.length > 0) {
          const insertProblem = db.prepare(`
            INSERT INTO problem_set_problems (set_id, problem_id)
            VALUES (?, ?)
          `);
          
          for (const problemId of data.problems) {
            insertProblem.run(id, problemId);
          }
        }
      }
      
      // 提交事务
      db.prepare('COMMIT').run();
      
      // 返回更新后的题集
      return ProblemSet.findById(id);
    } catch (error) {
      // 回滚事务
      db.prepare('ROLLBACK').run();
      throw error;
    }
  },
  
  // 删除题集
  delete: (id) => {
    const db = getDB();
    
    try {
      // 开始事务
      db.prepare('BEGIN').run();
      
      // 删除关联
      db.prepare('DELETE FROM problem_set_problems WHERE set_id = ?').run(id);
      
      // 删除题集
      const result = db.prepare('DELETE FROM problem_sets WHERE id = ?').run(id);
      
      // 提交事务
      db.prepare('COMMIT').run();
      
      return { deleted: result.changes > 0 };
    } catch (error) {
      // 回滚事务
      db.prepare('ROLLBACK').run();
      throw error;
    }
  },
  
  // 添加问题到题集
  addProblem: (setId, problemId) => {
    const db = getDB();
    
    try {
      // 检查是否已存在
      const exists = db.prepare('SELECT 1 FROM problem_set_problems WHERE set_id = ? AND problem_id = ?')
        .get(setId, problemId);
      
      if (!exists) {
        db.prepare('INSERT INTO problem_set_problems (set_id, problem_id) VALUES (?, ?)')
          .run(setId, problemId);
      }
      
      return ProblemSet.findById(setId);
    } catch (error) {
      throw error;
    }
  },
  
  // 从题集中移除问题
  removeProblem: (setId, problemId) => {
    const db = getDB();
    
    try {
      db.prepare('DELETE FROM problem_set_problems WHERE set_id = ? AND problem_id = ?')
        .run(setId, problemId);
      
      return ProblemSet.findById(setId);
    } catch (error) {
      throw error;
    }
  },
  
  // 获取题集的完整问题详情
  getProblemsInSet: (setId) => {
    const db = getDB();
    
    // 获取题集包含的问题ID
    const problemIds = db.prepare('SELECT problem_id FROM problem_set_problems WHERE set_id = ?')
      .all(setId)
      .map(row => row.problem_id);
    
    // 获取每个问题的详细信息
    const problems = problemIds.map(id => Problem.findById(id)).filter(p => p !== null);
    
    return problems;
  }
};

module.exports = ProblemSet; 