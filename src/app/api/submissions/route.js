// src/app/api/submissions/route.js
import { db, getDB, initDB } from '@/lib/db-direct'

// ✅ GET: 获取最近刷题记录（JOIN 题目信息）
export async function GET(request) {
  initDB()

  const { searchParams } = new URL(request.url)
  const limit = Number(searchParams.get('limit') || 20)

  try {
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
    `).all('default', limit)

    const formatted = Array.isArray(rows) ? rows.map(r => ({
      id: r.problem_id,
      title: r.title,
      tags: safeParseJson(r.tags),
      status: r.status,
      duration: r.duration,
      date: r.submitted_at,
      difficulty: r.difficulty
    })) : []

    return Response.json(formatted)
  } catch (err) {
    console.error('❌ Failed to fetch submissions:', err)
    return Response.json({ error: 'Query failed', details: err.message }, { status: 500 })
  }
}

// ✅ POST: 插入一条提交记录
export async function POST(request) {
  initDB()

  try {
    const body = await request.json()

    if (!body.problem_id || !body.status) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 })
    }

    db.table('submissions').insert({
      user_id: 'default',
      problem_id: Number(body.problem_id),
      status: body.status,
      duration: Number(body.duration || 0)
    })

    return Response.json({ success: true })
  } catch (e) {
    console.error('❌ Failed to insert submission:', e)
    return Response.json({ error: 'Insert failed', details: e.message }, { status: 500 })
  }
}

// ✅ 安全解析 JSON（防止 tags 字段是 null 或非法格式）
function safeParseJson(str) {
  try {
    return JSON.parse(str || '[]')
  } catch {
    return []
  }
}
