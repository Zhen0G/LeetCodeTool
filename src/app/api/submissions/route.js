// src/app/api/submissions/route.js
import { Submission, initDB } from '@/lib/db-direct'

export async function GET(request) {
  initDB()

  const { searchParams } = new URL(request.url)
  const limit = Number(searchParams.get('limit') || 20)

  try {
    const recent = await Submission.findRecent(limit)
    return Response.json(recent)
  } catch (err) {
    console.error('❌ Failed to fetch submissions:', err)
    return Response.json({ error: 'Query failed', details: err.message }, { status: 500 })
  }
}

export async function POST(request) {
  initDB()

  try {
    const body = await request.json()

    if (!body.problem_id || !body.status) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 })
    }

    await Submission.create({
      problem_id: Number(body.problem_id),
      status: body.status,
      duration: Number(body.duration || 0),
      user_id: 'default'
    })

    return Response.json({ success: true })
  } catch (e) {
    console.error('❌ Failed to insert submission:', e)
    return Response.json({ error: 'Insert failed', details: e.message }, { status: 500 })
  }
}
