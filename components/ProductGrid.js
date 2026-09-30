import Link from "next/link"
import Image from "next/image"
import { cldOpt } from "../lib/cloudinary"

export default function ProductGrid({ products, replaceLinks }) {
  if (!products.length) {
    return <div className="empty">No products available right now.</div>
  }

  return (
    <div className="products">
      {products.map(p => {
        const firstImg = p.imgs ? p.imgs.split(",")[0].trim() : ""
        const lowStock = p.stock !== null && p.stock !== undefined && p.stock > 0 && p.stock <= 5

        return (
          <Link
            href={`/product/${p.id}`}
            className="product"
            key={p.id}
            replace={replaceLinks}
            data-replace={replaceLinks ? "1" : undefined}
            data-preview={JSON.stringify({ id: p.id, name: p.name, price: p.price, old: p.old || null, img: firstImg })}
          >
            <div className="productImage" style={{ position: "relative" }}>
              {p.badge && (
                <span className={`badge ${p.badge.toLowerCase() === "sale" ? "sale" : ""}`}>{p.badge}</span>
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
              ৳{Number(p.price).toLocaleString()}{" "}
              {p.old && <span className="old">৳{Number(p.old).toLocaleString()}</span>}
            </div>
            {lowStock && (
              <div style={{ fontSize: 11, color: "var(--red)", marginTop: 3 }}>Only {p.stock} left</div>
            )}
          </Link>
        )
      })}
    </div>
  )
}
