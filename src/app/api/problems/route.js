import { initializeDB, Problem } from '@/lib/db-direct'

export async function GET() {
  initializeDB()
  const problems = await Problem.findAll()
  return Response.json(problems)
}

export async function POST(request) {
  initializeDB()
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
