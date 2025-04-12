// src/app/api/sets/route.js

import { connectDB } from '@/lib/mongodb'
import ProblemSet from '@/models/ProblemSet'

export async function GET() {
  await connectDB()
  const sets = await ProblemSet.find().sort({ createdAt: -1 })
  return Response.json(sets)
}

export async function POST(request) {
  await connectDB()
  const body = await request.json()

  try {
    const created = await ProblemSet.create({
      name: body.name,
      description: body.description || '',
      problems: Array.isArray(body.problems) ? body.problems : []
    })
    return Response.json(created, { status: 201 })
  } catch (err) {
    return Response.json({ error: 'Failed to create set', details: err.message }, { status: 500 })
  }
}

export async function DELETE(request) {
  await connectDB()
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  if (!id) return Response.json({ error: 'Missing id' }, { status: 400 })

  try {
    await ProblemSet.findByIdAndDelete(id)
    return Response.json({ success: true })
  } catch (err) {
    return Response.json({ error: 'Failed to delete', details: err.message }, { status: 500 })
  }
}