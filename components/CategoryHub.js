import Link from "next/link"
import Breadcrumb from "./Breadcrumb"
import ShopAside from "./ShopAside"
import HubTiles from "./HubTiles"
import { cldOpt } from "../lib/cloudinary"
import { buildShopPath } from "../lib/categories"
import Money from "./Money"
import T from "./T"

export default function CategoryHub({ gender, path, heading, subs }) {
  return (
    <section className="section" id="categoryHub">
      <Breadcrumb gender={gender} path={path} />
      <div className="heading"><div><h2><T>{heading}</T></h2></div></div>
      {subs.length && subs.every(s => s.count === 1) ? (
        <HubTiles gender={gender} path={path} subs={subs} />
      ) : subs.length ? (
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
                <h3><T>{s.seg}</T></h3>
                {s.count === 1
                  ? (s.minPrice !== null ? <span><Money n={s.minPrice} /></span> : null)
                  : <span><T vars={{ n: s.count }}>{'{n} PRODUCTS'}</T>{s.minPrice !== null ? <> · <T>FROM</T> <Money n={s.minPrice} /></> : ""}</span>}
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <p style={{ color: "var(--muted)", fontSize: 13 }}>
          <T>No products here yet — add some from the Admin Panel.</T>
        </p>
      )}
      {subs.length > 0 && <ShopAside />}
    </section>
  )
}
