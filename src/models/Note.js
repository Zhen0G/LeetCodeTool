const { db, getDB } = require('@/lib/db-sqlite');

class Note {
  static async findAll() {
    return getDB().prepare('SELECT * FROM notes ORDER BY createdAt DESC').all();
  }

  static async findById(id) {
    return getDB().prepare('SELECT * FROM notes WHERE id = ?').get(id);
  }

  static async create(data) {
    const result = db.table('notes').insert({
      title: data.title,
      content: data.content,
      createdAt: data.createdAt || new Date().toISOString()
    });
    
    return this.findById(result.lastInsertRowid);
  }

  static async update(id, data) {
    const note = await this.findById(id);
    if (!note) return null;
    
    const updateData = {};
    if (data.title) updateData.title = data.title;
    if (data.content !== undefined) updateData.content = data.content;
    
    if (Object.keys(updateData).length > 0) {
      db.table('notes').update({
        values: updateData,
        where: { id }
      });
    }
    
    return this.findById(id);
  }

  static async delete(id) {
    const note = await this.findById(id);
    if (!note) return null;
    
    db.table('notes').delete({ id });
    return note;
  }
}

module.exports = Note;
