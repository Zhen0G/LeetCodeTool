// src/app/api/sets/[id]/add/route.js

import { connectDB } from '@/lib/mongodb'
import ProblemSet from '@/models/ProblemSet'
import Problem from '@/models/Problem'

export async function POST(request, context) {
  await connectDB()
  const { id } = await context.params
  const { problemId } = await request.json()

  const set = await ProblemSet.findById(id)
  if (!set) return Response.json({ error: 'Set not found' }, { status: 404 })
  if (set.problems.includes(problemId)) {
    return Response.json({ error: 'Problem already exists' }, { status: 409 })
  }

  const problem = await Problem.findOne({ id: problemId })
  if (!problem) return Response.json({ error: 'Problem not found' }, { status: 404 })

  set.problems.push(problemId)
  await set.save()

  return Response.json(problem)
}