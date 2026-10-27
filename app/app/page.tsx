'use client'

import { useEffect, useState, useCallback } from 'react'

interface Institute {
  id: number
  sno: number
  application_no: string
  permanent_id: string | null
  institute_name: string
}

export default function Home() {
  const [rows, setRows] = useState<Institute[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async (q: string, p: number) => {
    setLoading(true)
    const params = new URLSearchParams({ page: String(p), ...(q ? { search: q } : {}) })
    const res = await fetch(`/api/temp?${params}`)
    const data = await res.json()
    setRows(data.rows || [])
    setTotal(data.total || 0)
    setLoading(false)
  }, [])

  useEffect(() => { fetchData(query, page) }, [query, page, fetchData])

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    setPage(1)
    setQuery(search)
  }

  const totalPages = Math.ceil(total / 50)

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-1">Institute Database</h1>
        <p className="text-sm text-gray-500 mb-4">
          {total.toLocaleString()} institutes • Neon PostgreSQL
        </p>

        <form onSubmit={handleSearch} className="flex gap-2 mb-4">
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by institute name, application no, or permanent ID..."
            className="flex-1 border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700">
            Search
          </button>
          {query && (
            <button type="button" onClick={() => { setSearch(''); setQuery(''); setPage(1) }}
              className="text-sm text-gray-500 hover:text-gray-800 px-2">
              Clear
            </button>
          )}
        </form>

        <div className="bg-white border rounded overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 text-left">
              <tr>
                <th className="px-4 py-2 font-medium text-gray-600 w-12">S.No</th>
                <th className="px-4 py-2 font-medium text-gray-600">Application No</th>
                <th className="px-4 py-2 font-medium text-gray-600">Permanent ID</th>
                <th className="px-4 py-2 font-medium text-gray-600">Institute Name</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={4} className="text-center py-8 text-gray-400">Loading...</td></tr>
              ) : rows.length === 0 ? (
                <tr><td colSpan={4} className="text-center py-8 text-gray-400">No results found</td></tr>
              ) : (
                rows.map(row => (
                  <tr key={row.id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-2 text-gray-500">{row.sno}</td>
                    <td className="px-4 py-2 font-mono text-xs">{row.application_no}</td>
                    <td className="px-4 py-2 font-mono text-xs">{row.permanent_id || '—'}</td>
                    <td className="px-4 py-2">{row.institute_name}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4 text-sm text-gray-600">
            <span>Page {page} of {totalPages}</span>
            <div className="flex gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage(p => p - 1)}
                className="px-3 py-1 border rounded disabled:opacity-40 hover:bg-gray-100"
              >← Prev</button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage(p => p + 1)}
                className="px-3 py-1 border rounded disabled:opacity-40 hover:bg-gray-100"
              >Next →</button>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
