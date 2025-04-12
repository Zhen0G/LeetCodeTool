import { connectDB } from '@/lib/mongodb'
import Note from '@/models/Note'

export async function GET(request, { params }) {
  await connectDB()
  const note = await Note.findById(params.id)
  if (!note) {
    return Response.json({ error: 'Record not found' }, { status: 404 })
  }
  return Response.json(note)
}

export async function PATCH(request, { params }) {
  await connectDB()
  const data = await request.json()

  try {
    const updated = await Note.findByIdAndUpdate(
      params.id,
      { $set: { title: data.title, content: data.content } },
      { new: true }
    )
    return Response.json(updated)
  } catch (error) {
    return Response.json({ error: 'Update failed', details: error.message }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  await connectDB()
  const deleted = await Note.findByIdAndDelete(params.id)
  return Response.json({ message: 'Deleted', deleted })
}
