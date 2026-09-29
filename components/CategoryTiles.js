import Link from "next/link"
import Image from "next/image"
import { cldOpt } from "../lib/cloudinary"
import { buildShopPath } from "../lib/categories"

export default function CategoryTiles({ categories }) {
  return (
    <div className="categories" style={{ padding: "0 1.5%" }}>
      {categories.map((c, i) => {
        const gender = c.gender || ""
        const category = c.category || ""
        const params = new URLSearchParams()
        if (gender) params.set("gender", gender)
        if (category) params.set("cat", category)
        const qs = params.toString()
        const href =
          gender === "men" || gender === "women"
            ? buildShopPath(gender, category.split("/").map(s => s.trim()).filter(Boolean))
            : "/shop" + (qs ? `?${qs}` : "")

        return (
          <Link
            href={href}
            key={i}
            className="category"
            style={{
              position: "relative",
              background: c.image ? undefined : "#1a1a1a"
            }}
          >
            {c.image && (
              <Image
                src={cldOpt(c.image, 700)}
                alt=""
                fill
                sizes="(min-width:901px) 25vw, 50vw"
                style={{ objectFit: "cover", zIndex: 0 }}
                loading="lazy"
                quality={75}
              />
            )}
            <div className="catText" style={{ position: "relative", zIndex: 1 }}>
              <h3>{c.name || ""}</h3>
              <span>{c.subtitle || ""}</span>
            </div>
          </Link>
        )
      })}
    </div>
  )
}
