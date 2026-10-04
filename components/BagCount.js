// Shopping-bag icon with the item count written inside it
export default function BagCount({ count = 0, size = 38 }) {
  return (
    <span style={{ position: 'relative', display: 'inline-flex', width: size, height: size, alignItems: 'center', justifyContent: 'center', color: '#111' }}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="butt" strokeLinejoin="miter" width={size} height={size}>
        <path d="M4.5 8.5h15V21h-15Z" />
        <path d="M8.5 8.5V6.6a3.5 3.5 0 0 1 7 0v1.9" strokeLinecap="round" />
      </svg>
      <span style={{ position: 'absolute', left: 0, right: 0, top: '64%', transform: 'translateY(-50%)', textAlign: 'center', fontSize: Math.round(size * 0.36), fontWeight: 500, lineHeight: 1 }}>{count}</span>
    </span>
  )
}
