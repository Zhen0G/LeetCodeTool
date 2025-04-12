// src/app/api/sets/[id]/remove/route.js

import { connectDB } from '@/lib/mongodb'
import ProblemSet from '@/models/ProblemSet'

export async function POST(request, context) {
  await connectDB()
  const { params } = context
  const { problemId } = await request.json()

  const set = await ProblemSet.findById(params.id)
  if (!set) return Response.json({ error: 'Set not found' }, { status: 404 })

  const index = set.problems.indexOf(problemId)
  if (index === -1) {
    return Response.json({ error: 'Problem not in set' }, { status: 404 })
  }

  set.problems.splice(index, 1)
  await set.save()

  return Response.json({ success: true })
}
