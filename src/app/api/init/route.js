import { getDB, initDB } from '@/lib/db-direct'

export async function POST() {
  try {
    const db = getDB()

    // 清空所有数据表
    db.exec(`
      DROP TABLE IF EXISTS submissions;
      DROP TABLE IF EXISTS problems;
      DROP TABLE IF EXISTS notes;
      DROP TABLE IF EXISTS problem_sets;
    `)

    // 重新创建结构
    initDB()

    return Response.json({ success: true, message: '✅ DB reset success' })
  } catch (err) {
    console.error('❌ Initialize DB failed:', err)
    return Response.json({ error: 'Initialize DB failed', details: err.message }, { status: 500 })
  }
}
