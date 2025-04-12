'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function NotesPage() {
  // 存储笔记列表
  const [notes, setNotes] = useState([])
  // 搜索关键词
  const [search, setSearch] = useState('')

  /**
   * 组件加载时获取笔记列表
   */
  useEffect(() => {
    fetchNotes()
  }, [])

  /**
   * 获取所有笔记数据
   * @returns {void}
   */
  const fetchNotes = () => {
    fetch('/api/notes')
      .then((res) => res.json())
      .then((data) => setNotes(data))
  }

  /**
   * 处理删除笔记的操作
   * @param {string} id - 要删除的笔记ID
   * @returns {Promise<void>}
   */
  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this note?')) return
    // 发送删除请求
    const res = await fetch(`/api/notes?id=${id}`, { method: 'DELETE' })
    // 删除成功后重新获取笔记列表
    if (res.ok) fetchNotes()
  }

  /**
   * 根据搜索关键词过滤笔记
   * 搜索范围包括标题和内容
   */
  const filtered = notes.filter((n) => {
    const q = search.toLowerCase()
    return n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q)
  })

  return (
    <main className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <Link
          href="/"
          className="inline-block px-4 py-2 bg-gray-700 text-white text-sm rounded hover:bg-gray-800"
        >
          ← Back to Home
        </Link>
      </div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">📚 Knowledge Base</h1>
        <Link
          href="/notes/new"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          ➕ Add New Note
        </Link>
      </div>

      <div className="mb-6">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search title or content..."
          className="w-full px-3 py-2 border rounded shadow-sm"
        />
      </div>

      {filtered.length === 0 ? (
        <p className="text-gray-500">No matching notes found</p>
      ) : (
        <ul className="grid gap-4">
          {filtered.map((note) => (
            <li key={note.id} className="border rounded-lg p-4 bg-white shadow-sm">
              <div className="flex justify-between items-start mb-2">
                <h2 className="text-lg font-semibold text-blue-800">
                  <Link href={`/notes/${note.id}`} className="hover:underline">
                    {note.title}
                  </Link>
                </h2>
                <div className="flex gap-3 text-sm">
                  <Link
                    href={`/notes/${note.id}/edit`}
                    className="text-yellow-600 hover:underline"
                  >
                    ✏️ Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(note.id)}
                    className="text-red-600 hover:underline"
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>

              <p className="text-sm text-gray-500 mb-2">
                🕒 {new Date(note.createdAt).toLocaleString('en-US', { hour12: false })}
              </p>
              <p className="text-gray-700 text-sm line-clamp-2 overflow-hidden">
                {note.content.slice(0, 200)}...
              </p>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
