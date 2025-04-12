// src/app/problemset/[id]/edit/page.js

'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import Link from 'next/link'

const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false })

export default function EditProblemSetPage() {
  const { id } = useParams()
  const router = useRouter()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [originalData, setOriginalData] = useState(null)

  useEffect(() => {
    if (!id) return
    fetchProblemSet()
  }, [id])

  const fetchProblemSet = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/sets/${id}`)
      const data = await res.json()
      if (res.ok) {
        setName(data.name)
        setDescription(data.description || '')
        setOriginalData(data)
      } else {
        setError(data.error || 'Problem set not found')
      }
    } catch (err) {
      setError('Failed to fetch set data')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!name.trim()) {
      setError('Set name cannot be empty')
      return
    }
    
    setSaving(true)
    setError('')
    
    try {
      const res = await fetch(`/api/sets/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description })
      })
      
      if (res.ok) {
        router.push(`/problemset/${id}`)
      } else {
        const data = await res.json()
        setError(data?.error || 'Failed to update problem set')
        setSaving(false)
      }
    } catch (err) {
      setError('Network error while saving changes')
      setSaving(false)
    }
  }

  const handleCancel = () => {
    if (
      name !== originalData?.name || 
      description !== originalData?.description
    ) {
      if (confirm('You have unsaved changes. Are you sure you want to leave this page?')) {
        router.push(`/problemset/${id}`)
      }
    } else {
      router.push(`/problemset/${id}`)
    }
  }

  if (loading) return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="glass-card animate-pulse space-y-4 p-5 rounded-lg shadow-sm">
        <div className="h-8 bg-gray-200 rounded w-1/2"></div>
        <div className="h-40 bg-gray-200 rounded"></div>
      </div>
    </div>
  )

  return (
    <main className="p-6 max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">✏️ Edit Problem Set</h1>
        <Link
          href={`/problemset/${id}`}
          className="text-sm bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-800"
        >
          ← Back to Set
        </Link>
      </div>

      {error && (
        <div className="glass-card bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="glass-card space-y-6 p-6 rounded-lg shadow-sm border">
        <div>
          <label className="block font-medium mb-2">Set Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full border p-3 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            placeholder="Enter problem set name"
          />
        </div>

        <div>
          <label className="block font-medium mb-2">Description (Markdown supported)</label>
          <div className="bg-white border rounded">
            <MDEditor 
              value={description} 
              onChange={setDescription} 
              height={300}
              preview="edit"
            />
          </div>
          <p className="mt-1 text-sm text-gray-500">Use Markdown to format your description and add links.</p>
        </div>

        <div className="flex gap-4 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition disabled:opacity-50"
          >
            {saving ? 'Saving...' : '💾 Save Changes'}
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition"
          >
            Cancel
          </button>
        </div>
      </form>
    </main>
  )
}
