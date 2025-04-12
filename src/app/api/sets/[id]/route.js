import { initializeDB, ProblemSet, Problem } from '@/lib/db-direct'

export async function GET(request, context) {
  const { id } = await context.params
  initializeDB()
  
  try {
    // 确保ID正确转换为数字
    const numericId = parseInt(id, 10);
    
    const set = await ProblemSet.findById(numericId);
    
    if (!set) {
      return Response.json({ error: 'Problem set not found', id: numericId }, { status: 404 });
    }
    
    // 获取问题集中的问题详情
    const problemIds = set.problems || [];
    const problemPromises = problemIds.map(pid => Problem.findById(pid));
    const problems = (await Promise.all(problemPromises)).filter(Boolean);
    
    return Response.json({...set, fullProblems: problems});
  } catch (error) {
    return Response.json({ error: 'Failed to retrieve problem set', details: error.message }, { status: 500 });
  }
}

export async function PATCH(request, context) {
  const { id } = await context.params
  initializeDB()
  const data = await request.json()
  
  try {
    // 确保ID正确转换为数字
    const numericId = parseInt(id, 10);
    const set = await ProblemSet.update(numericId, data);
    
    if (!set) {
      return Response.json({ error: 'Problem set not found', id: numericId }, { status: 404 });
    }
    return Response.json(set);
  } catch (error) {
    return Response.json({ error: 'Update failed', details: error.message }, { status: 500 });
  }
}

export async function DELETE(request, context) {
  initializeDB()
  const { id } = await context.params
  
  try {
    // 确保ID正确转换为数字
    const numericId = parseInt(id, 10);
    const deleted = await ProblemSet.delete(numericId);
    
    if (!deleted) {
      return Response.json({ error: 'Problem set not found', id: numericId }, { status: 404 });
    }
    return Response.json({ message: 'Problem set deleted', id: numericId });
  } catch (error) {
    return Response.json({ error: 'Delete failed', details: error.message }, { status: 500 });
  }
}
