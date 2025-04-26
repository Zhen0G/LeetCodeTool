'use client'

export default function ResetButton() {
  const handleClick = async () => {
    const confirmed = confirm('Are you sure to reset the database? This action will clear all data')
    if (!confirmed) return

    const res = await fetch('/api/init', { method: 'POST' })
    const result = await res.json()
    alert(result.message || result.error)
  }

  return (
    <button
      onClick={handleClick}
      className="px-3 py-2 text-sm rounded-md bg-red-600 hover:bg-red-700 text-white"
    >
      ⚙ Reset to default
    </button>
  )
}
