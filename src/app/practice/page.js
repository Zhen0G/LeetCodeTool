'use client'

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { useProblemStatsStore } from '@/store/problemStatsStore'

export default function PracticePage() {
  const [sets, setSets] = useState([])
  const [selectedSet, setSelectedSet] = useState('all')
  const [count, setCount] = useState(5)
  const [problems, setProblems] = useState([])
  const [startTimes, setStartTimes] = useState({})
  const [completed, setCompleted] = useState({})
  const [syncedProblems, setSyncedProblems] = useState({})
  const [sessionStart, setSessionStart] = useState(null)
  const [paused, setPaused] = useState(false)
  const [pauseDuration, setPauseDuration] = useState(0)
  const [pauseStart, setPauseStart] = useState(null)
  const [individualPauseDurations, setIndividualPauseDurations] = useState({})
  const [now, setNow] = useState(Date.now())
  const intervalRef = useRef(null)

  const { markProblemSolvedToday, resetTodayIfNeeded } = useProblemStatsStore()


  useEffect(() => {
    fetch('/api/sets')
      .then(res => res.json())
      .then(data => setSets(data))
  }, [])

  useEffect(() => {
    if (!paused) {
      intervalRef.current = setInterval(() => {
        setNow(Date.now())
      }, 1000)
    } else {
      clearInterval(intervalRef.current)
    }
    return () => clearInterval(intervalRef.current)
  }, [paused])

  const handleStart = async () => {
    const url = selectedSet === 'all'
      ? `/api/practice/random?count=${count}`
      : `/api/practice/random?count=${count}&set=${selectedSet}`

    const res = await fetch(url)
    const data = await res.json()
    const now = Date.now()
    setProblems(data)
    setSessionStart(now)
    setStartTimes({})
    setCompleted({})
    setSyncedProblems({})
    setPaused(false)
    setPauseDuration(0)
    setIndividualPauseDurations({})
    setPauseStart(null)
    setNow(now)
  }

  const handlePauseResume = () => {
    const nowTime = Date.now()
    setNow(nowTime)
    if (!paused) {
      setPaused(true)
      setPauseStart(nowTime)
    } else {
      const additional = nowTime - pauseStart
      setPauseDuration(prev => prev + additional)
      setIndividualPauseDurations(prev => {
        const updates = { ...prev }
        for (const id in startTimes) {
          updates[id] = (updates[id] || 0) + additional
        }
        return updates
      })
      setPaused(false)
      setPauseStart(null)
    }
  }

  const handleExit = () => {
    if (confirm('Are you sure you want to exit this practice session?')) {
      setProblems([])
      setCompleted({})
      setStartTimes({})
      setSessionStart(null)
      setPaused(false)
      setPauseDuration(0)
      setPauseStart(null)
      setIndividualPauseDurations({})
      setSyncedProblems({})
    }
  }

  const syncToProblemHistory = async (id, time, status) => {
    await fetch(`/api/problems/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ duration: time, status })
    })
  }

  const handleStatusChange = (id, status) => {
    if (!completed[id]?.time) return alert('⏳ Please finish solving this problem first.')
  
    setCompleted(prev => ({
      ...prev,
      [id]: { ...prev[id], status }
    }))
  }
  
  const handleSubmit = async () => {
    const unsubmitted = problems.filter(p => !completed[p.id]?.status || !completed[p.id]?.time)
    if (unsubmitted.length > 0) {
      return alert(`⚠️ You have ${unsubmitted.length} uncompleted problems.`)
    }
  
    let success = 0
    for (const p of problems) {
      const entry = completed[p.id]
      try {
        const res = await fetch(`/api/problems/${p.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            status: entry.status,
            duration: entry.time
          })
        })
        if (res.ok) {
          success++
          if (entry.status === 'Solved') {
            markProblemSolvedToday(p.id)
          }
        }
      } catch (err) {
        console.error(`❌ Failed to sync problem #${p.id}`, err)
      }
    }
  
    alert(`✅ ${success} problems submitted successfully.`)
    handleExit()
  }

  const formatTime = (ms) => {
    const minutes = Math.floor(ms / 60000)
    const seconds = Math.floor((ms % 60000) / 1000)
    return `${minutes}m ${seconds}s`
  }

  const completedCount = Object.values(completed).filter(c => c.status).length
  const progress = problems.length > 0 ? Math.floor((completedCount / problems.length) * 100) : 0

  return (
    <main className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">🎯 Random Practice</h1>
        <Link href="/" className="text-sm bg-gray-700 px-3 py-1 rounded hover:bg-gray-800">
          ← Back to Home
        </Link>
      </div>

      <div className="space-y-3">
        <label className="block">
          Choose Problem Set:
          <select
            value={selectedSet}
            onChange={(e) => setSelectedSet(e.target.value)}
            className="border p-2 rounded w-full mt-1"
          >
            <option value="all">📚 All Problems</option>
            {sets.map(set => (
              <option key={set.id} value={set.id}>{set.name}</option>
            ))}
          </select>
        </label>

        <label className="block">
          Number of Problems:
          <input
            type="number"
            value={count}
            onChange={(e) => setCount(e.target.value)}
            className="border p-2 rounded w-24 mt-1"
          />
        </label>

        <button
          onClick={handleStart}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          🚀 Start Practice
        </button>
      </div>

      {problems.length > 0 && (
        <div className="mt-6 space-y-4">
          <div className="w-full bg-gray-200 h-4 rounded">
            <div className="h-4 bg-green-500 rounded" style={{ width: `${progress}%` }}></div>
          </div>
          <div className="flex gap-4 items-center">
            <span className="text-sm text-gray-700">Progress: {completedCount}/{problems.length}</span>
            <span className="text-sm text-gray-700">⏱ Total Time: {formatTime(now - sessionStart - pauseDuration)}</span>
            <button
              onClick={handlePauseResume}
              className={`px-3 py-1 text-sm rounded text-white ${paused ? 'bg-green-600' : 'bg-red-600'}`}
            >
              {paused ? '▶️ Resume' : '⏸ Pause'}
            </button>
            <button
              onClick={handleSubmit}
              className="px-3 py-1 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700"
            >
              ✅ Submit Practice
            </button>
            <button
              onClick={handleExit}
              className="px-3 py-1 text-sm bg-gray-400 text-white rounded hover:bg-gray-500"
            >
              ✖ Exit
            </button>
          </div>
        </div>
      )}

      <div className="grid gap-4 mt-6">
        {problems.map(p => {
          const started = startTimes[p.id] != null
          const completedItem = completed[p.id]
          const timeSpent = started ? now - startTimes[p.id] - (individualPauseDurations[p.id] || 0) : 0

          return (
            <div key={p.id} className="border p-4 rounded bg-white shadow-sm space-y-2">
              <div className="flex justify-between">
                <h2 className="font-semibold">
                  <Link href={`/problem/${p.id}`} className="text-blue-700 hover:underline">
                    #{p.id} {p.title}
                  </Link>
                </h2>
                <span className="text-sm text-gray-600">{p.difficulty}</span>
              </div>
              <p className="text-xs text-gray-500">Tags: {p.tags?.join(', ')}</p>
              <Link href={p.link} target="_blank" className="text-blue-500 text-xs hover:underline">
                🔗 LeetCode Link
              </Link>
              {!started && (
                <button
                  onClick={() => {
                    const slug = p.slug || p.title.replace(/\s+/g, '-').toLowerCase()
                    window.open(`https://leetcode.com/problems/${slug}/`, '_blank')
                    setStartTimes(prev => ({ ...prev, [p.id]: Date.now() }))
                  }}
                  className="px-3 py-1 bg-blue-600 text-white rounded text-sm"
                >
                  🚀 Start Solving
                </button>
              )}
              {started && !completedItem && (
                <button
                  onClick={() => {
                    const spent = Math.floor((Date.now() - startTimes[p.id] - (individualPauseDurations[p.id] || 0)) / 1000)
                    setCompleted(prev => ({
                      ...prev,
                      [p.id]: { time: spent }
                    }))
                  }}
                  className="px-3 py-1 bg-green-600 text-white rounded text-sm"
                >
                  ✅ Finish & Record Time
                </button>
              )}
              {completedItem && (
                <div className="flex flex-wrap gap-2 items-center text-sm">
                  <span className="text-gray-600">⏱ {formatTime(completedItem.time * 1000)}</span>
                  <select
                    value={completedItem.status || ''}
                    onChange={(e) => handleStatusChange(p.id, e.target.value)}
                    className="border rounded p-1 text-sm"
                  >
                    <option value="">Select Status</option>
                    <option value="Solved">✅ Solved</option>
                    <option value="Partially Solved">🟡 Partially Solved</option>
                    <option value="Unsolved">❌ Unsolved</option>
                  </select>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </main>
  )
}
