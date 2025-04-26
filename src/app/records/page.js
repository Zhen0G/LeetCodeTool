'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function RecordsPage() {
  const [records, setRecords] = useState([])
  const [filter, setFilter] = useState('All')
  const [page, setPage] = useState(1)
  const pageSize = 20

  useEffect(() => {
    fetch('/api/submissions?limit=100')
      .then(res => res.json())
      .then(data => {
        if (!Array.isArray(data)) {
          console.error('❌ Expected array from /api/submissions, got:', data)
          return
        }

        const parsed = data.map(r => ({
          id: r.id || r.problem_id,
          title: r.title,
          status: r.status,
          date: new Date(r.date || r.submitted_at),
          slug: `/problem/${r.id || r.problem_id}`,
          tags: r.tags || [],
          difficulty: r.difficulty || ''
        }))

        setRecords(parsed)
      })
      .catch(err => {
        console.error('❌ Fetch failed:', err)
      })
  }, [])

  const formatDate = (d) =>
    d.toLocaleString('zh-CN', {
      hour12: false,
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })

  const filteredRecords = records.filter(r =>
    filter === 'All' ? true : r.status === filter
  )

  const paginatedRecords = filteredRecords.slice(0, page * pageSize)

  return (
    <main className="p-6 max-w-3xl mx-auto">
      <div className="flex gap-4 mb-6">
        <Link
          href="/"
          className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-800 text-sm"
        >
          ← Back to Home
        </Link>
      </div>

      <h1 className="text-xl font-bold mb-4">🧾 Solve Record History</h1>

      {/* 筛选按钮 */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {['All', 'Solved', 'Partially Solved', 'Unsolved'].map((label) => (
          <button
            key={label}
            onClick={() => {
              setFilter(label)
              setPage(1)
            }}
            className={`px-3 py-1 text-sm rounded border ${
              filter === label
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border-gray-300'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* 列表内容 */}
      {paginatedRecords.length === 0 ? (
        <p className="text-gray-500">No matching record found.</p>
      ) : (
        <ul className="space-y-3">
          {paginatedRecords.map((r, i) => (
            <li key={i} className="border rounded p-4 bg-white shadow-sm space-y-1">
              <div className="text-sm text-gray-500">{formatDate(r.date)}</div>
              <div className="flex justify-between items-center">
                <Link href={r.slug} className="text-blue-600 hover:underline font-medium">
                  #{r.id} {r.title}
                </Link>
                <span
                  className={`px-2 py-1 text-xs rounded font-medium ${
                    r.status === 'Solved'
                      ? 'bg-green-100 text-green-700'
                      : r.status === 'Partially Solved'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {r.status}
                </span>
              </div>

              {/* 难度和标签 */}
              <div className="text-xs text-gray-500 flex flex-wrap gap-2">
                <span>Difficulty: {r.difficulty}</span>
              </div>
              <div className="flex flex-wrap gap-1 mt-1">
                {r.tags.map((tag, j) => (
                  <span
                    key={j}
                    className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* 加载更多 */}
      {paginatedRecords.length < filteredRecords.length && (
        <div className="text-center mt-4">
          <button
            onClick={() => setPage(page + 1)}
            className="text-blue-600 hover:underline text-sm"
          >
            Load More... ⬇
          </button>
        </div>
      )}
    </main>
  )
}
