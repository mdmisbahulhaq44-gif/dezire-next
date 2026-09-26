import { cldOpt } from "../lib/cloudinary"

export default function CategoryTiles({ categories }) {
  return (
    <div className="categories" style={{ padding: "0 1.5%" }}>
      {categories.map((c, i) => (
        <button
          key={i}
          className="category"
          style={{
            backgroundImage: c.image ? `url('${cldOpt(c.image, 700)}')` : undefined,
            background: c.image ? undefined : "#1a1a1a"
          }}
        >
          <div className="catText">
            <h3>{c.name || ""}</h3>
            <span>{c.subtitle || ""}</span>
          </div>
        </button>
      ))}
    </div>
  )
}
