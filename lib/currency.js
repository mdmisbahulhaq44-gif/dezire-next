// Display currency. Prices are always stored and charged in BDT; USD is only a display conversion.
// 1 USD = USD_RATE BDT  (change this one number to update every price on the site)
export const USD_RATE = 120

export function formatMoney(n, currency) {
  const v = Number(n) || 0
  if (currency === 'USD') {
    const u = v / USD_RATE
    return '$' + (u >= 100 ? Math.round(u).toLocaleString('en-US') : u.toFixed(2).replace(/\.00$/, ''))
  }
  return '৳' + v.toLocaleString('en-US')
}
