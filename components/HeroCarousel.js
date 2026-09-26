"use client"

import { useEffect, useRef, useState } from "react"
import { cldOpt, cldSrcset } from "../lib/cloudinary"

export default function HeroCarousel({ slides }) {
  const [index, setIndex] = useState(0)
  const timerRef = useRef(null)

  useEffect(() => {
    if (slides.length < 2) return
    timerRef.current = setInterval(() => {
      setIndex(i => (i + 1) % slides.length)
    }, 4500)
    return () => clearInterval(timerRef.current)
  }, [slides.length])

  function goTo(i) {
    setIndex(((i % slides.length) + slides.length) % slides.length)
  }

  if (!slides.length) return null
  const multi = slides.length > 1

  return (
    <div className="heroCarousel">
      <div className="heroTrack" style={{ transform: `translateX(-${index * 100}%)` }}>
        {slides.map((s, i) => (
          <div className="heroSlide" key={i}>
            <img
              src={cldOpt(s.image, 900)}
              srcSet={cldSrcset(s.image, [600, 900, 1200])}
              sizes="100vw"
              alt=""
              loading={i === 0 ? "eager" : "lazy"}
              fetchPriority={i === 0 ? "high" : "auto"}
              decoding="async"
            />
          </div>
        ))}
      </div>

      {multi && (
        <>
          <button className="heroArrow heroArrowLeft" onClick={() => goTo(index - 1)} aria-label="Previous slide">‹</button>
          <button className="heroArrow heroArrowRight" onClick={() => goTo(index + 1)} aria-label="Next slide">›</button>
          <div className="heroDots">
            {slides.map((_, i) => (
              <span key={i} className={i === index ? "active" : ""} onClick={() => goTo(i)}></span>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
