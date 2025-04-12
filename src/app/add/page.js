'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function AddProblemPage() {
  const router = useRouter()
  // 模式选择：单题模式或批量模式
  const [mode, setMode] = useState('single')
  // 存储题目ID输入
  const [ids, setIds] = useState('')
  // 存储获取到的题目信息
  const [problems, setProblems] = useState([])
  // 存储笔记内容
  const [note, setNote] = useState('')
  // 存储操作提示信息
  const [message, setMessage] = useState('')
  // 加载状态
  const [loading, setLoading] = useState(false)

  /**
   * 处理CSV文件上传，从文件中提取题目ID
   * @param {Event} e - 文件上传事件对象
   * @returns {Promise<void>}
   */
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // 读取文件内容
    const text = await file.text()
    // 按行分割并提取第一列作为题号
    const lines = text.split(/\r?\n/)
    const extractedIds = lines.map((line) => line.trim().split(',')[0]).filter(Boolean)
    // 更新题号输入框
    setIds(extractedIds.join(','))
    // 显示提取成功的消息
    setMessage(`📄 Read ${extractedIds.length} problem IDs from CSV`)
  }

  /**
   * 处理获取题目信息的操作
   * @returns {Promise<void>}
   */
  const handleFetch = async () => {
    // 解析输入的题号，去除空格并过滤空值
    const idList = ids.split(',').map((id) => id.trim()).filter(Boolean)
    if (idList.length === 0) return setMessage('❗ Please enter problem IDs')

    // 设置加载状态
    setLoading(true)
    setMessage('🔍 Searching for problems...')

    // 逐个获取题目信息
    const results = []
    for (const id of idList) {
      const res = await fetch(`/api/leetcode?id=${id}`)
      if (res.ok) {
        const data = await res.json()
        results.push(data)
      } else {
        // 查询失败，添加错误信息
        results.push({ id, error: '❌ Failed to find problem' })
      }
    }

    // 更新题目列表和提示信息
    setProblems(results)
    setMessage('✅ Search completed, please confirm the problems')
    setLoading(false)
  }

  /**
   * 处理提交添加题目的操作
   * @returns {Promise<void>}
   */
  const handleSubmit = async () => {
    // 过滤出有效的题目并准备提交数据
    const toSubmit = problems.filter(p => !p.error).map((problem) => ({
      id: Number(problem.id),
      title: problem.title,
      tags: problem.tags,
      difficulty: problem.difficulty,
      link: problem.link,
      favorite: false,
      note: note.trim()
    }))

    // 逐个发送添加请求
    let success = 0
    for (const problem of toSubmit) {
      const res = await fetch('/api/problems', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(problem)
      })
      if (res.ok) {
        success++
      }
    }

    // 显示成功消息并跳转回主页
    setMessage(`✅ Successfully added ${success} problems, redirecting...`)
    setTimeout(() => router.push('/'), 1500)
  }

  return (
    <main className="p-6 max-w-2xl mx-auto space-y-4">
      <div>
        <Link
          href="/"
          className="inline-block px-4 py-2 bg-gray-700 text-white text-sm rounded hover:bg-gray-800"
        >
          ← Back to Home
        </Link>
      </div>
      <h1 className="text-xl font-bold">➕ Add New Problem</h1>

      {/* Mode selection */}
      <div className="flex gap-4">
        <button
          onClick={() => setMode('single')}
          className={`px-4 py-1 rounded ${mode === 'single' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-white'}`}
        >Single Mode</button>
        <button
          onClick={() => setMode('batch')}
          className={`px-4 py-1 rounded ${mode === 'batch' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-white'}`}
        >Batch Mode</button>
      </div>

      {/* Input problem ID */}
      <div>
        <label className="block font-semibold mb-1">Problem ID {mode === 'batch' && '(comma separated for multiple)'}</label>
        <div className="flex gap-2">
          <input
            type="text"
            className="w-full border p-2 rounded"
            value={ids}
            onChange={(e) => setIds(e.target.value)}
            placeholder={mode === 'batch' ? 'e.g. 1,2,3' : 'e.g. 1'}
          />
          <button
            onClick={handleFetch}
            className="px-3 py-2 bg-gray-300 rounded hover:bg-gray-400"
            disabled={loading}
          >{loading ? 'Loading...' : 'Get Problem Info'}</button>
        </div>
        {/* 📥 File upload */}
        {mode === 'batch' && (
          <div className="mt-2">
            <input type="file" accept=".csv" onChange={handleFileUpload} />
            <p className="text-xs text-gray-500 mt-1">Supports CSV files (problem ID in first column)</p>
          </div>
        )}
      </div>

      {/* Display problems */}
      {problems.length > 0 && (
        <div className="space-y-4">
          {problems.map((p, index) => (
            <div key={index} className="border rounded p-4 bg-gray-50 space-y-1">
              {p.error ? (
                <p className="text-red-500">❌ #{p.id} Failed to find problem</p>
              ) : (
                <>
                  <p className="font-semibold text-green-700">📌 #{p.id} {p.title} ({p.difficulty})</p>
                  <p>🏷️ Tags: {p.tags?.join(', ')}</p>
                  <p>🔗 <a href={p.link} target="_blank" className="text-blue-600 underline">{p.link}</a></p>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Problem notes */}
      {problems.length > 0 && (
        <div>
          <label className="block font-semibold mb-1 mt-2">📝 Notes (optional, shared for all problems)</label>
          <textarea
            className="w-full border rounded p-2 h-24"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add solution approach or key insights"
          />
        </div>
      )}

      {/* Submit button */}
      {problems.length > 0 && (
        <button
          onClick={handleSubmit}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >✅ Add {problems.filter(p => !p.error).length} Problems</button>
      )}

      {message && <p className="mt-4 font-semibold text-sm">{message}</p>}
    </main>
  )
}
