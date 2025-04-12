'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'

export default function NoteDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const [note, setNote] = useState(null)

  useEffect(() => {
    if (!id) return
    fetch(`/api/notes/${id}`)
      .then((res) => res.json())
      .then((data) => setNote(data))
  }, [id])

  const handleDelete = async () => {
    if (!confirm('确定要删除这条记录吗？')) return
    await fetch(`/api/notes/${id}`, { method: 'DELETE' })
    router.push('/notes')
  }

  if (!note) return <div className="p-6">加载中...</div>

  return (
    <main className="p-6 max-w-3xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold">📝 {note.title}</h1>
      <p className="text-sm text-gray-500">
        🕒 创建时间：{new Date(note.createdAt).toLocaleString('zh-CN', { hour12: false })}
      </p>

      <div className="prose prose-sm prose-blue">
        <ReactMarkdown>{note.content}</ReactMarkdown>
      </div>

      <div className="flex gap-4 mt-4">
        <Link
          href={`/notes/${id}/edit`}
          className="px-4 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
        >
          ✏️ 编辑
        </Link>
        <button
          onClick={handleDelete}
          className="px-4 py-1 bg-red-500 text-white rounded hover:bg-red-600"
        >
          🗑️ 删除
        </button>
        <Link
          href="/notes"
          className="ml-auto px-4 py-1 bg-gray-200 text-sm rounded hover:bg-gray-300"
        >
          返回列表
        </Link>
      </div>
    </main>
  )
}
