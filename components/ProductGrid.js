import Link from "next/link"
import { cldOpt, cldSrcset } from "../lib/cloudinary"

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
          <Link href={`/product/${p.id}`} className="product" key={p.id} replace={replaceLinks}>
            <div className="productImage">
              {p.badge && (
                <span className={`badge ${p.badge.toLowerCase() === "sale" ? "sale" : ""}`}>{p.badge}</span>
              )}
              {firstImg ? (
                <img
                  src={cldOpt(firstImg, 500)}
                  srcSet={cldSrcset(firstImg, [250, 400, 500])}
                  sizes="(min-width:901px) 25vw, 50vw"
                  alt={p.name}
                  loading="lazy"
                  decoding="async"
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
