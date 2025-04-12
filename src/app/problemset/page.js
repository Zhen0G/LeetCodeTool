// ✅ src/app/problemset/page.js
'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function ProblemSetListPage() {
  const [sets, setSets] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSets()
  }, [])

  // 获取题目集合数据
  const fetchSets = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/sets')
      const data = await res.json()
      setSets(data)
    } catch (error) {
      console.error('Failed to fetch problem sets:', error)
    } finally {
      setLoading(false)
    }
  }

  // 阻止事件冒泡，防止点击编辑按钮时触发卡片点击
  const handleEditClick = (e) => {
    e.stopPropagation();
  }

  return (
    <main className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">📚 Problem Sets</h1>
        <div className="flex gap-4">
          <Link
            href="/"
            className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-800 text-sm"
          >
            ← Back to Home
          </Link>
          <Link
            href="/problemset/new"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
          >
            ➕ New Set
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="glass-card text-center py-8 rounded-lg p-4 shadow-sm">
          <p className="text-gray-500">Loading problem sets...</p>
        </div>
      ) : sets.length === 0 ? (
        <div className="glass-card text-center py-8 rounded-lg border shadow-sm p-5">
          <p className="text-gray-500">No problem sets created yet.</p>
          <p className="mt-2">
            <Link href="/problemset/new" className="text-blue-600 hover:underline">
              Create your first problem set
            </Link>
          </p>
        </div>
      ) : (
        <ul className="grid gap-4">
          {sets.map(set => (
            <li key={set.id} className="relative">
              <Link href={`/problemset/${set.id}`} className="glass-card block border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex justify-between items-start mb-2 pr-14">
                  <h2 className="text-lg font-semibold text-blue-800">
                    {set.name}
                  </h2>
                </div>
                <p className="text-sm text-gray-600 line-clamp-2">{set.description}</p>
                {set.problemCount !== undefined && (
                  <p className="mt-2 text-xs text-gray-500">
                    📋 {set.problemCount} problems
                  </p>
                )}
              </Link>
              <Link
                href={`/problemset/${set.id}/edit`}
                className="text-yellow-600 hover:underline text-sm absolute top-4 right-4"
                onClick={handleEditClick}
              >
                ✏️ Edit
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
