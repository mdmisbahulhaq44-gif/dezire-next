'use client'

import { useShop } from './ShopContext'

// <T>English text</T> shows the text in the visitor's language.
// vars fills {placeholders}: <T vars={{ n: 3 }}>Only {n} left</T>
export default function T({ children, vars }) {
  const { t } = useShop()
  return <>{typeof children === 'string' ? t(children, vars) : children}</>
}
