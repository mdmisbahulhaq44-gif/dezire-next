// Display currency. Prices are always stored and charged in BDT; USD is only a display conversion.
// 1 USD = USD_RATE BDT (fallback). The live rate is set in Admin > Currency (settings key usd_rate).
export const USD_RATE = 120

export function formatMoney(n, currency, rate = USD_RATE) {
  const v = Number(n) || 0
  if (currency === 'USD') {
    const u = v / (rate > 0 ? rate : USD_RATE)
    return '$' + (u >= 100 ? Math.round(u).toLocaleString('en-US') : u.toFixed(2).replace(/\.00$/, ''))
  }
  return '৳' + v.toLocaleString('en-US')
}
