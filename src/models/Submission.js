const { db, getDB } = require('@/lib/db-sqlite');

class Submission {
  static async create(data) {
    const insertData = {
      user_id: data.user_id || 'default',
      problem_id: Number(data.problem_id),
      status: data.status,
      duration: Number(data.duration || 0),
      submitted_at: data.submitted_at || new Date().toISOString()
    };

    const result = db.table('submissions').insert(insertData);
    return this.findById(result.lastInsertRowid);
  }

  static async findRecent(limit = 20, user_id = 'default') {
    const rows = getDB().prepare(`
      SELECT 
        s.id AS submission_id,
        s.problem_id,
        s.status,
        s.duration,
        s.submitted_at,
        p.title,
        p.tags,
        p.difficulty
      FROM submissions s
      JOIN problems p ON s.problem_id = p.id
      WHERE s.user_id = ?
      ORDER BY s.submitted_at DESC
      LIMIT ?
    `).all(user_id, limit);

    return rows.map(r => ({
      ...r,
      tags: JSON.parse(r.tags || '[]'),
      submitted_at: r.submitted_at
    }));
  }

  static async findById(id) {
    return getDB().prepare('SELECT * FROM submissions WHERE id = ?').get(id);
  }
}

module.exports = Submission;
