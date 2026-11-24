'use client'

import { useState } from 'react'

// Shows the video picture first; the real player loads only when tapped (keeps the page fast)
export default function YouTubeLite({ id, title }) {
  const [on, setOn] = useState(false)
  return (
    <div className="abVideo">
      {on ? (
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`}
          title={title || 'Video'}
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
        />
      ) : (
        <button type="button" className="abPlay" onClick={() => setOn(true)} aria-label={title ? `Play: ${title}` : 'Play video'}>
          <img src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`} alt={title || ''} loading="lazy" />
          <span className="abBtn"><svg viewBox="0 0 68 48" width="68" height="48" aria-hidden="true"><path d="M66.5 7.7a8.5 8.5 0 0 0-6-6C55.2.3 34 .3 34 .3S12.8.3 7.5 1.7a8.5 8.5 0 0 0-6 6C.1 13 .1 24 .1 24s0 11 1.4 16.3a8.5 8.5 0 0 0 6 6C12.8 47.7 34 47.7 34 47.7s21.2 0 26.5-1.4a8.5 8.5 0 0 0 6-6C67.9 35 67.9 24 67.9 24s0-11-1.4-16.3z" fill="#e8283c" /><path d="M45 24 27 14v20" fill="#fff" /></svg></span>
        </button>
      )}
    </div>
  )
}
