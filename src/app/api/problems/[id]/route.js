// src/app/api/problems/[id]/route.js
import { db, initDB, Problem } from '@/lib/db-direct';

export async function GET(request, context) {
    const { id } = await context.params;
    initDB();
  
    try {
      const problem = await Problem.findById(Number(id));
      if (!problem) {
        return Response.json({ error: 'Problem not found' }, { status: 404 });
      }
      return Response.json(problem);
    } catch (error) {
      return Response.json({ error: 'Failed to retrieve', details: error.message }, { status: 500 });
    }
}
  
// PATCH /api/problems/:id
export async function PATCH(request, context) {
  const { id } = await context.params
  initDB()

  const data = await request.json()
  console.log('✅ Received PATCH request:', data)

  try {
    const problem = await Problem.update(Number(id), data)
    if (!problem) {
      return Response.json({ error: 'Problem not found' }, { status: 404 })
    }

    // ✅ 如果是提交记录（包含 status 和 duration），则写入 submissions 表
    if (data.status && typeof data.duration !== 'undefined') {
      console.log('📝 Inserting submission record...')

      db.table('submissions').insert({
        user_id: 'default',
        problem_id: Number(id),
        status: data.status,
        duration: Number(data.duration),
        submitted_at: new Date().toISOString()
      })

      console.log('✅ Submission record added for problem', id)
    }

    return Response.json(problem)
  } catch (error) {
    console.error('❌ PATCH error:', error)
    return Response.json({ error: 'Update failed', details: error.message }, { status: 500 })
  }
}
  
export async function DELETE(request, context) {
    initDB();
    const { id } = await context.params;
  
    try {
      const deleted = await Problem.delete(Number(id));
      if (!deleted) {
        return Response.json({ error: 'Problem not found' }, { status: 404 });
      }
      return Response.json({ message: 'Problem deleted' });
    } catch (error) {
      return Response.json({ error: 'Delete failed', details: error.message }, { status: 500 });
    }
}
  
  