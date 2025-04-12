const { getDB } = require('@/lib/sqlite');

const Note = {
  // 获取所有笔记
  findAll: () => {
    const db = getDB();
    const notes = db.prepare('SELECT * FROM notes ORDER BY created_at DESC').all();
    
    return notes.map(note => ({
      id: note.id,
      title: note.title,
      content: note.content,
      createdAt: new Date(note.created_at)
    }));
  },
  
  // 按ID查找笔记
  findById: (id) => {
    const db = getDB();
    const note = db.prepare('SELECT * FROM notes WHERE id = ?').get(id);
    
    if (!note) return null;
    
    return {
      id: note.id,
      title: note.title,
      content: note.content,
      createdAt: new Date(note.created_at)
    };
  },
  
  // 创建新笔记
  create: (data) => {
    const db = getDB();
    
    try {
      const result = db.prepare(`
        INSERT INTO notes (title, content)
        VALUES (?, ?)
      `).run(
        data.title,
        data.content
      );
      
      const noteId = result.lastInsertRowid;
      
      return Note.findById(noteId);
    } catch (error) {
      throw error;
    }
  },
  
  // 更新笔记
  update: (id, data) => {
    const db = getDB();
    
    try {
      const updates = [];
      const params = [];
      
      if (data.title !== undefined) {
        updates.push('title = ?');
        params.push(data.title);
      }
      
      if (data.content !== undefined) {
        updates.push('content = ?');
        params.push(data.content);
      }
      
      if (updates.length > 0) {
        params.push(id);
        db.prepare(`UPDATE notes SET ${updates.join(', ')} WHERE id = ?`).run(...params);
      }
      
      return Note.findById(id);
    } catch (error) {
      throw error;
    }
  },
  
  // 删除笔记
  delete: (id) => {
    const db = getDB();
    
    try {
      const result = db.prepare('DELETE FROM notes WHERE id = ?').run(id);
      return { deleted: result.changes > 0 };
    } catch (error) {
      throw error;
    }
  }
};

module.exports = Note; 