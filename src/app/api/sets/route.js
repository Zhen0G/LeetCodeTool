// src/app/api/sets/route.js

import { initializeDB, ProblemSet } from '@/lib/db-direct'

export async function GET() {
  initializeDB()
  const sets = await ProblemSet.findAll()
  return Response.json(sets)
}

export async function POST(request) {
  initializeDB()
  const data = await request.json()

  try {
    const set = await ProblemSet.create(data)
    return Response.json(set, { status: 201 })
  } catch (error) {
    return Response.json({ error: 'Failed to add problem set', details: error.message }, { status: 500 })
  }
}

export async function DELETE(request) {
  initializeDB()
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  if (!id) return Response.json({ error: 'Missing id' }, { status: 400 })

  try {
    const deleted = await ProblemSet.delete(Number(id))
    if (!deleted) {
      return Response.json({ error: 'Problem set not found' }, { status: 404 })
    }
    return Response.json({ success: true })
  } catch (err) {
    return Response.json({ error: 'Failed to delete', details: err.message }, { status: 500 })
  }
}