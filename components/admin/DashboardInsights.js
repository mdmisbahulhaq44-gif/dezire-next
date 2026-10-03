'use client'

import { useState } from 'react'

const INK = '#1a1a19'
const fmt = n => '৳' + Number(n || 0).toLocaleString('en-US')

function niceMax(v) {
  if (!(v > 0)) return 1000
  const pow = Math.pow(10, Math.floor(Math.log10(v)))
  const f = v / pow
  return (f <= 1 ? 1 : f <= 2 ? 2 : f <= 5 ? 5 : 10) * pow
}
function dayLabel(iso) {
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
}

const card = { border: '1px solid #eee', borderRadius: 14, padding: 18, background: '#fff' }
const cap = { fontSize: 10, letterSpacing: '.5px', color: '#888', textTransform: 'uppercase' }

// Same look as the four top cards (icon + small caption + big number)
function Period({ label, icon, bg, color, data }) {
  return (
    <div className="stat">
      <div className="statIcon" style={{ background: bg, color }}>{icon}</div>
      <div>
        <small>{label.toUpperCase()}</small>
        <h2>{fmt(data.sales)}</h2>
        <span className="statSub">{data.orders} order{data.orders === 1 ? '' : 's'}</span>
      </div>
    </div>
  )
}

function Attention({ label, icon, bg, color, value, tone, onClick }) {
  const alert = value > 0 && tone === 'alert'
  return (
    <div className={`stat${alert ? ' alert' : ''}`} onClick={onClick} style={{ cursor: onClick ? 'pointer' : 'default' }}>
      <div className="statIcon" style={{ background: alert ? '#fdecea' : bg, color: alert ? 'var(--red)' : color }}>{icon}</div>
      <div>
        <small>{label.toUpperCase()}</small>
        <h2 style={{ color: alert ? 'var(--red)' : 'inherit' }}>{value}</h2>
      </div>
    </div>
  )
}

