// Run from the project folder:  node natural-ratio.js
// Changes components/ProductDetail.js: photos in their own ratio + gallery that follows each photo + lightbox (1 / 13, fullscreen, swipe).
const fs = require('fs')
const file = 'components/ProductDetail.js'
let s = fs.readFileSync(file, 'utf8')

if (s.includes('function Lightbox(')) { console.log('Already patched, nothing to do.'); process.exit(0) }

function fail(msg) { console.error('STOPPED (file not changed): ' + msg); process.exit(1) }
function count(str) { return s.split(str).length - 1 }

// ---------- 1. state ----------
const A = 'const [zoomOpen, setZoomOpen] = useState(false)'
if (count(A) !== 1) fail('zoomOpen line not found exactly once')
s = s.replace(A, A + `
  const [ratios, setRatios] = useState({})
  function setRatio(i, el) {
    if (!el || !el.naturalWidth || !el.naturalHeight) return
    const r = el.naturalWidth / el.naturalHeight
    setRatios(o => (o[i] && Math.abs(o[i] - r) < 0.001 ? o : { ...o, [i]: r }))
  }`)

// ---------- 2. gallery: photos in their own ratio ----------
const gStart = s.indexOf('<div className="pdGallery" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>')
if (gStart < 0) fail('gallery start not found')
const gMap = s.indexOf('{images.length ? images.map((url, i) => (', gStart)
if (gMap < 0) fail('gallery map not found')
const gEnd = s.indexOf(')) : (', gMap)
if (gEnd < 0) fail('gallery end not found')
const oldGallery = s.slice(gStart, gEnd)
if (!oldGallery.includes('pdSlide') || oldGallery.length > 3000) fail('gallery block looks different than expected')

const newGallery = `<div className="pdGallery" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd} style={{ aspectRatio: ratios[index] || 1, background: '#fff' }}>
          <div className="pdGalleryTrack" style={{ transform: \`translateX(-\${index * 100}%)\` }}>
            {images.length ? images.map((url, i) => (
              <div className="pdSlide" key={i}>
                <img
                  src={cldOpt(url, 900)}
                  alt={product.name}
                  loading={Math.abs(i - index) <= 1 ? 'eager' : 'lazy'}
                  fetchPriority={i === 0 ? 'high' : 'auto'}
                  decoding="async"
                  onLoad={e => setRatio(i, e.currentTarget)}
                  ref={el => { if (el && el.complete) setRatio(i, el) }}
                  style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
                />
              </div>
            `
s = s.slice(0, gStart) + newGallery + s.slice(gEnd)

// ---------- 3. zoom -> lightbox ----------
const zStart = s.indexOf('{zoomOpen && images[index] && (')
if (zStart < 0) fail('zoom block start not found')
const zImgStr = '<img src={cldOpt(images[index], 1200)} alt={product.name} />'
const zImg = s.indexOf(zImgStr, zStart)
if (zImg < 0) fail('zoom image not found')
const zEnd = s.indexOf(')}', zImg + zImgStr.length)
if (zEnd < 0) fail('zoom block end not found')
s = s.slice(0, zStart) +
  '{zoomOpen && images.length > 0 && (\n        <Lightbox images={images} start={index} name={product.name} onClose={k => { setIndex(k); setZoomOpen(false) }} />\n      )}' +
  s.slice(zEnd + 2)

// ---------- 4. Lightbox component ----------
const LIGHTBOX = `// Full-screen photo viewer like the reference: counter (1 / 13), fullscreen button, close, swipe left/right, every photo in its own ratio
function Lightbox({ images, start, name, onClose }) {
  const [i, setI] = useState(start)
  const [dx, setDx] = useState(0)
  const [drag, setDrag] = useState(false)
  const [fs, setFs] = useState(false)
  const x0 = useRef(0)
  const y0 = useRef(0)
  const horiz = useRef(null)
  const n = images.length

  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    function onFs() { setFs(!!document.fullscreenElement) }
    document.addEventListener('fullscreenchange', onFs)
    return () => {
      document.body.style.overflow = prev
      document.removeEventListener('fullscreenchange', onFs)
      if (document.fullscreenElement && document.exitFullscreen) document.exitFullscreen().catch(() => {})
    }
  }, [])

  function go(d) { setI(k => Math.min(n - 1, Math.max(0, k + d))) }
  function ts(e) { x0.current = e.touches[0].clientX; y0.current = e.touches[0].clientY; horiz.current = null; setDrag(true) }
  function tm(e) {
    const mx = e.touches[0].clientX - x0.current
    const my = e.touches[0].clientY - y0.current
    if (horiz.current === null && (Math.abs(mx) > 8 || Math.abs(my) > 8)) horiz.current = Math.abs(mx) > Math.abs(my)
    if (horiz.current) setDx(mx)
  }
  function te() {
    setDrag(false)
    if (horiz.current && Math.abs(dx) > 50) go(dx < 0 ? 1 : -1)
    setDx(0)
  }
  function toggleFs() {
    if (document.fullscreenElement) { if (document.exitFullscreen) document.exitFullscreen().catch(() => {}) }
    else if (document.documentElement.requestFullscreen) document.documentElement.requestFullscreen().catch(() => {})
  }

  const iconBtn = { width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 0, color: '#eee', cursor: 'pointer', padding: 0 }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 900, background: 'rgba(0,0,0,.88)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ flex: 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 'calc(44px + var(--sat, 0px))', paddingTop: 'var(--sat, 0px)', paddingLeft: 14, background: 'rgba(0,0,0,.5)', color: '#ddd', fontSize: 14 }}>
        <span>{i + 1} / {n}</span>
        <div style={{ display: 'flex' }}>
          <button type="button" aria-label={fs ? 'Exit full screen' : 'Full screen'} onClick={toggleFs} style={iconBtn}>
            {fs ? (
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5" /></svg>
            ) : (
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" /></svg>
            )}
          </button>
          <button type="button" aria-label="Close" onClick={() => onClose(i)} style={iconBtn}>
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true"><path d="M5 5l14 14M19 5L5 19" /></svg>
          </button>
        </div>
      </div>
      <div style={{ flex: 1, minHeight: 0, overflow: 'hidden', touchAction: 'pan-y' }} onTouchStart={ts} onTouchMove={tm} onTouchEnd={te} onTouchCancel={te}>
        <div style={{ display: 'flex', height: '100%', transform: \`translateX(calc(-\${i * 100}% + \${dx}px))\`, transition: drag ? 'none' : 'transform .25s ease' }}>
          {images.map((url, k) => (
            <div key={k} style={{ minWidth: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {Math.abs(k - i) <= 1 && (
                <img src={cldOpt(url, 1200)} alt={name} draggable="false" style={{ width: '100%', height: 'auto', maxHeight: '100%', objectFit: 'contain', display: 'block' }} />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

`
const E = 'export default function ProductDetail('
if (count(E) !== 1) fail('export line not found exactly once')
s = s.replace(E, LIGHTBOX + E)

fs.writeFileSync(file, s)
console.log('Done: components/ProductDetail.js updated.')
