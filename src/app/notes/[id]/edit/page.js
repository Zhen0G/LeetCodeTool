'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'

const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false })

export default function EditNotePage() {
  const { id } = useParams()
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!id) return
    fetch(`/api/notes/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setTitle(data.title)
        setContent(data.content)
        setLoading(false)
      })
  }, [id])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)

    const res = await fetch(`/api/notes/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, content })
    })

    if (res.ok) {
      router.push(`/notes/${id}`)
    } else {
      alert('❌ 更新失败')
      setSaving(false)
    }
  }

  if (loading) return <div className="p-6">加载中...</div>

  return (
    <main className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">✏️ 编辑记录</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-medium mb-1">标题：</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border p-2 rounded"
            required
          />
        </div>

        <div>
          <label className="block font-medium mb-1">内容（Markdown 支持）：</label>
          <div className="bg-white rounded border">
            <MDEditor value={content} onChange={setContent} height={400} />
          </div>
        </div>

        <button
          type="submit"
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          disabled={saving}
        >
          {saving ? '保存中...' : '💾 保存修改'}
        </button>
      </form>
    </main>
  )
}
