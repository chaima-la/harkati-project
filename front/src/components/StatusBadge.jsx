export default function StatusBadge({ status }) {
    const styles = {
        active: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
        pending: 'bg-amber-100 text-amber-700 border border-amber-200',
        suspended: 'bg-orange-100 text-orange-700 border border-orange-200',
        inactive: 'bg-gray-100 text-gray-600 border border-gray-200',
        archived: 'bg-red-100 text-red-600 border border-red-200',
    }
    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${styles[status] || styles.inactive}`}>
            {status || '—'}
        </span>
    )
}
