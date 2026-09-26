export function cldOpt(url, width) {
  if (!url || !url.includes("res.cloudinary.com") || !url.includes("/upload/")) return url
  if (url.includes("/upload/w_") || url.includes("/upload/f_")) return url
  const transform = width ? `w_${width},f_auto,q_auto` : "f_auto,q_auto"
  return url.replace("/upload/", `/upload/${transform}/`)
}

export function cldSrcset(url, widths) {
  if (!url || !url.includes("res.cloudinary.com") || !url.includes("/upload/")) return ""
  if (url.includes("/upload/w_") || url.includes("/upload/f_")) return ""
  return widths.map(w => `${url.replace("/upload/", `/upload/w_${w},f_auto,q_auto/`)} ${w}w`).join(", ")
}
