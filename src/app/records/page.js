'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function RecordsPage() {
  const [records, setRecords] = useState([])

  useEffect(() => {
    fetch('/api/problems')
      .then((res) => res.json())
      .then((problems) => {
        // 从所有题目中提取 history
        const allRecords = []

        problems.forEach((p) => {
          p.history?.forEach((h) => {
            allRecords.push({
              id: p.id,
              title: p.title,
              status: h.status,
              date: new Date(h.date),
              slug: `/problem/${p.id}`
            })
          })
        })

        // 时间倒序排序
        allRecords.sort((a, b) => b.date - a.date)
        setRecords(allRecords)
      })
  }, [])

  // 工具函数：格式化时间
  const formatDate = (d) =>
    d.toLocaleString('zh-CN', { hour12: false, month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })

  return (
    <main className="p-6 max-w-3xl mx-auto">
      <h1 className="text-xl font-bold mb-4">🧾 刷题记录</h1>

      {records.length === 0 ? (
        <p>暂无刷题记录。</p>
      ) : (
        <ul className="space-y-2">
          {records.map((r, i) => (
            <li key={i} className="border rounded p-3 bg-white shadow-sm">
              <div className="text-sm text-gray-500">{formatDate(r.date)}</div>
              <div className="flex justify-between items-center mt-1">
                <Link href={r.slug} className="text-blue-600 hover:underline">
                  #{r.id} {r.title}
                </Link>
                <span
                  className={`px-2 py-1 text-xs rounded ${
                    r.status === '已通过'
                      ? 'bg-green-200 text-green-800'
                      : r.status === '部分通过'
                      ? 'bg-yellow-200 text-yellow-800'
                      : 'bg-gray-200 text-gray-800'
                  }`}
                >
                  {r.status}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
