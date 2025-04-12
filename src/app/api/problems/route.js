import { connectDB } from '@/lib/mongodb'
import Problem from '@/models/Problem'

export async function GET() {
  await connectDB()
  const problems = await Problem.find().sort({ id: 1 })  // Sort by problem ID
  return Response.json(problems)
}

export async function POST(request) {
  await connectDB()
  const data = await request.json()

  const exists = await Problem.findOne({ id: data.id })
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
