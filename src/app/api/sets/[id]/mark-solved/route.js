import { ProblemSet, initDB } from '@/lib/db-direct'

export async function POST(request, { params }) {
  initDB()
  const { id } = await params
  const { problemId } = await request.json()

  const set = await ProblemSet.findById(Number(id))
  if (!set) {
    return Response.json({ error: 'Set not found' }, { status: 404 })
  }

  const solvedList = Array.isArray(set.solved_problems)
    ? set.solved_problems
    : JSON.parse(set.solved_problems || '[]')

  const solved = new Set(solvedList)
  solved.add(Number(problemId))

  const updated = await ProblemSet.update(Number(id), {
    solved_problems: JSON.stringify([...solved])
  })

  return Response.json({ success: true, updated })
}
