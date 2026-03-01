import { useState } from 'react'
import { globalSearch } from '../services/api'
import StatusBadge from '../components/StatusBadge'

const TYPE_COLORS = {
    student: 'bg-indigo-100 text-indigo-700',
}

export default function Search() {
    const [query, setQuery] = useState('')
    const [filters, setFilters] = useState({ type: '', status: '', year: '' })
    const [results, setResults] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    const handleSearch = async (e) => {
        e?.preventDefault()
        if (!query.trim() && !filters.status && !filters.year) return
        setLoading(true)
        setError(null)
        try {
            const params = { q: query }
            if (filters.type) params.type = filters.type
            if (filters.status) params.status = filters.status
            if (filters.year) params.year = filters.year
            const r = await globalSearch(params)
            setResults(r.data)
        } catch (err) {
            setError(err.response?.data?.message || err.message)
        } finally {
            setLoading(false)
        }
    }

    // Flatten all results into one list for unified display
    const allResults = results
        ? [
            ...(results.results.students || []),
        ]
        : []

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-slate-800">Search</h1>
                <p className="text-slate-500 mt-0.5">Multi-criteria search across all persons</p>
            </div>

            {/* Search Form */}
            <form onSubmit={handleSearch} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 mb-6">
                <div className="flex gap-3 flex-wrap">
                    {/* Main search */}
                    <div className="relative flex-1 min-w-[200px]">
                        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                            value={query}
                            onChange={e => setQuery(e.target.value)}
                            placeholder="Search by name, email, or ID…"
                            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
                        />
                    </div>

                    {/* Type filter */}
                    <select value={filters.type} onChange={e => setFilters({ ...filters, type: e.target.value })}
                        className="text-sm px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white">
                        <option value="">All Types</option>
                        <option value="student">Students</option>
                    </select>

                    {/* Status filter */}
                    <select value={filters.status} onChange={e => setFilters({ ...filters, status: e.target.value })}
                        className="text-sm px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white">
                        <option value="">All Statuses</option>
                        {['pending', 'active', 'suspended', 'inactive', 'archived'].map(s => (
                            <option key={s} value={s} className="capitalize">{s}</option>
                        ))}
                    </select>

                    {/* Year filter */}
                    <input
                        type="number"
                        value={filters.year}
                        onChange={e => setFilters({ ...filters, year: e.target.value })}
                        placeholder="Entry year…"
                        min="1990" max="2100"
                        className="w-28 text-sm px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
                    />

                    <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-semibold text-sm transition shadow-sm">
                        Search
                    </button>
                </div>
            </form>

            {/* Error */}
            {error && <div className="mb-4 bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 text-sm">❌ {error}</div>}

            {/* Loading */}
            {loading && (
                <div className="flex items-center gap-2 text-slate-500 text-sm mb-4">
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Searching…
                </div>
            )}

            {/* Stats bar */}
            {results && !loading && (
                <div className="flex items-center gap-4 mb-4">
                    <span className="text-sm text-slate-600 font-medium">{results.total} result(s) for "{results.query}"</span>
                    <div className="flex gap-2 flex-wrap">
                        {results.results.students?.length > 0 && <span className="bg-indigo-100 text-indigo-700 text-xs px-2.5 py-1 rounded-full font-medium">{results.results.students.length} Students</span>}
                    </div>
                </div>
            )}

            {/* Results Table */}
            {results && !loading && (
                allResults.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-2xl border border-slate-100">
                        <svg className="mx-auto w-12 h-12 text-slate-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-slate-500 font-medium">No results found</p>
                        <p className="text-slate-400 text-sm mt-1">Try adjusting your search or filters</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-slate-50 border-b border-slate-100">
                                    <tr>
                                        {['Type', 'ID', 'Name', 'Email', 'Faculty / Dept.', 'Entry Year', 'Status'].map(h => (
                                            <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {allResults.map((r, i) => (
                                        <tr key={i} className="hover:bg-slate-50 transition">
                                            <td className="px-5 py-4">
                                                <span className={`text-xs px-2.5 py-1 rounded-full font-semibold capitalize ${TYPE_COLORS[r.type] || 'bg-gray-100 text-gray-600'}`}>
                                                    {r.type}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4 font-mono text-xs font-semibold text-slate-600">{r.identifier}</td>
                                            <td className="px-5 py-4 font-medium text-slate-800">{r.first_name} {r.last_name}</td>
                                            <td className="px-5 py-4 text-slate-600">{r.email}</td>
                                            <td className="px-5 py-4 text-slate-600">
                                                {r.faculty ? `${r.faculty}${r.department ? ` / ${r.department}` : ''}` : r.department || '—'}
                                            </td>
                                            <td className="px-5 py-4 text-slate-600">{r.entry_year || '—'}</td>
                                            <td className="px-5 py-4"><StatusBadge status={r.status} /></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="px-5 py-3 border-t border-slate-100 text-xs text-slate-400">{allResults.length} result(s) total</div>
                    </div>
                )
            )}

            {/* Initial state */}
            {!results && !loading && (
                <div className="text-center py-20 text-slate-400">
                    <svg className="mx-auto w-16 h-16 mb-4 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <p>Enter a name, email, or ID to search.</p>
                </div>
            )}
        </div>
    )
}
