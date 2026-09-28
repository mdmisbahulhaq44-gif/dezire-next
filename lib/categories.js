export function capitalize(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s
}

export function parseCatPath(p) {
  return (p.cat || "").split("/").map(s => s.trim()).filter(Boolean)
}

export function buildShopPath(gender, path) {
  return `/shop/${gender}` + (path.length ? "/" + path.map(encodeURIComponent).join("/") : "")
}

// products: already limited to this gender (+ unisex)
export function getSubcategories(products, gender, path, categoryImages = {}) {
  const byNext = new Map()
  products.forEach(p => {
    const segs = parseCatPath(p)
    if (segs.length <= path.length) return
    for (let i = 0; i < path.length; i++) {
      if (segs[i].toLowerCase() !== path[i].toLowerCase()) return
    }
    const next = segs[path.length]
    if (!byNext.has(next)) byNext.set(next, [])
    byNext.get(next).push(p)
  })
  return Array.from(byNext.entries()).map(([seg, items]) => {
    const prices = items.map(p => Number(p.price)).filter(n => !isNaN(n))
    const custom = categoryImages[`${gender}::${[...path, seg].join("/")}`]
    return {
      seg,
      count: items.length,
      image: custom || (items[0] && items[0].imgs ? items[0].imgs.split(",")[0].trim() : ""),
      minPrice: prices.length ? Math.min(...prices) : null
    }
  })
}

// products whose category path is EXACTLY `path` (a leaf)
export function getProductsAtPath(products, path) {
  return products.filter(p => {
    const segs = parseCatPath(p)
    if (segs.length !== path.length) return false
    return segs.every((s, i) => s.toLowerCase() === path[i].toLowerCase())
  })
}
