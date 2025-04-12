// src/app/api/sets/[id]/remove/route.js

import { initializeDB, ProblemSet } from '@/lib/db-direct'

export async function POST(request, context) {
  initializeDB()
  const { id } = await context.params
  const { problemId } = await request.json()

  // 确保ID正确转换为数字
  const numericId = parseInt(id, 10);
  const numericProblemId = parseInt(problemId, 10);

  // 获取问题集
  const set = await ProblemSet.findById(numericId)
  if (!set) return Response.json({ error: 'Set not found' }, { status: 404 })

  // 检查问题是否存在于问题集中
  const index = set.problems.indexOf(numericProblemId)
  if (index === -1) {
    return Response.json({ error: 'Problem not in set' }, { status: 404 })
  }

  // 更新问题集，移除问题
  const updatedProblems = [...set.problems]
  updatedProblems.splice(index, 1)
  await ProblemSet.update(numericId, { problems: updatedProblems })

  return Response.json({ success: true })
}
