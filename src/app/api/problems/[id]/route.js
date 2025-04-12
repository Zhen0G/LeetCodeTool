// src/app/api/problems/[id]/route.js
import { connectDB } from '@/lib/mongodb';
import Problem from '@/models/Problem';

export async function GET(request, context) {
    const { id } = await context.params;
    await connectDB();
  
    try {
      const problem = await Problem.findOne({ id: Number(id) });
      if (!problem) {
        return Response.json({ error: 'Problem not found' }, { status: 404 });
      }
      return Response.json(problem);
    } catch (error) {
      return Response.json({ error: 'Failed to retrieve', details: error }, { status: 500 });
    }
}
  
  
// PATCH /api/problems/:id
export async function PATCH(request, context) {
    const { id } = await context.params;
    await connectDB();
    const data = await request.json();
  
    console.log('✅ Received PATCH request:', data);
  
    try {
      const problem = await Problem.findOne({ id: Number(id) });
      if (!problem) {
        return Response.json({ error: 'Problem not found' }, { status: 404 });
      }
  
      // ✅ Handle status update
      if (data.status) {
        problem.status.last = data.status;
        problem.status.stats.tried += 1;
        if (data.status === 'Solved') problem.status.stats.passed += 1;
        if (data.status === 'Partially Solved') problem.status.stats.partial += 1;
  
        // ✅ Add solving record, including time spent (ensure duration is a number)
        const duration = Number(data.duration);
        problem.history.push({
          date: new Date(),
          status: data.status,
          duration: isNaN(duration) ? 0 : duration
        });
      }
  
      // ✅ Favorite status
      if (typeof data.favorite === 'boolean') {
        problem.favorite = data.favorite;
      }
  
      // ✅ Problem notes
      if (typeof data.note === 'string') {
        problem.note = data.note;
      }
  
      // ✅ Delete solving record
      if (data.deleteHistory) {
        problem.history = problem.history.filter((h) => {
          return !(
            new Date(h.date).getTime() === new Date(data.deleteHistory.date).getTime() &&
            h.status === data.deleteHistory.status &&
            (h.duration || 0) === (data.deleteHistory.duration || 0)
          );
        });
      }
  
      await problem.save();
      return Response.json(problem);
    } catch (error) {
      console.error('❌ PATCH error:', error);
      return Response.json({ error: 'Update failed', details: error.message }, { status: 500 });
    }
}  
  
  

export async function DELETE(request, context) {
    await connectDB()
    const { id } = await context.params  // 👈 Note that await is needed here
  
    try {
      const deleted = await Problem.findOneAndDelete({ id: Number(id) })
      if (!deleted) {
        return Response.json({ error: 'Problem not found' }, { status: 404 })
      }
      return Response.json({ message: 'Problem deleted' })
    } catch (error) {
      return Response.json({ error: 'Delete failed', details: error.message }, { status: 500 })
    }
}
  
  