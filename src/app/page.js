'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import CalendarHeatmap from 'react-calendar-heatmap'
import 'react-calendar-heatmap/dist/styles.css'
import { subDays } from 'date-fns'
import { Tooltip as ReactTooltip } from 'react-tooltip'
import React from 'react'
import { useProblemStatsStore } from '../store/problemStatsStore'


export default function Home() {
  // Define state variables for storing problem list
  const [problems, setProblems] = useState([])
  // Define statistics: today's solved problems, total passed problems, and total problems
  const { stats, setStats, resetTodayIfNeeded } = useProblemStatsStore()

  // Define filters: keyword, difficulty, and favorite only
  const [filters, setFilters] = useState({
    keyword: '',
    difficulty: '',
    favoriteOnly: false
  })
  // Store all tags
  const [allTags, setAllTags] = useState([])
  // Store selected tags
  const [selectedTags, setSelectedTags] = useState([])
  // Sort method: by ID, attempts, or latest attempt time
  const [sortKey, setSortKey] = useState('id')

  /**
   * Handle deleting a problem
   * @param {number} id - ID of the problem to delete
   * @returns {Promise<void>}
   */
  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this problem?')) return
    const res = await fetch(`/api/problems/${id}`, { method: 'DELETE' })
    if (res.ok) {
      // If successful, remove the problem from the list
      setProblems(prev => prev.filter(p => p.id !== id))
    } else {
      alert('Delete failed')
    }
  }

  /**
   * Toggle favorite status of a problem
   * @param {number} id - ID of the problem to toggle favorite status
   * @returns {Promise<void>}
   */
  const toggleFavorite = async (id) => {
    // Update favorite status in local state
    const updated = problems.map(p => {
      if (p.id === id) {
        return { ...p, favorite: !p.favorite }
      }
      return p
    })
    setProblems(updated)

    // Find the updated problem
    const target = updated.find(p => p.id === id)
    // Send request to server to update favorite status
    await fetch(`/api/problems/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ favorite: target.favorite })
    })
  }

  /**
   * Fetch all problems when component loads
   */
  useEffect(() => {
    resetTodayIfNeeded() // 判断是否需要清空今日计数
    fetch('/api/problems')
      .then(res => res.json())
      .then(data => {
        setProblems(data)
        computeStats(data)
        // 提取标签
        const tagsSet = new Set()
        data.forEach(p => p.tags?.forEach(tag => tagsSet.add(tag)))
        setAllTags([...tagsSet])
      })
      .catch(err => console.error('Failed to fetch problems:', err))
  }, [])

  /**
   * Calculate statistics: number of problems solved today and total passed problems
   * @param {Array} data - Problem data array
   */
  const computeStats = (data) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
  
    let todaySolved = 0
    let totalPassed = 0
  
    data.forEach(p => {
      // ✅ 判断历史中是否曾经 Solved
      if (Array.isArray(p.history)) {
        const hasSolved = p.history.some(h => h.status === 'Solved')
        if (hasSolved) totalPassed++
  
        const todaySolves = p.history.filter(h =>
          new Date(h.date) >= today && h.status === 'Solved'
        )
        todaySolved += todaySolves.length
      }
    })
  
    const todayStr = new Date().toISOString().slice(0, 10)
    setStats({ todaySolved, totalPassed, total: data.length, lastUpdatedDate: todayStr })
  }
  
  
  

  /**
   * Filter problems by filter conditions and sort them
   * Filter conditions include: keyword, difficulty, favorite status, and tags
   */
  const filtered = problems.filter(p => {
    const kw = filters.keyword.trim().toLowerCase()
    // Match keyword (title, tags, or ID)
    const matchKeyword = kw === '' || p.title.toLowerCase().includes(kw) || p.tags?.some(tag => tag.toLowerCase().includes(kw)) || String(p.id).includes(kw)
    // Match difficulty
    const matchDifficulty = filters.difficulty === '' || p.difficulty === filters.difficulty
    // Match favorite status
    const matchFavorite = !filters.favoriteOnly || p.favorite === true
    // Match selected tags
    const matchTags = selectedTags.length === 0 || selectedTags.some(tag => p.tags?.includes(tag))
    return matchKeyword && matchDifficulty && matchFavorite && matchTags
  }).sort((a, b) => {
    // Sort by different keys
    if (sortKey === 'id') return a.id - b.id
    if (sortKey === 'tried') return (b.status?.stats?.tried || 0) - (a.status?.stats?.tried || 0)
    if (sortKey === 'latest') {
      const aDate = new Date(a.history?.[a.history.length - 1]?.date || 0)
      const bDate = new Date(b.history?.[b.history.length - 1]?.date || 0)
      return bDate - aDate
    }
    return 0
  })

  /**
   * Get heatmap data
   * @returns {Array} Array containing date and number of problems completed
   */
  const getHeatmapData = () => {
    const dateMap = {}
    // Iterate through history records of all problems
    problems.forEach(p => {
      p.history?.forEach(h => {
        const dateStr = h.date.slice(0, 10)
        // Add up number of problems completed each day
        dateMap[dateStr] = (dateMap[dateStr] || 0) + 1
      })
    })
    // Convert to the data format required by the heatmap
    return Object.entries(dateMap).map(([date, count]) => ({ date, count }))
  }

  // Get CSS class for specified difficulty
  const getDifficultyClass = (difficulty) => {
    switch (difficulty) {
      case 'Easy': return 'text-green-500 font-medium';
      case 'Medium': return 'text-amber-500 font-medium';
      case 'Hard': return 'text-red-500 font-medium';
      default: return '';
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-center mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          LeetCode Problem Tracker
        </h1>
        <p className="text-center text-gray-500 dark:text-gray-400 mb-8">
          Record and analyze your coding journey to improve efficiency
        </p>
      
        {/* Combined Stats and Heatmap */}
        <div className="glass-card p-5 mb-8 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
            <div className="col-span-3 lg:col-span-1">
              <h2 className="text-lg font-bold mb-4 text-center lg:text-left">📊 Problem Statistics</h2>
              <div className="grid grid-cols-3 lg:grid-cols-1 gap-4">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg shadow-sm flex flex-col items-center lg:flex-row lg:items-start lg:gap-3">
                  <div className="text-4xl mb-1 lg:mb-0">📅</div>
                  <div>
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.todaySolved}</div>
                    <div className="text-gray-500 text-sm">Today's Problems</div>
                  </div>
                </div>
                
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg shadow-sm flex flex-col items-center lg:flex-row lg:items-start lg:gap-3">
                  <div className="text-4xl mb-1 lg:mb-0">✅</div>
                  <div>
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.totalPassed}</div>
                    <div className="text-gray-500 text-sm">Total Solved</div>
                  </div>
                </div>
                
                <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg shadow-sm flex flex-col items-center lg:flex-row lg:items-start lg:gap-3">
                  <div className="text-4xl mb-1 lg:mb-0">📚</div>
                  <div>
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.total}</div>
                    <div className="text-gray-500 text-sm">Total Problems</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="col-span-3 lg:col-span-2 mt-2 lg:mt-0">
              <h2 className="text-lg font-bold mb-4 text-center lg:text-left">📈 Activity Heatmap</h2>
              <div className="overflow-x-auto">
                <div className="min-w-[650px] max-w-full mx-auto scale-100 origin-top">
                  <CalendarHeatmap
                    startDate={subDays(new Date(), 180)}
                    endDate={new Date()}
                    values={getHeatmapData()}
                    classForValue={v => {
                      if (!v) return 'color-empty'
                      if (v.count >= 5) return 'color-github-4'
                      if (v.count >= 3) return 'color-github-3'
                      if (v.count >= 1) return 'color-github-2'
                      return 'color-github-1'
                    }}
                    showWeekdayLabels
                    horizontal={true}
                    gutterSize={2}
                    transformDayElement={(element, value, index) => {
                      return React.cloneElement(element, {
                        rx: 2, // rounded corners
                        ry: 2
                      });
                    }}
                    titleForValue={v => v?.date ? `${v.date}: ${v.count} problems` : 'No records'}
                    tooltipDataAttrs={v => v?.date ? {
                      'data-tooltip-id': 'heatmap-tooltip',
                      'data-tooltip-content': `${v.date}: ${v.count} problems`
                    } : {}}
                  />
                  <ReactTooltip id="heatmap-tooltip" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          <Link
            href="/add"
            className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700 shadow"
          >
            ➕ Import Problems
          </Link>
          <Link
            href="/problemset"
            className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 shadow"
          >
            🧩 Problem Set Management
          </Link>
          <Link
            href="/practice"
            className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 shadow"
          >
            🎲 Random Practice
          </Link>
          <Link
            href="/notes"
            className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-purple-600 text-white font-medium hover:bg-purple-700 shadow"
          >
            📝 View Knowledge Base
          </Link>
        </div>
      </div>

      {/* Filter area */}
      <div className="glass-card p-6 mb-8">
        <h2 className="text-lg font-bold mb-4">🔍 Filter Problems</h2>
        
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Keyword</label>
              <input 
                type="text" 
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800" 
                value={filters.keyword} 
                onChange={e => setFilters({ ...filters, keyword: e.target.value })} 
                placeholder="Search title/tags/ID" 
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Sort By</label>
              <select 
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800" 
                value={sortKey} 
                onChange={e => setSortKey(e.target.value)}
              >
                <option value="id">Problem ID</option>
                <option value="latest">Latest Attempt</option>
                <option value="tried">Attempts Count</option>
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Difficulty</label>
            <div className="flex flex-wrap gap-2">
              {['Easy', 'Medium', 'Hard'].map(d => (
                <button 
                  key={d} 
                  onClick={() => setFilters({ ...filters, difficulty: filters.difficulty === d ? '' : d })} 
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${filters.difficulty === d 
                    ? d === 'Easy' ? 'bg-green-100 text-green-800 border border-green-300' 
                    : d === 'Medium' ? 'bg-amber-100 text-amber-800 border border-amber-300' 
                    : 'bg-red-100 text-red-800 border border-red-300'
                    : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex items-center">
            <input 
              type="checkbox" 
              id="favorite-only" 
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" 
              checked={filters.favoriteOnly} 
              onChange={e => setFilters({ ...filters, favoriteOnly: e.target.checked })} 
            />
            <label htmlFor="favorite-only" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
              Show favorites only ⭐️
            </label>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Filter by Tags</label>
            <div className="flex flex-wrap gap-2 mt-1">
              {allTags.map(tag => (
                <button 
                  key={tag} 
                  onClick={() => setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag])} 
                  className={`px-2 py-1 text-xs rounded-full transition-colors ${
                    selectedTags.includes(tag) 
                      ? 'bg-blue-100 text-blue-800 border border-blue-300 dark:bg-blue-900 dark:text-blue-200' 
                      : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Problem table */}
      <div className="glass-card overflow-hidden mb-8">
        <h2 className="text-xl font-bold p-4 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          📋 Problem List ({filtered.length})
        </h2>
        
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-xs uppercase">
              <tr>
                <th className="px-4 py-3 text-left">ID</th>
                <th className="px-4 py-3 text-left">Title</th>
                <th className="px-4 py-3 text-left">Tags</th>
                <th className="px-4 py-3 text-center">Difficulty</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-center">Favorite</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-4 py-8 text-center text-gray-500">
                    No matching problems found 😞
                  </td>
                </tr>
              ) : (
                filtered.map(p => (
                  <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap">{p.id}</td>
                    <td className="px-4 py-3">
                      <Link href={`/problem/${p.id}`} className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:underline font-medium">
                        {p.title}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {p.tags?.map(tag => (
                          <span key={tag} className="inline-block px-2 py-0.5 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={getDifficultyClass(p.difficulty)}>
                        {p.difficulty}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-xs text-gray-500 flex flex-col gap-1">
                        <div className="flex items-center">
                          <span className="inline-block w-3 h-3 bg-green-500 rounded-full mr-1"></span>
                          Solved: {p.status?.stats?.passed || 0}
                        </div>
                        <div className="flex items-center">
                          <span className="inline-block w-3 h-3 bg-amber-500 rounded-full mr-1"></span>
                          Partial: {p.status?.stats?.partial || 0}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        className="transition-transform hover:scale-125 focus:outline-none"
                        onClick={() => toggleFavorite(p.id)}
                      >
                        {p.favorite ? '⭐️' : '☆'}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="inline-flex justify-center items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
