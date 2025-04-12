// src/app/api/leetcode/route.js
export async function GET(request) {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
  
    if (!id) {
      return Response.json({ error: 'Missing problem ID' }, { status: 400 })
    }
  
    try {
      // First get all problems' ID and slug mappings
      const res = await fetch('https://leetcode.com/api/problems/all/')
      const json = await res.json()
  
      const matched = json.stat_status_pairs.find(p => p.stat.frontend_question_id == Number(id))
      if (!matched) {
        return Response.json({ error: 'Problem not found' }, { status: 404 })
      }
  
      const slug = matched.stat.question__title_slug
      const title = matched.stat.question__title
      const difficultyMap = { 1: 'Easy', 2: 'Medium', 3: 'Hard' }
      const difficulty = difficultyMap[matched.difficulty.level] || 'Unknown'
      const link = `https://leetcode.com/problems/${slug}`
  
      // Then get tags (through problem's GraphQL interface)
      const gqlRes = await fetch('https://leetcode.com/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `
            query getQuestionTags($titleSlug: String!) {
              question(titleSlug: $titleSlug) {
                topicTags {
                  name
                }
              }
            }
          `,
          variables: { titleSlug: slug },
        }),
      })
  
      const gqlJson = await gqlRes.json()
      const tags = gqlJson.data?.question?.topicTags.map(t => t.name) || []
  
      return Response.json({ id, title, slug, difficulty, link, tags })
    } catch (error) {
      return Response.json({ error: 'Request failed', detail: error.message }, { status: 500 })
    }
}
  