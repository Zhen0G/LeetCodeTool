import { connectDB } from '@/lib/mongodb'
import Problem from '@/models/Problem'
import ProblemSet from '@/models/ProblemSet'

export async function GET(req) {
  await connectDB()
  const { searchParams } = new URL(req.url)
  const count = parseInt(searchParams.get('count') || '5')
  const setId = searchParams.get('set')

  let allProblems = []

  if (setId && setId !== 'all') {
    const problemSet = await ProblemSet.findById(setId)
    if (!problemSet) {
      return Response.json({ error: 'Set not found' }, { status: 404 })
    }
    allProblems = await Problem.find({ id: { $in: problemSet.problems } })
  } else {
    allProblems = await Problem.find()
  }

  const shuffled = allProblems.sort(() => 0.5 - Math.random())
  const selected = shuffled.slice(0, count)
  return Response.json(selected)
}
