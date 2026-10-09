// Prints a packing / delivery slip for one order (all of its rows).
// Opens a clean print window; on a phone the print dialog can "Save as PDF".

const SHOP = { name: 'HEAVEN', phone: '01877270165', tagline: 'Premium Fashion in Bangladesh' }

function esc(v) {
  return String(v == null ? '' : v)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;')
}
const money = n => '৳' + Number(n || 0).toLocaleString('en-US')

export function printOrderSlip(order, products) {
  const rows = order._rows && order._rows.length ? order._rows : [order]
  const o = rows[0]
  const byId = {}
  ;(products || []).forEach(p => { byId[p.id] = p })

  // the order's item text looks like "Name (M) x1, Name2 x2" in the same order as the rows
  const parts = (o.items || '').split(', ')
  const useParts = parts.length === rows.length

  let subtotal = 0
  const lines = rows.map((r, i) => {
    const qty = Number(r.quantity || 1)
    const unit = Number(r.unit_price || 0)
    subtotal += unit * qty
    let name = (byId[r.product_id] && byId[r.product_id].name) || 'Item'
    let size = ''
    if (useParts) {
      const m = parts[i].match(/^(.*?)(?: \(([^)]+)\))? x\d+$/)
      if (m) { name = m[1] || name; size = m[2] || '' }
    }
    return `<tr><td>${esc(name)}${size ? ` <b>(${esc(size)})</b>` : ''}</td><td class="c">${qty}</td><td class="r">${money(unit)}</td><td class="r">${money(unit * qty)}</td></tr>`
  }).join('')

  const charge = rows.reduce((s, r) => s + Number(r.delivery_charge || 0), 0)
  const discount = rows.reduce((s, r) => s + Number(r.discount || 0), 0)
  const total = rows.reduce((s, r) => s + Number(r.total_amount || 0), 0)

  const isPickup = o.delivery_method === 'pickup'
  const address = isPickup
    ? 'STORE PICKUP — Mirpur 12, Dhaka'
    : [o.delivery_address || o.address, o.upazila, o.district]
        .filter(Boolean)
        .filter((v, i, a) => a.findIndex(x => x.includes(v) && x !== v) === -1)
        .join(', ')

  let payHtml
  if (o.payment === 'ONLINE' && o.payment_status === 'paid') {
    payHtml = `<div class="pay paid">PAID ONLINE<small>No cash to collect</small></div>`
  } else if (o.payment === 'ONLINE') {
    payHtml = `<div class="pay due">ONLINE PAYMENT PENDING<small>Do not ship until paid</small></div>`
  } else if (!o.payment || o.payment === 'COD') {
    payHtml = `<div class="pay cod">CASH ON DELIVERY<small>Collect ${money(total)}</small></div>`
  } else {
    payHtml = `<div class="pay cod">${esc(o.payment)}<small>Order total ${money(total)}</small></div>`
  }

  const date = o.created_at ? new Date(o.created_at.endsWith('Z') ? o.created_at : o.created_at + 'Z').toLocaleString('en-GB', { timeZone: 'Asia/Dhaka', day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''
  const note = (o.delivery_note || '').trim()

  const html = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Slip ${esc(o.order_ref || o.id)}</title>
<style>
@page{size:A5;margin:8mm}
*{box-sizing:border-box}
body{font-family:Arial,Helvetica,sans-serif;color:#111;margin:0;padding:14px;font-size:13px;line-height:1.4}
.head{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:2px solid #111;padding-bottom:10px;margin-bottom:12px}
.brand{font-size:26px;font-weight:800;letter-spacing:3px}
.brand small{display:block;font-size:10px;letter-spacing:0;font-weight:400;color:#555}
.ref{text-align:right}.ref b{font-size:16px}
h4{margin:12px 0 4px;font-size:11px;letter-spacing:1px;color:#555;text-transform:uppercase}
.box{border:1px solid #bbb;border-radius:6px;padding:8px 10px}
.cust{font-size:15px;font-weight:700}
.addr{font-size:14px;margin-top:2px}
table{width:100%;border-collapse:collapse;margin-top:4px}
th{font-size:10px;text-transform:uppercase;letter-spacing:.5px;text-align:left;border-bottom:1px solid #111;padding:4px 2px}
td{padding:5px 2px;border-bottom:1px solid #ddd;vertical-align:top}
.c{text-align:center}.r{text-align:right}
.sum{margin-left:auto;width:60%;margin-top:8px}
.sum div{display:flex;justify-content:space-between;padding:2px 0}
.sum .t{border-top:2px solid #111;margin-top:4px;padding-top:5px;font-size:16px;font-weight:800}
.pay{margin-top:12px;text-align:center;padding:10px;border:2px solid #111;border-radius:8px;font-size:18px;font-weight:800}
.pay small{display:block;font-size:14px;font-weight:700;margin-top:2px}
.pay.paid{background:#111;color:#fff}
.note{margin-top:8px;font-size:12px;color:#333}
.foot{margin-top:14px;text-align:center;font-size:11px;color:#555}
</style></head><body>
<div class="head">
  <div class="brand">${SHOP.name}<small>${SHOP.tagline}</small></div>
  <div class="ref"><b>#${esc(o.order_ref || o.id)}</b><br>${esc(date)}</div>
</div>
<h4>Deliver to</h4>
<div class="box"><div class="cust">${esc(o.customer || '')}</div>
<div class="cust" style="font-weight:600">${esc(o.delivery_phone || o.phone || '')}</div>
<div class="addr">${esc(address)}</div></div>
<h4>Items</h4>
<table><thead><tr><th>Product</th><th class="c">Qty</th><th class="r">Price</th><th class="r">Total</th></tr></thead><tbody>${lines}</tbody></table>
<div class="sum">
  <div><span>Subtotal</span><span>${money(subtotal)}</span></div>
  <div><span>Delivery</span><span>${charge ? money(charge) : 'Free'}</span></div>
  ${discount ? `<div><span>Discount${o.coupon_code ? ' (' + esc(o.coupon_code) + ')' : ''}</span><span>− ${money(discount)}</span></div>` : ''}
  <div class="t"><span>TOTAL</span><span>${money(total)}</span></div>
</div>
${payHtml}
${note ? `<div class="note"><b>Note:</b> ${esc(note)}</div>` : ''}
<div class="foot">Thank you for shopping with ${SHOP.name} · Support: ${SHOP.phone}</div>
<script>window.onload=function(){setTimeout(function(){window.print()},250)}</script>
</body></html>`

  const w = window.open('', '_blank')
  if (!w) return false
  w.document.open()
  w.document.write(html)
  w.document.close()
  return true
}
