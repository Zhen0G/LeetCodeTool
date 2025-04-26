// src/app/api/notes/route.js
import { initDB, Note } from '@/lib/db-direct'

export async function GET() {
  initDB()
  const notes = await Note.findAll()
  return Response.json(notes)
}

export async function POST(request) {
  initDB()
  const data = await request.json()

  try {
    const note = await Note.create({
      title: data.title,
      content: data.content
    })
    return Response.json(note, { status: 201 })
  } catch (error) {
    return Response.json({ error: 'Failed to add', details: error.message }, { status: 500 })
  }
}

export async function DELETE(request) {
  initDB()
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  try {
    const deleted = await Note.delete(Number(id))
    if (!deleted) {
      return Response.json({ error: 'Record not found' }, { status: 404 })
    }
    return Response.json({ message: 'Deleted', id })
  } catch (error) {
    return Response.json({ error: 'Delete failed', details: error.message }, { status: 500 })
  }
}