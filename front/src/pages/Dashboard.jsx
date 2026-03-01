import { useState, useEffect } from 'react'
import { getStats } from '../services/api'

const StatCard = ({ label, color, counts }) => {
    const total = Object.values(counts || {}).reduce((s, v) => s + v, 0)
    const colorMap = {
        indigo: 'from-indigo-500 to-indigo-700',
        emerald: 'from-emerald-500 to-emerald-700',
        amber: 'from-amber-500 to-amber-700',
        purple: 'from-purple-500 to-purple-700',
    }
    return (
        <div className={`rounded-2xl bg-gradient-to-br ${colorMap[color]} p-6 text-white shadow-lg`}>
            <p className="text-sm font-medium text-white/75 uppercase tracking-wide">{label}</p>
            <p className="text-4xl font-bold mt-1">{total}</p>
            <div className="mt-4 space-y-1">
                {Object.entries(counts || {}).map(([s, c]) => (
                    <div key={s} className="flex justify-between text-xs text-white/80">
                        <span className="capitalize">{s}</span>
                        <span className="font-semibold">{c}</span>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default function Dashboard() {
    const [stats, setStats] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        getStats()
            .then(r => setStats(r.data.data))
            .catch(e => setError(e.response?.data?.message || e.message))
            .finally(() => setLoading(false))
    }, [])

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-800">Dashboard</h1>
                <p className="text-slate-500 mt-1">University IAM System Overview</p>
            </div>

            {loading && (
                <div className="flex items-center gap-3 text-slate-500">
                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Loading statistics...
                </div>
            )}

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4">
                    ❌ {error}
                </div>
            )}

            {stats && (
                <>
                    {/* Total persons card */}
                    <div className="mb-6 bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl p-6 text-white shadow-xl">
                        <p className="text-slate-400 text-sm uppercase tracking-wide font-medium">Total Persons in System</p>
                        <p className="text-5xl font-extrabold mt-1">{stats.total_persons}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-1 gap-5 max-w-sm">
                        <StatCard label="Students" color="indigo" counts={stats.students} />
                    </div>
                </>
            )}

            {!loading && !error && !stats && (
                <div className="text-center py-20 text-slate-400">
                    <svg className="mx-auto w-16 h-16 mb-4 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p>No data available yet.</p>
                </div>
            )}
        </div>
    )
}
