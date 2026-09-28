import Link from "next/link"
import { buildShopPath, capitalize } from "../lib/categories"

export default function Breadcrumb({ gender, path }) {
  const items = [
    <Link key="home" href="/">Home</Link>,
    <Link key="gender" href={buildShopPath(gender, [])}>{capitalize(gender)}</Link>
  ]
  path.forEach((seg, i) => {
    const isLast = i === path.length - 1
    items.push(
      isLast
        ? <span key={`s${i}`}>{seg}</span>
        : <Link key={`s${i}`} href={buildShopPath(gender, path.slice(0, i + 1))}>{seg}</Link>
    )
  })
  return (
    <div className="breadcrumb">
      {items.map((c, i) => (
        <span key={i}>{i > 0 ? " / " : ""}{c}</span>
      ))}
    </div>
  )
}
