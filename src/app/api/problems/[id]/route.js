// src/app/api/problems/[id]/route.js
import { initializeDB, Problem } from '@/lib/db-direct';

export async function GET(request, context) {
    const { id } = await context.params;
    initializeDB();
  
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
    const { id } = await context.params;
    initializeDB();
    const data = await request.json();
  
    console.log('✅ Received PATCH request:', data);
  
    try {
      const updated = await Problem.update(Number(id), data);
      if (!updated) {
        return Response.json({ error: 'Problem not found' }, { status: 404 });
      }
      
      return Response.json(updated);
    } catch (error) {
      console.error('❌ PATCH error:', error);
      return Response.json({ error: 'Update failed', details: error.message }, { status: 500 });
    }
}  
  
export async function DELETE(request, context) {
    initializeDB();
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
  
  