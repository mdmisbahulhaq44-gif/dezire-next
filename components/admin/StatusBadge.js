export default function StatusBadge({ status }) {
  const s = (status || 'pending').toLowerCase()
  const label = s.charAt(0).toUpperCase() + s.slice(1)
  return <span className={`statusBadge ${s}`}>{label}</span>
}
