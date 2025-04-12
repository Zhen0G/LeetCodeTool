// src/app/api/sets/[id]/add/route.js

import { initializeDB, ProblemSet, Problem } from '@/lib/db-direct'

export async function POST(request, context) {
  try {
    initializeDB()
    const { id } = await context.params
    const { problemId } = await request.json()

    // 确保ID正确转换为数字
    const numericId = parseInt(id, 10);
    const numericProblemId = parseInt(problemId, 10);
    
    if (isNaN(numericId) || isNaN(numericProblemId)) {
      return Response.json({ error: 'Invalid ID format' }, { status: 400 })
    }

    // 获取问题集
    const set = await ProblemSet.findById(numericId)
    if (!set) return Response.json({ error: 'Set not found', id: numericId }, { status: 404 })
    
    // 检查问题是否已存在于问题集中
    if (set.problems.includes(numericProblemId)) {
      return Response.json({ error: 'Problem already exists in set', problemId: numericProblemId }, { status: 409 })
    }

    // 获取要添加的问题
    const problem = await Problem.findById(numericProblemId)
    if (!problem) return Response.json({ error: 'Problem not found', problemId: numericProblemId }, { status: 404 })

    // 更新问题集
    const updatedProblems = [...set.problems, numericProblemId]
    await ProblemSet.update(numericId, { problems: updatedProblems })

    return Response.json(problem)
  } catch (error) {
    console.error('Error in /api/sets/[id]/add:', error);
    return Response.json({ 
      error: 'Server error while adding problem to set',
      details: error.message 
    }, { status: 500 })
  }
}