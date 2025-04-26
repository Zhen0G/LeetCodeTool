import { initDB, Problem } from '@/lib/db-direct'

export async function GET() {
  initDB()

  try {
    const problems = await Problem.findAll()
    return Response.json(problems) // ✅ 保证是数组
  } catch (err) {
    console.error('❌ Failed to load problems:', err)
    return Response.json({ error: 'Failed to load problems' }, { status: 500 }) // ❌ 若返回的是 object，前端 map 报错
  }
}

export async function POST(request) {
  initDB()
  const data = await request.json()

  const exists = await Problem.findById(data.id)
  if (exists) {
    return Response.json({ error: 'Problem ID already exists, cannot add duplicate' }, { status: 409 })
  }

  try {
    const problem = await Problem.create(data)
    return Response.json(problem, { status: 201 })
  } catch (error) {
    return Response.json({ error: 'Failed to add', details: error.message }, { status: 500 })
  }
}
