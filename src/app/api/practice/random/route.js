import { initializeDB, Problem, ProblemSet } from '@/lib/db-direct'

export async function GET(req) {
  initializeDB();
  const { searchParams } = new URL(req.url)
  const count = parseInt(searchParams.get('count') || '5')
  const setId = searchParams.get('set')

  let allProblems = []

  if (setId && setId !== 'all') {
    // 转换为数字ID，确保与数据库匹配
    const numericId = parseInt(setId, 10)
    const problemSet = await ProblemSet.findById(numericId)
    
    if (!problemSet) {
      return Response.json({ error: 'Set not found' }, { status: 404 })
    }
    
    // 获取问题集中的所有问题
    const problemIds = problemSet.problems;
    const promises = problemIds.map(id => Problem.findById(id));
    allProblems = (await Promise.all(promises)).filter(Boolean); // 过滤掉null结果
  } else {
    // 获取所有问题
    allProblems = await Problem.findAll();
  }

  // 随机排序并选择指定数量的问题
  const shuffled = allProblems.sort(() => 0.5 - Math.random())
  const selected = shuffled.slice(0, count)
  return Response.json(selected)
}
