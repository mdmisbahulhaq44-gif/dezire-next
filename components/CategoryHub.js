import Link from "next/link"
import Breadcrumb from "./Breadcrumb"
import ShopAside from "./ShopAside"
import { cldOpt } from "../lib/cloudinary"
import { buildShopPath } from "../lib/categories"

export default function CategoryHub({ gender, path, heading, subs }) {
  return (
    <section className="section" id="categoryHub">
      <Breadcrumb gender={gender} path={path} />
      <div className="heading"><div><h2>{heading}</h2></div></div>
      {subs.length ? (
        <div className="hubTiles">
          {subs.map(s => (
            <Link
              key={s.seg}
              href={s.count === 1 && s.id ? `/product/${s.id}` : buildShopPath(gender, [...path, s.seg])}
              className="category"
              style={
                s.image
                  ? { backgroundImage: `url('${cldOpt(s.image, 700).replace(/'/g, "%27")}')` }
                  : { background: "#1a1a1a" }
              }
            >
              <div className="catText">
                <h3>{s.seg}</h3>
                {s.count === 1
                  ? (s.minPrice !== null ? <span>৳{Number(s.minPrice).toLocaleString()}</span> : null)
                  : <span>{s.count} PRODUCTS{s.minPrice !== null ? ` · FROM ৳${s.minPrice}` : ""}</span>}
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <p style={{ color: "var(--muted)", fontSize: 13 }}>
          No products here yet — add some from the Admin Panel.
        </p>
      )}
      {subs.length > 0 && <ShopAside />}
    </section>
  )
}
