"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { cldOpt } from "../lib/cloudinary"
import { buildShopPath } from "../lib/categories"

// Where a slide leads when tapped (empty = not clickable)
function slideHref(s) {
  const gender = s.gender || ""
  const category = s.category || ""
  if (!gender) return ""
  if (gender === "flash") return "/flash-sale"
  if (gender === "men" || gender === "women") {
    return buildShopPath(gender, category.split("/").map(x => x.trim()).filter(Boolean))
  }
  const params = new URLSearchParams()
  params.set("gender", gender)
  if (category) params.set("cat", category)
  return "/shop?" + params.toString()
}

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
          <div className="heroSlide" key={i} style={{ position: "relative" }}>
            <Image
              src={cldOpt(s.image, 1200)}
              alt=""
              fill
              sizes="100vw"
              style={{ objectFit: "cover" }}
              priority={i === 0}
              fetchPriority={i === 0 ? "high" : "auto"}
              loading={i === 0 ? "eager" : "lazy"}
              quality={75}
            />
            {slideHref(s) && (
              <Link
                href={slideHref(s)}
                aria-label={s.gender === "flash" ? "Flash Sale" : "Open collection"}
                tabIndex={i === index ? 0 : -1}
                style={{ position: "absolute", inset: 0, zIndex: 1 }}
              />
            )}
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
