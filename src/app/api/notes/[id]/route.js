import { initDB, Note } from '@/lib/db-direct'

export async function GET(request, { params }) {
  initDB()
  const id = await params.id
  const note = await Note.findById(Number(id))
  if (!note) {
    return Response.json({ error: 'Record not found' }, { status: 404 })
  }
  return Response.json(note)
}

export async function PATCH(request, { params }) {
  initDB()
  const id = await params.id
  const data = await request.json()

  try {
    const updated = await Note.update(Number(id), {
      title: data.title,
      content: data.content
    })
    if (!updated) {
      return Response.json({ error: 'Note not found' }, { status: 404 })
    }
    return Response.json(updated)
  } catch (error) {
    return Response.json({ error: 'Update failed', details: error.message }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  initDB()
  const id = await params.id
  const deleted = await Note.delete(Number(id))
  if (!deleted) {
    return Response.json({ error: 'Record not found' }, { status: 404 })
  }
  return Response.json({ message: 'Deleted', deleted })
}
