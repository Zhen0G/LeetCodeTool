// src/app/problemset/new/page.js

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import Link from 'next/link'

const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false })

export default function NewProblemSetPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [problems, setProblems] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedProblems, setSelectedProblems] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterDifficulty, setFilterDifficulty] = useState('All')

  // 获取所有题目
  useEffect(() => {
    const fetchProblems = async () => {
      try {
        const response = await fetch('/api/problems')
        if (response.ok) {
          const data = await response.json()
          setProblems(data)
        } else {
          console.error('Failed to fetch problems')
        }
      } catch (error) {
        console.error('Error fetching problems:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProblems()
  }, [])

  // 处理题目选择
  const handleProblemSelect = (problemId) => {
    setSelectedProblems(prev => {
      if (prev.includes(problemId)) {
        return prev.filter(id => id !== problemId)
      } else {
        return [...prev, problemId]
      }
    })
  }

  // 过滤题目列表
  const filteredProblems = problems.filter(problem => {
    const matchesSearch = 
      problem.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      problem.id.toString().includes(searchTerm)
    
    const matchesDifficulty = 
      filterDifficulty === 'All' || 
      problem.difficulty === filterDifficulty
    
    return matchesSearch && matchesDifficulty
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim()) {
      setError('Please enter a name for the problem set')
      return
    }
    
    setError('')
    setSaving(true)

    try {
      const res = await fetch('/api/sets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name, 
          description,
          problems: selectedProblems 
        })
      })

      if (res.ok) {
        const data = await res.json()
        router.push(`/problemset/${data._id}`)
      } else {
        const errorData = await res.json()
        setError(errorData?.error || '❌ Failed to create problem set.')
        setSaving(false)
      }
    } catch (err) {
      setError('❌ Network error. Please try again.')
      setSaving(false)
    }
  }

  // 获取题目难度对应的样式
  const getDifficultyClass = (difficulty) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-100 text-green-800 border border-green-300';
      case 'Medium': return 'bg-amber-100 text-amber-800 border border-amber-300';
      case 'Hard': return 'bg-red-100 text-red-800 border border-red-300';
      default: return 'bg-gray-100 text-gray-800 border border-gray-300';
    }
  }

  return (
    <main className="p-6 max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">🆕 New Problem Set</h1>
        <Link
          href="/problemset"
          className="text-sm bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-800"
        >
          ← Back to List
        </Link>
      </div>

      {error && (
        <div className="glass-card bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="glass-card space-y-6 p-6 rounded-lg shadow-sm border">
        <div>
          <label className="block font-medium mb-2">Set Name:</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border p-3 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            placeholder="Enter a descriptive name for this set"
            required
          />
        </div>

        <div>
          <label className="block font-medium mb-2">Description (Markdown):</label>
          <div className="bg-white rounded border">
            <MDEditor 
              value={description} 
              onChange={setDescription} 
              height={300}
              preview="edit"
            />
          </div>
          <p className="mt-1 text-sm text-gray-500">Use Markdown to format your description and add links.</p>
        </div>

        <div>
          <label className="block font-medium mb-2">Add Problems (Optional):</label>
          
          <div className="flex flex-wrap gap-3 mb-3">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search by ID or title"
                className="w-full border p-2 rounded"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <select
              className="border rounded p-2"
              value={filterDifficulty}
              onChange={(e) => setFilterDifficulty(e.target.value)}
            >
              <option value="All">All Difficulties</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>
          
          <div className="mt-2 border rounded-lg overflow-hidden">
            {loading ? (
              <div className="p-4 text-center text-gray-500">Loading problems...</div>
            ) : problems.length === 0 ? (
              <div className="p-4 text-center text-gray-500">No problems available</div>
            ) : (
              <div className="overflow-y-auto max-h-64 divide-y">
                {filteredProblems.map(problem => (
                  <div 
                    key={problem.id}
                    className={`p-3 flex items-center ${selectedProblems.includes(problem.id) ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
                    onClick={() => handleProblemSelect(problem.id)}
                  >
                    <input 
                      type="checkbox"
                      className="mr-3 h-4 w-4" 
                      checked={selectedProblems.includes(problem.id)}
                      onChange={() => {}} // 由于点击div已处理选择逻辑
                    />
                    <div className="flex-1">
                      <div className="flex items-center">
                        <span className="font-medium">#{problem.id} {problem.title}</span>
                        <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${getDifficultyClass(problem.difficulty)}`}>
                          {problem.difficulty}
                        </span>
                      </div>
                      {problem.tags && problem.tags.length > 0 && (
                        <div className="text-xs text-gray-500 mt-1">
                          {problem.tags.slice(0, 3).join(', ')}
                          {problem.tags.length > 3 && '...'}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="mt-2 text-sm text-gray-600">
            {selectedProblems.length} problem(s) selected
          </div>
        </div>

        <div className="flex gap-4 pt-2">
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition disabled:opacity-50"
            disabled={saving}
          >
            {saving ? 'Creating...' : '💾 Create Set'}
          </button>
          <button
            type="button"
            onClick={() => router.push('/problemset')}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition"
          >
            Cancel
          </button>
        </div>
      </form>
    </main>
  )
}
