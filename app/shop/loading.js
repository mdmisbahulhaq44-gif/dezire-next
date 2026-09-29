export default function Loading() {
  return (
    <div style={{ padding: 16, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} style={{ aspectRatio: "3/4", borderRadius: 12, background: "rgba(128,128,128,.15)", animation: "sk 1.1s ease-in-out infinite alternate" }} />
      ))}
      <style>{`@keyframes sk{from{opacity:.4}to{opacity:1}}`}</style>
    </div>
  )
}
