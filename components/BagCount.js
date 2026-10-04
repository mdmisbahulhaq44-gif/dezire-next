// Shopping-bag icon with the item count written inside it
export default function BagCount({ count = 0, size = 42 }) {
  return (
    <span style={{ position: 'relative', display: 'inline-flex', width: size, height: size, alignItems: 'center', justifyContent: 'center', color: '#111' }}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" width={size} height={size}>
        <path d="M5.4 8.2h13.2l.9 12.8H4.5Z" />
        <path d="M9 11V6.4a3 3 0 0 1 6 0V11" />
      </svg>
      <span style={{ position: 'absolute', left: 0, right: 0, top: '66%', transform: 'translateY(-50%)', textAlign: 'center', fontSize: Math.round(size * 0.36), fontWeight: 300, lineHeight: 1 }}>{count}</span>
    </span>
  )
}
