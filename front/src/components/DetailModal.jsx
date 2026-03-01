import StatusBadge from './StatusBadge'

// One info row inside the detail panel
const InfoRow = ({ label, value }) => (
    <div className="flex gap-2">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide w-36 flex-shrink-0 pt-0.5">{label}</span>
        <span className="text-sm text-slate-700 break-all">{value || <span className="text-slate-300">—</span>}</span>
    </div>
)

const Section = ({ title, children }) => (
    <div>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 pb-1.5 border-b border-slate-100">{title}</p>
        <div className="space-y-2.5">{children}</div>
    </div>
)

// ─── STUDENT detail ─────────────────────────────────────────
function StudentDetail({ data: s }) {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4 p-4 bg-indigo-50 rounded-xl">
                <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-full flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                    {s.first_name?.[0]}{s.last_name?.[0]}
                </div>
                <div>
                    <h3 className="text-xl font-bold text-slate-800">{s.first_name} {s.last_name}</h3>
                    <p className="text-indigo-600 font-mono text-sm font-semibold">{s.identifier}</p>
                    <div className="mt-1"><StatusBadge status={s.status} /></div>
                </div>
            </div>

            <Section title="Personal Information">
                <InfoRow label="Date of Birth" value={s.date_of_birth?.slice(0, 10)} />
                <InfoRow label="Place of Birth" value={s.place_of_birth} />
                <InfoRow label="Nationality" value={s.nationality} />
                <InfoRow label="Gender" value={s.gender} />
                <InfoRow label="Email" value={s.email} />
                <InfoRow label="Phone" value={s.phone_number} />
            </Section>

            <Section title="Academic Information">
                <InfoRow label="Category" value={s.category?.replace(/_/g, ' ')} />
                <InfoRow label="Entry Year" value={s.entry_year} />
                <InfoRow label="Faculty" value={s.faculty} />
                <InfoRow label="Department" value={s.department} />
                <InfoRow label="Chosen Major" value={s.chosen_major} />
                <InfoRow label="Chosen Program" value={s.chosen_program} />
                <InfoRow label="Student Group" value={s.student_group} />
                <InfoRow label="Scholarship" value={s.scholarship_status ? '✅ Yes' : '❌ No'} />
            </Section>

            {(s.high_school_diploma_type || s.high_school_diploma_year) && (
                <Section title="High School Diploma">
                    <InfoRow label="Type" value={s.high_school_diploma_type} />
                    <InfoRow label="Year" value={s.high_school_diploma_year} />
                    <InfoRow label="Honors" value={s.high_school_honors?.replace(/_/g, ' ')} />
                </Section>
            )}
        </div>
    )
}

// ─── FACULTY detail ──────────────────────────────────────────
function FacultyDetail({ data: f }) {
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4 p-4 bg-emerald-50 rounded-xl">
                <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-full flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                    {f.first_name?.[0]}{f.last_name?.[0]}
                </div>
                <div>
                    <h3 className="text-xl font-bold text-slate-800">{f.first_name} {f.last_name}</h3>
                    <p className="text-emerald-600 font-mono text-sm font-semibold">{f.identifier}</p>
                    <div className="mt-1"><StatusBadge status={f.status} /></div>
                </div>
            </div>

            <Section title="Personal Information">
                <InfoRow label="Date of Birth" value={f.date_of_birth?.slice(0, 10)} />
                <InfoRow label="Place of Birth" value={f.place_of_birth} />
                <InfoRow label="Nationality" value={f.nationality} />
                <InfoRow label="Gender" value={f.gender} />
                <InfoRow label="Email" value={f.email} />
                <InfoRow label="Phone" value={f.phone_number} />
            </Section>

            <Section title="Professional Information">
                <InfoRow label="Rank" value={f.rank?.replace(/_/g, ' ')} />
                <InfoRow label="Category" value={f.category?.replace(/_/g, ' ')} />
                <InfoRow label="Faculty" value={f.faculty} />
                <InfoRow label="Department" value={f.department} />
                <InfoRow label="Specialization" value={f.specialization} />
                <InfoRow label="Research Areas" value={f.research_areas} />
                <InfoRow label="PhD Institution" value={f.phd_institution} />
                <InfoRow label="Teaching Hours" value={f.teaching_hours ? `${f.teaching_hours} h/week` : null} />
                <InfoRow label="Habilitation (HDR)" value={f.habilitation ? '✅ Yes' : '❌ No'} />
            </Section>

            {(f.office_location || f.office_building) && (
                <Section title="Office">
                    <InfoRow label="Location" value={f.office_location} />
                </Section>
            )}

            <Section title="Contract">
                <InfoRow label="Contract Type" value={f.contract_type?.replace(/_/g, ' ')} />
                <InfoRow label="Start Date" value={f.contract_start_date?.slice(0, 10)} />
                <InfoRow label="End Date" value={f.contract_end_date?.slice(0, 10)} />
                <InfoRow label="Entry Year" value={f.entry_year} />
            </Section>
        </div>
    )
}

// ─── STAFF detail ────────────────────────────────────────────
function StaffDetail({ data: m }) {
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4 p-4 bg-amber-50 rounded-xl">
                <div className="w-14 h-14 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                    {m.first_name?.[0]}{m.last_name?.[0]}
                </div>
                <div>
                    <h3 className="text-xl font-bold text-slate-800">{m.first_name} {m.last_name}</h3>
                    <p className="text-amber-600 font-mono text-sm font-semibold">{m.identifier}</p>
                    <div className="mt-1"><StatusBadge status={m.status} /></div>
                </div>
            </div>

            <Section title="Personal Information">
                <InfoRow label="Date of Birth" value={m.date_of_birth?.slice(0, 10)} />
                <InfoRow label="Place of Birth" value={m.place_of_birth} />
                <InfoRow label="Nationality" value={m.nationality} />
                <InfoRow label="Gender" value={m.gender} />
                <InfoRow label="Email" value={m.email} />
                <InfoRow label="Phone" value={m.phone_number} />
            </Section>

            <Section title="Position Details">
                <InfoRow label="Category" value={m.category?.replace(/_/g, ' ')} />
                <InfoRow label="Department" value={m.department} />
                <InfoRow label="Job Title" value={m.position} />
                <InfoRow label="Grade" value={m.grade} />
                <InfoRow label="Entry Year" value={m.entry_year} />
            </Section>

            <Section title="Contract">
                <InfoRow label="Start Date" value={m.contract_start_date?.slice(0, 10)} />
                <InfoRow label="End Date" value={m.contract_end_date?.slice(0, 10)} />
            </Section>
        </div>
    )
}

// ─── Main export ─────────────────────────────────────────────
export default function DetailModal({ type, data, onClose }) {
    if (!data) return null
    return (
        <div className="fixed inset-0 z-50 flex items-start justify-end">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
            {/* Slide-over panel */}
            <div className="relative z-10 h-full w-full max-w-lg bg-white shadow-2xl flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-slate-100 flex-shrink-0">
                    <div>
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Full Profile</p>
                        <h2 className="text-lg font-bold text-slate-800">{data.first_name} {data.last_name}</h2>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
                {/* Scrollable content */}
                <div className="overflow-y-auto flex-1 p-5">
                    {type === 'student' && <StudentDetail data={data} />}
                    {type === 'faculty' && <FacultyDetail data={data} />}
                    {type === 'staff' && <StaffDetail data={data} />}
                </div>
            </div>
        </div>
    )
}