function SalesChart({ days }) {
  const [hover, setHover] = useState(null)
  const [table, setTable] = useState(false)
  const max = niceMax(Math.max(...days.map(d => Number(d.sales)), 0))
  const n = days.length
  const hd = hover !== null ? days[hover] : null
  const tipLeft = hover !== null ? Math.min(82, Math.max(18, ((hover + 0.5) / n) * 100)) : 0

  return (
    <div style={card}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 10 }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 14 }}>Daily sales</div>
          <div style={{ fontSize: 11, color: 'var(--muted)' }}>Last 14 days, cancelled and returned orders excluded</div>
        </div>
        <button
          type="button"
          onClick={() => setTable(t => !t)}
          style={{ fontSize: 11, border: '1px solid var(--line)', background: '#fff', borderRadius: 8, padding: '4px 10px', cursor: 'pointer', whiteSpace: 'nowrap' }}
        >
          {table ? 'View chart' : 'View as table'}
        </button>
      </div>

      {table ? (
        <table style={{ width: '100%', marginTop: 12, fontSize: 12 }}>
          <thead><tr><th style={{ textAlign: 'left' }}>Date</th><th style={{ textAlign: 'right' }}>Orders</th><th style={{ textAlign: 'right' }}>Sales</th></tr></thead>
          <tbody>
            {days.map(d => (
              <tr key={d.day}><td>{dayLabel(d.day)}</td><td style={{ textAlign: 'right' }}>{d.orders}</td><td style={{ textAlign: 'right' }}>{fmt(d.sales)}</td></tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div style={{ display: 'flex', marginTop: 54 }}>
          <div style={{ width: 46, position: 'relative', height: 150, flexShrink: 0 }}>
            {[1, 0.5, 0].map(f => (
              <div key={f} style={{ position: 'absolute', right: 8, top: `${(1 - f) * 100}%`, transform: 'translateY(-50%)', fontSize: 10, color: '#888' }}>
                {f === 0 ? '0' : Math.round(max * f).toLocaleString('en-US')}
              </div>
            ))}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ position: 'relative', height: 150, borderBottom: '1px solid var(--line)' }} onMouseLeave={() => setHover(null)}>
              {[0, 0.5].map(f => (
                <div key={f} style={{ position: 'absolute', left: 0, right: 0, top: `${f * 100}%`, borderTop: '1px solid #f0eee9' }} />
              ))}
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'flex-end', gap: 2 }}>
                {days.map((d, i) => {
                  const pct = (Number(d.sales) / max) * 100
                  return (
                    <div
                      key={d.day}
                      tabIndex={0}
                      role="img"
                      aria-label={`${dayLabel(d.day)}: ${fmt(d.sales)}, ${d.orders} orders`}
                      onMouseEnter={() => setHover(i)}
                      onFocus={() => setHover(i)}
                      onBlur={() => setHover(null)}
                      onClick={() => setHover(i)}
                      style={{ flex: 1, height: '100%', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', cursor: 'pointer', outline: 'none' }}
                    >
                      <div style={{
                        width: '100%', maxWidth: 24, height: `${pct}%`, minHeight: Number(d.sales) > 0 ? 2 : 0,
                        background: INK, borderRadius: '4px 4px 0 0', opacity: hover === null || hover === i ? 1 : 0.4,
                        transition: 'opacity .12s'
                      }} />
                    </div>
                  )
                })}
              </div>
              {hd && (
                <div style={{
                  position: 'absolute', left: `${tipLeft}%`, top: -6, transform: 'translate(-50%,-100%)', pointerEvents: 'none',
                  background: '#fff', border: '1px solid var(--line)', borderRadius: 8, padding: '6px 10px',
                  boxShadow: '0 4px 14px rgba(0,0,0,.08)', whiteSpace: 'nowrap', zIndex: 2
                }}>
                  <div style={{ fontWeight: 700, fontSize: 13 }}>{fmt(hd.sales)}</div>
                  <div style={{ fontSize: 11, color: 'var(--muted)' }}>{dayLabel(hd.day)} · {hd.orders} order{hd.orders === 1 ? '' : 's'}</div>
                </div>
              )}
            </div>
            <div style={{ display: 'flex', gap: 2, marginTop: 4 }}>
              {days.map(d => (
                <div key={d.day} style={{ flex: 1, textAlign: 'center', fontSize: 9, color: '#888' }}>{Number(d.day.slice(8))}</div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function ProfitSection({ profit, onNav }) {
  const per = profit.periods || {}
  const empty = { revenue: 0, cost: 0, profit: 0, missing: 0 }
  const cells = [['Today', per.today], ['Last 7 days', per.week], ['Last 30 days', per.month]]
  const margin = d => (d.revenue > 0 ? Math.round((d.profit / d.revenue) * 100) + '% margin' : '—')
  const missingProducts = Number(profit.products_without_cost || 0)

  return (
    <div style={card}>
      <div style={{ fontWeight: 700, fontSize: 14 }}>Profit</div>
      <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 10 }}>Sales minus what the products cost you (delivery charge not counted)</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(104px,1fr))', gap: 10 }}>
        {cells.map(([label, d]) => {
          const v = d || empty
          return (
            <div key={label} style={{ border: '1px solid #eee', borderRadius: 12, padding: 12 }}>
              <div style={cap}>{label}</div>
              <div style={{ fontSize: 20, fontWeight: 700, marginTop: 4, color: v.profit < 0 ? 'var(--red)' : 'inherit' }}>{fmt(v.profit)}</div>
              <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{margin(v)}</div>
            </div>
          )
        })}
      </div>
      {(profit.top || []).length > 0 && (
        <div style={{ marginTop: 12 }}>
          <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 4 }}>Most profitable, last 30 days</div>
          {profit.top.map((p, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', gap: 10, padding: '7px 0', borderTop: i ? '1px solid #f0eee9' : 'none', fontSize: 12 }}>
              <span style={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</span>
              <b style={{ whiteSpace: 'nowrap' }}>{fmt(p.profit)}</b>
            </div>
          ))}
        </div>
      )}
      {missingProducts > 0 && (
        <div onClick={() => onNav('products')} style={{ marginTop: 12, fontSize: 12, color: '#966600', background: '#fff8e5', borderRadius: 10, padding: '8px 10px', cursor: 'pointer' }}>
          {missingProducts} product{missingProducts === 1 ? ' has' : 's have'} no cost price yet, so their sales are not in the profit numbers. Open a product and fill in "Cost price" →
        </div>
      )}
    </div>
  )
}

export default function DashboardInsights({ summary, profit, onNav }) {
  if (!summary) return null
  const { today, week, month, pending, to_ship, daily, top, low_stock } = summary
  const lowCount = (low_stock || []).length

  return (
    <div className="dashInsights">
      <div className="dashboard6">
        <Period label="Today" icon="📅" bg="#e6f4f1" color="#16806b" data={today} />
        <Period label="Last 7 days" icon="📆" bg="#e6eefd" color="#1a5bb8" data={week} />
        <Period label="Last 30 days" icon="🗓️" bg="#f1e9fb" color="#6934c9" data={month} />
        <Attention label="New orders to confirm" icon="🔔" bg="#fff4dc" color="#966600" value={pending} tone="alert" onClick={() => onNav('orders')} />
        <Attention label="Ready to ship" icon="🚚" bg="#e8f5ea" color="#1c8a45" value={to_ship} onClick={() => onNav('orders')} />
        <Attention label="Low stock items" icon="⚠️" bg="#fbeadd" color="#c9701f" value={lowCount} tone="alert" onClick={() => onNav('products')} />
      </div>

      {daily && daily.length > 0 && <SalesChart days={daily} />}

      {profit && <ProfitSection profit={profit} onNav={onNav} />}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: 10 }}>
        <div style={card}>
          <div style={{ fontWeight: 700, fontSize: 14 }}>Best sellers</div>
          <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 8 }}>Last 30 days</div>
          {(top || []).length === 0 && <div style={{ fontSize: 12, color: 'var(--muted)' }}>No sales yet</div>}
          {(top || []).map((p, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', gap: 10, padding: '7px 0', borderTop: i ? '1px solid #f0eee9' : 'none', fontSize: 12 }}>
              <span style={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</span>
              <span style={{ whiteSpace: 'nowrap', color: 'var(--muted)' }}><b style={{ color: '#111' }}>{p.qty}</b> sold · {fmt(p.revenue)}</span>
            </div>
          ))}
        </div>

        <div style={card}>
          <div style={{ fontWeight: 700, fontSize: 14 }}>Low stock</div>
          <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 8 }}>5 or fewer left</div>
          {lowCount === 0 && <div style={{ fontSize: 12, color: 'var(--muted)' }}>✓ Every product has enough stock</div>}
          {(low_stock || []).map((p, i) => (
            <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', gap: 10, padding: '7px 0', borderTop: i ? '1px solid #f0eee9' : 'none', fontSize: 12 }}>
              <span style={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</span>
              <b style={{ whiteSpace: 'nowrap', color: Number(p.stock) <= 0 ? 'var(--red)' : '#966600' }}>{Number(p.stock) <= 0 ? 'Out of stock' : `${p.stock} left`}</b>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
