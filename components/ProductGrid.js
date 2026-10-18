import Link from "next/link"
import Image from "next/image"
import { cldOpt } from "../lib/cloudinary"
import Money from "./Money"
import T from "./T"

export default function ProductGrid({ products, replaceLinks, noPreview }) {
  if (!products.length) {
    return <div className="empty"><T>No products available right now.</T></div>
  }

  return (
    <div className="products">
      {products.map(p => {
        const firstImg = p.imgs ? p.imgs.split(",")[0].trim() : ""
        const lowStock = p.stock !== null && p.stock !== undefined && p.stock > 0 && p.stock <= 5
        const soldOut = p.stock !== null && p.stock !== undefined && Number(p.stock) <= 0

        return (
          <Link
            href={`/product/${p.id}`}
            className="product"
            key={p.id}
            replace={replaceLinks}
            data-replace={replaceLinks ? "1" : undefined}
            data-preview={noPreview ? undefined : JSON.stringify({ id: p.id, name: p.name, price: p.price, old: p.old || null, img: firstImg, all: p.imgs || '' })}
          >
            <div className="productImage" style={{ position: "relative", opacity: soldOut ? 0.55 : 1 }}>
              {soldOut ? (
                <span className="badge" style={{ background: "#111", color: "#fff" }}><T>SOLD OUT</T></span>
              ) : p.badge && (
                <span className={`badge ${/sale/i.test(p.badge) ? "sale" : ""}`}><T>{p.badge}</T></span>
              )}
              {firstImg ? (
                <Image
                  src={cldOpt(firstImg, 500)}
                  alt={p.name}
                  fill
                  sizes="(min-width:901px) 25vw, 50vw"
                  style={{ objectFit: "cover" }}
                  loading="lazy"
                  quality={75}
                />
              ) : (
                <div className="placeholder">👕</div>
              )}
            </div>
            <h3>{p.name}</h3>
            <div className="price">
              <Money n={p.price} />{" "}
              {p.old && <span className="old"><Money n={p.old} /></span>}
            </div>
            {!soldOut && <span className="buyNow"><T>Buy Now</T></span>}
            {lowStock && (
              <div style={{ fontSize: 11, color: "var(--red)", marginTop: 3 }}><T vars={{ n: p.stock }}>{'Only {n} left'}</T></div>
            )}
          </Link>
        )
      })}
    </div>
  )
}
