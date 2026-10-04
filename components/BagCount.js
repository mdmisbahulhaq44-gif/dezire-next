// Shopping-bag icon with the item count written inside it
export default function BagCount({ count = 0, size = 34 }) {
  return (
    <span style={{ position: 'relative', display: 'inline-flex', width: size, height: size, alignItems: 'center', justifyContent: 'center', color: '#111' }}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width={size} height={size}>
        <path d="M6 8h12l-1.2 11a2 2 0 0 1-2 1.8H9.2a2 2 0 0 1-2-1.8L6 8Z" />
        <path d="M9 8V6a3 3 0 0 1 6 0v2" />
      </svg>
      <span style={{ position: 'absolute', left: 0, right: 0, top: '62%', transform: 'translateY(-50%)', textAlign: 'center', fontSize: Math.round(size * 0.36), fontWeight: 600, lineHeight: 1 }}>{count}</span>
    </span>
  )
}
