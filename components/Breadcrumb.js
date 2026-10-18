import Link from "next/link"
import { buildShopPath, capitalize } from "../lib/categories"
import T from "./T"

export default function Breadcrumb({ gender, path }) {
  const items = [
    <Link key="home" href="/"><T>Home</T></Link>,
    <Link key="gender" href={buildShopPath(gender, [])}><T>{capitalize(gender)}</T></Link>
  ]
  path.forEach((seg, i) => {
    const isLast = i === path.length - 1
    items.push(
      isLast
        ? <span key={`s${i}`}><T>{seg}</T></span>
        : <Link key={`s${i}`} href={buildShopPath(gender, path.slice(0, i + 1))}><T>{seg}</T></Link>
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
