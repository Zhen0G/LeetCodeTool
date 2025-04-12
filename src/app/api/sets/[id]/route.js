import { connectDB } from '@/lib/mongodb'
import ProblemSet from '@/models/ProblemSet'
import Problem from '@/models/Problem'
import mongoose from 'mongoose'

export async function GET(_, context) {
  await connectDB()
  const { params } = context
  const { id } = await context.params

  // ✅ 判断是否为合法的 MongoDB ObjectId
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return Response.json({ error: 'Invalid ID format' }, { status: 400 })
  }

  const set = await ProblemSet.findById(id).lean()
  if (!set) return Response.json({ error: 'Not found' }, { status: 404 })

  const fullProblems = await Problem.find({ id: { $in: set.problems } })
  return Response.json({ ...set, problems: fullProblems })
}

export async function PATCH(request, context) {
  await connectDB()
  const { id } = await context.params

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return Response.json({ error: 'Invalid ID format' }, { status: 400 })
  }

  const update = await request.json()

  try {
    const updated = await ProblemSet.findByIdAndUpdate(id, update, { new: true })
    return Response.json(updated)
  } catch (err) {
    return Response.json({ error: 'Update failed', details: err.message }, { status: 500 })
  }
}
