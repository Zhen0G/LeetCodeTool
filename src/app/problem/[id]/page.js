'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useProblemStatsStore } from '@/store/problemStatsStore'
import Link from 'next/link'

export default function ProblemDetailPage() {
  const { id } = useParams()
  const router = useRouter()

  const [problem, setProblem] = useState(null)
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)
  const [time, setTime] = useState(0)
  const [timerRunning, setTimerRunning] = useState(false)
  const [hasStarted, setHasStarted] = useState(false)
  const [showNote, setShowNote] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState('')
  const [deleting, setDeleting] = useState(false)

  const { resetTodayIfNeeded, markProblemSolvedToday } = useProblemStatsStore()

  useEffect(() => {
    if (!id) return
    fetch(`/api/problems/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setProblem(data)
        setNote(data.note || '')
      })
  }, [id])

  useEffect(() => {
    resetTodayIfNeeded()
  }, [])

  useEffect(() => {
    let interval
    if (timerRunning) {
      interval = setInterval(() => setTime((t) => t + 1), 1000)
    } else {
      clearInterval(interval)
    }
    return () => clearInterval(interval)
  }, [timerRunning])

  const saveNote = async () => {
    setSaving(true)
    const res = await fetch(`/api/problems/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ note }),
    })
    const updated = await res.json()
    setProblem(updated)
    setSaving(false)
  }

  const updateStatus = async (status) => {
    console.log('🚧 updateStatus called with:', status)

    const res = await fetch(`/api/problems/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, duration: time })
    })

    const updated = await res.json()
    console.log('🧩 updated.status.last:', updated.status?.last)

    setProblem(updated)
    setSelectedStatus('')
    setTimerRunning(false)
    setTime(0)
    setHasStarted(false)

    if (updated.status?.last === 'Solved') {
      console.log('🎉 Marking problem solved today:', id)
      markProblemSolvedToday(Number(id))
    }
  }

  const startSolving = () => {
    if (confirm('Do you want to navigate to LeetCode and start the timer?')) {
      setHasStarted(true)
      setTimerRunning(true)
      window.open(problem.link, '_blank')
    }
  }

  const handleDelete = async () => {
    if (!confirm('⚠️ Are you sure you want to delete this problem and all its records?')) return
    setDeleting(true)
    const res = await fetch(`/api/problems/${id}`, { method: 'DELETE' })
    if (res.ok) {
      router.push('/')
    } else {
      alert('❌ Delete failed')
    }
    setDeleting(false)
  }

  if (!problem) return <div className="p-6">Loading...</div>

  return (
    <main className="p-6 max-w-3xl mx-auto space-y-4">
      <div className="mb-4 flex gap-4">
        <Link href="/" className="text-sm bg-gray-700 px-3 py-1 rounded hover:bg-gray-800">
          ← Back to Home
        </Link>
        <button
          onClick={handleDelete}
          className="px-4 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
          disabled={deleting}
        >
          {deleting ? 'Deleting...' : '🗑️ Delete Problem'}
        </button>
      </div>

      <h1 className="text-xl font-bold">
        #{problem.id} {problem.title}
      </h1>
      <p>🏷️ Tags: {problem.tags?.join(', ')}</p>
      <p>📊 Difficulty: {problem.difficulty}</p>
      <p>📌 Current Status: {problem.status?.last || 'Not Started'}, Attempted {problem.status?.stats?.tried || 0} times</p>

      {!hasStarted ? (
        <button
          onClick={startSolving}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          🚀 Start Solving
        </button>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-4 text-sm text-gray-700">
            ⏱️ Current Time: <strong>{Math.floor(time / 60)} min {time % 60} sec</strong>
            <button
              className={`px-3 py-1 text-xs rounded text-white ${timerRunning ? 'bg-red-500' : 'bg-green-500'}`}
              onClick={() => setTimerRunning(!timerRunning)}
            >
              {timerRunning ? '⏸ Pause' : '▶️ Resume'}
            </button>
          </div>

          <div className="flex gap-2">
            {['Not Started', 'Partially Solved', 'Solved'].map((status) => (
              <button
                key={status}
                className={`px-3 py-1 rounded text-white ${selectedStatus === status ? 'bg-blue-600' : 'bg-gray-500'}`}
                onClick={() => {
                  setSelectedStatus(status)
                  console.log('🟢 Selected status:', status)
                }}
              >
                {status}
              </button>
            ))}
          </div>

          {selectedStatus && (
            <button
              onClick={() => {
                console.log('🔁 Submitting status:', selectedStatus)
                if (confirm(`Are you sure you want to update the status to "${selectedStatus}"?`)) {
                  updateStatus(selectedStatus)
                }
              }}
              className="px-4 py-1 bg-green-600 text-white rounded hover:bg-green-700"
            >
              ✅ Submit Status
            </button>
          )}
        </div>
      )}

      {problem.history?.length > 0 && (
        <section className="mt-6">
          <h2 className="font-semibold mb-2">📜 Problem History:</h2>
          <ul className="space-y-2 text-sm">
            {[...problem.history]
              .sort((a, b) => new Date(b.date) - new Date(a.date))
              .map((record, index) => (
                <li
                  key={index}
                  className="border rounded p-2 bg-gray-50 flex justify-between items-center"
                >
                  <span>
                    {new Date(record.date).toLocaleString('en-US', {
                      hour12: false,
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                  <span className="flex gap-3 text-xs items-center">
                    <span
                      className={`px-2 py-1 rounded ${
                        record.status === 'Solved'
                          ? 'bg-green-200 text-green-800'
                          : record.status === 'Partially Solved'
                          ? 'bg-yellow-200 text-yellow-800'
                          : 'bg-gray-200 text-gray-800'
                      }`}
                    >
                      {record.status}
                    </span>
                    {record.duration != null && (
                      <span className="text-gray-500">
                        🕒 {Math.floor(record.duration / 60)}min {record.duration % 60}sec
                      </span>
                    )}
                  </span>
                </li>
              ))}
          </ul>
        </section>
      )}

      <div className="mt-6">
        <button
          onClick={() => setShowNote(!showNote)}
          className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 text-sm"
        >
          {showNote ? '🙈 Hide Notes' : '📝 Show Notes'}
        </button>

        {showNote && (
          <div className="mt-2">
            <textarea
              className="w-full border rounded p-2 h-32"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
            <button
              className="mt-2 px-4 py-1 bg-green-500 text-white rounded hover:bg-green-600"
              onClick={saveNote}
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Notes'}
            </button>
          </div>
        )}
      </div>
    </main>
  )
}
