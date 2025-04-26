'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'

export default function ProblemSetDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const [set, setSet] = useState(null)
  const [problems, setProblems] = useState([])
  const [newId, setNewId] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [addingProblem, setAddingProblem] = useState(false)
  const [previewProblem, setPreviewProblem] = useState(null)
  const [searching, setSearching] = useState(false)
  const [showMultiSelect, setShowMultiSelect] = useState(false)
  const [allProblems, setAllProblems] = useState([])
  const [loadingAllProblems, setLoadingAllProblems] = useState(false)
  const [selectedProblems, setSelectedProblems] = useState([])
  const [batchAdding, setBatchAdding] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterDifficulty, setFilterDifficulty] = useState('All')

  useEffect(() => {
    if (!id) return
    fetchSetDetails()
  }, [id])

  const fetchSetDetails = async () => {
    try {
      const res = await fetch(`/api/sets/${id}`)
      const data = await res.json()
      if (res.ok) {
        setSet(data)
        if (data.fullProblems && Array.isArray(data.fullProblems)) {
          setProblems(data.fullProblems)
        } else if (data.problems && Array.isArray(data.problems)) {
          setProblems(Array.isArray(data.problems) ? data.problems : [])
        } else {
          setProblems([])
        }
      } else {
        setMessage('Failed to load problem set')
      }
    } catch (err) {
      console.error('Failed to load set:', err)
      setMessage('Network error loading problem set')
    } finally {
      setLoading(false)
    }
  }

  const fetchAllProblems = async () => {
    setLoadingAllProblems(true)
    try {
      const res = await fetch('/api/problems')
      if (res.ok) {
        const data = await res.json()
        setAllProblems(data)
      } else {
        setMessage('Failed to load problems')
      }
    } catch (err) {
      console.error('Failed to load problems:', err)
      setMessage('Network error loading problems')
    } finally {
      setLoadingAllProblems(false)
    }
  }

  const handleShowMultiSelect = () => {
    setShowMultiSelect(true)
    fetchAllProblems()
    setSelectedProblems([])
  }

  const calculateCompletionRate = () => {
    if (!set || !set.solved_problems || !problems.length) return 0
    const solved = Array.isArray(set.solved_problems)
      ? set.solved_problems
      : JSON.parse(set.solved_problems || '[]')
    return Math.round((solved.length / problems.length) * 100)
  }
  
  const completionRate = calculateCompletionRate()
  
  // 获取饼图数据
  const getChartData = () => {
    if (!set || !problems.length) return []
    
    const solved = Array.isArray(set.solved_problems)
      ? set.solved_problems
      : JSON.parse(set.solved_problems || '[]')
    
    const solvedCount = solved.length
    const totalCount = problems.length
    const remainingCount = totalCount - solvedCount
    
    return [
      { name: 'Completed', value: solvedCount },
      { name: 'Unsolved', value: remainingCount }
    ]
  }
  
  // 饼图颜色 - 使用有质感的渐变色
  const COLORS = ['#4285F4', '#DFE1E5']
  
  // 自定义提示信息
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 rounded shadow-lg text-sm border border-gray-100">
          <p className="font-medium">{payload[0].name}: {payload[0].value} 题</p>
        </div>
      )
    }
    return null
  }

  const handleProblemSelect = (problemId) => {
    setSelectedProblems(prev => {
      if (prev.includes(problemId)) {
        return prev.filter(id => id !== problemId)
      } else {
        return [...prev, problemId]
      }
    })
  }

  const handleBatchAdd = async () => {
    if (selectedProblems.length === 0) {
      setMessage('Please select at least one problem')
      return
    }

    setBatchAdding(true)
    setMessage('')
    
    try {
      const problemIdsToAdd = selectedProblems.filter(
        id => !problems.some(p => p.id === id)
      )

      if (problemIdsToAdd.length === 0) {
        setMessage('All selected problems are already in the set')
        setBatchAdding(false)
        return
      }

      let addedCount = 0
      let failedIds = []

      for (const problemId of problemIdsToAdd) {
        try {
          const res = await fetch(`/api/sets/${id}/add`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ problemId })
          })
          
          if (res.ok) {
            addedCount++
          } else {
            const error = await res.json()
            console.error(`Failed to add problem ${problemId}:`, error)
            failedIds.push(problemId)
          }
        } catch (err) {
          console.error(`Error adding problem ${problemId}:`, err)
          failedIds.push(problemId)
        }
      }

      await fetchSetDetails()
      
      if (failedIds.length > 0) {
        setMessage(`✅ Added ${addedCount} problems. Failed to add problems: ${failedIds.join(', ')}`)
      } else {
        setMessage(`✅ Added ${addedCount} problems to the set`)
      }
      
      setShowMultiSelect(false)
    } catch (error) {
      console.error('Failed to add problems:', error)
      setMessage('Error adding problems: ' + (error.message || 'Unknown error'))
    } finally {
      setBatchAdding(false)
    }
  }

  const filteredProblems = allProblems.filter(problem => {
    const isNotInSet = !problems.some(p => p.id === problem.id)
    
    const matchesSearch = 
      problem.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      problem.id.toString().includes(searchTerm)
    
    const matchesDifficulty = 
      filterDifficulty === 'All' || 
      problem.difficulty === filterDifficulty
    
    return isNotInSet && matchesSearch && matchesDifficulty
  })

  const handleRemove = async (problemId) => {
    if (!confirm('Remove this problem from set?')) return
    
    try {
      const res = await fetch(`/api/sets/${id}/remove`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ problemId })
      })
      
      if (res.ok) {
        setProblems((prev) => prev.filter((p) => p.id !== problemId))
        setMessage('✅ Problem removed from set')
      } else {
        setMessage('Failed to remove problem')
      }
    } catch (error) {
      setMessage('Network error removing problem')
    }
  }

  const handleDeleteSet = async () => {
    if (!confirm('Are you sure you want to delete this entire problem set? This action cannot be undone.')) 
      return
    
    try {
      const res = await fetch(`/api/sets?id=${id}`, { method: 'DELETE' })
      if (res.ok) {
        router.push('/problemset')
      } else {
        setMessage('Failed to delete problem set')
      }
    } catch (error) {
      setMessage('Network error deleting problem set')
    }
  }

  const getDifficultyClass = (difficulty) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-100 text-green-800 border border-green-300';
      case 'Medium': return 'bg-amber-100 text-amber-800 border border-amber-300';
      case 'Hard': return 'bg-red-100 text-red-800 border border-red-300';
      default: return 'bg-gray-100 text-gray-800 border border-gray-300';
    }
  }

  if (loading) return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-1/3"></div>
        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
        <div className="h-32 bg-gray-200 rounded"></div>
      </div>
    </div>
  )

  if (!set) return (
    <div className="p-6 max-w-3xl mx-auto">
      <p className="text-red-600">Problem set not found</p>
      <Link href="/problemset" className="text-blue-600 hover:underline mt-2 inline-block">
        Return to problem sets
      </Link>
    </div>
  )

  return (
    <main className="p-6 max-w-3xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">🗂️ {set.name}</h1>
        <Link
          href="/problemset"
          className="px-4 py-2 bg-gray-700 text-white text-sm rounded hover:bg-gray-800"
        >
          ← Back to Sets
        </Link>
      </div>

      <p className="text-sm text-gray-500">
        🕒 Created at: {new Date(set.createdAt).toLocaleString('en-US', { hour12: false })}
      </p>

      <div className="glass-card p-4 rounded-lg border shadow-sm prose prose-sm prose-blue max-w-none">
        <ReactMarkdown>{set.description || '_No description_'}</ReactMarkdown>
      </div>
      
      <div className="glass-card p-4 rounded-lg border shadow-sm bg-white">
        <h2 className="font-semibold text-lg mb-4 text-center">Set Completion Rate</h2>
        
        <div className="flex flex-col items-center gap-6">
          <div className="h-64 w-64 relative flex justify-center">
            <div className="absolute inset-0 flex flex-col items-center justify-center z-10 pointer-events-none">
              <div className="text-4xl font-bold">{completionRate}%</div>
              <div className="text-sm text-gray-500 mt-1">Completion</div>
            </div>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <Pie
                  data={getChartData()}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={90}
                  innerRadius={70}
                  fill="#8884d8"
                  dataKey="value"
                  paddingAngle={2}
                  animationDuration={800}
                  startAngle={90}
                  endAngle={-270}
                >
                  {getChartData().map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={COLORS[index]} 
                      stroke="none"
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  layout="horizontal" 
                  verticalAlign="bottom" 
                  align="center"
                  formatter={(value) => <span className="text-sm font-medium">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          {/* 统计信息 - 放在下方并居中 */}
          <div className="w-full max-w-md">
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-blue-50 rounded p-3 flex flex-col items-center justify-center">
                <span className="text-blue-600 text-sm">Total Problems</span>
                <span className="font-bold text-blue-600 text-lg">{problems.length}</span>
              </div>
              
              <div className="bg-green-50 rounded p-3 flex flex-col items-center justify-center">
                <span className="text-green-600 text-sm">Solved</span>
                <span className="font-bold text-green-600 text-lg">
                  {Array.isArray(set.solved_problems) 
                    ? set.solved_problems.length 
                    : JSON.parse(set.solved_problems || '[]').length}
                </span>
              </div>
              
              <div className="bg-gray-50 rounded p-3 flex flex-col items-center justify-center">
                <span className="text-gray-600 text-sm">Unsolved</span>
                <span className="font-bold text-gray-600 text-lg">
                  {problems.length - (Array.isArray(set.solved_problems) 
                    ? set.solved_problems.length 
                    : JSON.parse(set.solved_problems || '[]').length)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {message && (
        <div className={`glass-card border rounded-lg p-3 text-sm ${
          message.includes('✅') 
            ? 'bg-green-50 text-green-700 border-green-200 font-medium' 
            : 'bg-red-50 text-red-600 border-red-200'
        }`}>
          {message}
        </div>
      )}

      <div className="glass-card p-5 rounded-lg border shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-medium text-lg">📋 Problems in this set</h2>
          <button 
            onClick={handleShowMultiSelect}
            className="text-sm bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700"
          >
            ➕ Add Multiple Problems
          </button>
        </div>
        
        {problems.length === 0 ? (
          <p className="text-sm text-gray-500 my-4">No problems added yet.</p>
        ) : (
          <ul className="divide-y">
            {problems.map((p) => (
              <li key={typeof p === 'object' ? p.id : p} className="py-3 flex justify-between items-center">
                <div>
                  {typeof p === 'object' && p.title ? (
                    <Link href={`/problem/${p.id}`} className="text-blue-600 hover:underline font-medium">
                      #{p.id} {p.title}
                    </Link>
                  ) : (
                    <span className="text-gray-700">#{typeof p === 'object' ? p.id : p}</span>
                  )}
                  {typeof p === 'object' && p.difficulty && (
                    <span className={`ml-2 text-xs px-2 py-1 rounded-full ${getDifficultyClass(p.difficulty)}`}>
                      {p.difficulty}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => handleRemove(typeof p === 'object' ? p.id : p)}
                  className="text-xs text-red-600 hover:bg-red-50 px-2 py-1 rounded"
                >
                  🗑️ Remove
                </button>
              </li>
            ))}
          </ul>
        )}
        
        {showMultiSelect && (
          <div className="mt-6 border-t pt-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-medium">Select Problems to Add</h3>
              <button 
                onClick={() => setShowMultiSelect(false)}
                className="text-xs text-gray-500 hover:text-gray-700"
              >
                ✕ Close
              </button>
            </div>
            
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
            
            <div className="border rounded-lg overflow-hidden">
              {loadingAllProblems ? (
                <div className="p-4 text-center text-gray-500">Loading problems...</div>
              ) : filteredProblems.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  {allProblems.length === 0 
                    ? "No problems available" 
                    : "No matching problems found"}
                </div>
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
                        onChange={() => {}}
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
            
            <div className="mt-3 flex justify-between items-center">
              <div className="text-sm text-gray-600">
                {selectedProblems.length} problem(s) selected
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => setShowMultiSelect(false)}
                  className="px-3 py-1.5 bg-gray-200 text-gray-700 text-sm rounded hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBatchAdd}
                  disabled={batchAdding || selectedProblems.length === 0}
                  className="px-3 py-1.5 bg-green-600 text-white text-sm rounded hover:bg-green-700 disabled:opacity-50"
                >
                  {batchAdding ? 'Adding...' : 'Add Selected Problems'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-4 mt-6">
        <Link
          href={`/problemset/${id}/edit`}
          className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
        >
          ✏️ Edit Set
        </Link>
        <button
          onClick={handleDeleteSet}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          🗑️ Delete Set
        </button>
      </div>
    </main>
  )
}
