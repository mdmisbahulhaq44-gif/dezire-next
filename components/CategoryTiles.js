import Link from "next/link"
import { cldOpt } from "../lib/cloudinary"
import { buildShopPath } from "../lib/categories"
import T from "./T"

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
            className={"category" + (c.image ? " catNat" : "")}
            style={{
              position: "relative",
              background: c.image ? undefined : "#1a1a1a"
            }}
          >
            {c.image && (
              <img
                src={cldOpt(c.image, 900)}
                alt={c.name || ""}
                loading="lazy"
                decoding="async"
                style={{ display: "block", width: "100%", height: "auto" }}
              />
            )}
            <div className="catText" style={{ position: "relative", zIndex: 1 }}>
              <h3><T>{c.name || ""}</T></h3>
              <span><T>{c.subtitle || ""}</T></span>
            </div>
          </Link>
        )
      })}
    </div>
  )
}
