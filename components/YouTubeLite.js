'use client'

// Real YouTube player shown directly (so it shows the title, channel name and channel logo like YouTube does).
// loading="lazy" means it only loads when the visitor scrolls near it.
export default function YouTubeLite({ id, title }) {
  return (
    <div className="abVideo">
      <iframe
        src={`https://www.youtube-nocookie.com/embed/${id}?rel=0&playsinline=1`}
        title={title || 'Video'}
        loading="lazy"
        allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; fullscreen"
        allowFullScreen
        referrerPolicy="strict-origin-when-cross-origin"
      />
    </div>
  )
}
