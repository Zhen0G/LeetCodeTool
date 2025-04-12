// src/app/api/notes/route.js
import { connectDB } from '@/lib/mongodb'
import Note from '@/models/Note'

export async function GET() {
  await connectDB()
  const notes = await Note.find().sort({ createdAt: -1 })
  return Response.json(notes)
}

export async function POST(request) {
  await connectDB()
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
  await connectDB()
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  try {
    const deleted = await Note.findByIdAndDelete(id)
    if (!deleted) {
      return Response.json({ error: 'Record not found' }, { status: 404 })
    }
    return Response.json({ message: 'Deleted', id })
  } catch (error) {
    return Response.json({ error: 'Delete failed', details: error.message }, { status: 500 })
  }
}