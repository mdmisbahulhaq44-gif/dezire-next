'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useShop } from './ShopContext'
import {
  DHAKA_CITY, DEFAULT_SETTINGS, fetchDeliverySettings,
  deliveryFor, couponDiscount, getProfile, setProfile, saveOrder
} from '../lib/checkout'

const homeIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="19" height="19">
    <path d="M3 10.5 12 3l9 7.5" /><path d="M5 9.5V21h14V9.5" /><path d="M9.5 21v-6.5h5V21" />
  </svg>
)
const storeIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="19" height="19">
    <path d="M3 9.5 12 4l9 5.5" /><path d="M4.5 9v10a1 1 0 0 0 1 1h13a1 1 0 0 0 1-1V9" /><path d="M9 20v-5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v5" />
  </svg>
)
const officeIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
    <rect x="3" y="7" width="18" height="12" rx="2" /><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><path d="M3 12h18" />
  </svg>
)

export default function CheckoutPanel() {
  const { cart, cartSubtotal, activePanel, closePanel, clearCart, showToast, setLastOrder, openSuccess, lastOrder, paymentReturn } = useShop()
  const show = activePanel === 'checkout'
  const showSuccess = activePanel === 'success'

  const [loaded, setLoaded] = useState(false)
  const [settings, setSettings] = useState(DEFAULT_SETTINGS)
  const [regions, setRegions] = useState([])
  const [cities, setCities] = useState([])
  const [areas, setAreas] = useState([])
  const [subAreas, setSubAreas] = useState([])

  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [method, setMethod] = useState('home_delivery')
  const [region, setRegion] = useState('')
  const [city, setCity] = useState('')
  const [area, setArea] = useState('')
  const [subArea, setSubArea] = useState('')
  const [address, setAddress] = useState('')
  const [addrType, setAddrType] = useState('Home')
  const [note, setNote] = useState('')
  const [couponInput, setCouponInput] = useState('')
  const [coupon, setCoupon] = useState(null)
  const [couponMsg, setCouponMsg] = useState({ text: '', bad: false })
  const [payment, setPayment] = useState('COD')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!show || loaded) return
    setLoaded(true)
    const p = getProfile()
    if (p) { setName(p.name || ''); setPhone(p.phone || '') }
    fetchDeliverySettings().then(setSettings)
    supabase.from('divisions').select('id,name_en,name').order('name_en', { ascending: true })
      .then(({ data }) => {
        if (data) setRegions(data.map(d => ({ id: d.id, label: d.name_en || d.name })))
      })
  }, [show, loaded])

  async function onRegion(label) {
    setRegion(label); setCity(''); setArea(''); setSubArea('')
    setCities([]); setAreas([]); setSubAreas([])
    const r = regions.find(x => x.label === label)
    if (!r) return
    const { data, error } = await supabase
      .from('districts').select('id,name_en,name')
      .eq('division_id', r.id).order('name_en', { ascending: true })
    if (error || !data) return
    const isDhakaDivision = label.toLowerCase().includes('dhaka')
    const list = []
    if (isDhakaDivision) list.push({ id: null, value: DHAKA_CITY, label: 'Dhaka City' })
    data.forEach(d => {
      let l = d.name_en || d.name
      if (isDhakaDivision && l.toLowerCase() === 'dhaka') l = 'Dhaka District'
      list.push({ id: d.id, value: l, label: l })
    })
    setCities(list)
  }

  async function onCity(value) {
    setCity(value); setArea(''); setSubArea(''); setAreas([]); setSubAreas([])
    if (!value) return
    if (value === DHAKA_CITY) {
      const { data, error } = await supabase
        .from('dhaka_city_areas').select('id,name_en,name_bn').order('name_en', { ascending: true })
      if (error || !data) return
      setAreas(data.map(a => ({ id: a.id, label: a.name_en || a.name_bn })))
      return
    }
    const c = cities.find(x => x.value === value)
    if (!c) return
    const { data, error } = await supabase
      .from('upazilas').select('id,name_en,name')
      .eq('district_id', c.id).order('name_en', { ascending: true })
    if (error || !data) return
    setAreas(data.map(u => ({ id: u.id, label: u.name_en || u.name })))
  }

  async function onArea(label) {
    setArea(label); setSubArea(''); setSubAreas([])
    if (!label) return
    const a = areas.find(x => x.label === label)
    if (!a) return
    if (city === DHAKA_CITY) {
      const { data, error } = await supabase
        .from('dhaka_city_sub_areas').select('name_en,name_bn')
        .eq('area_id', a.id).order('name_en', { ascending: true })
      if (error || !data) return
      setSubAreas(data.map(s => s.name_en || s.name_bn))
      return
    }
    const { data, error } = await supabase
      .from('unions').select('name_en,name')
      .eq('upazila_id', a.id).order('name_en', { ascending: true })
    if (error || !data) return
    setSubAreas(data.map(u => u.name_en || u.name))
  }

  async function applyCoupon() {
    const code = couponInput.trim()
    if (!code) { showToast('Please enter a coupon code.'); return }
    // escape LIKE wildcards so "%" or "_" can't match other codes
    const safe = code.replace(/[\\%_]/g, m => '\\' + m)
    const { data, error } = await supabase
      .from('coupons').select('code,type,value,minorder,active,expires')
      .ilike('code', safe).maybeSingle()

    if (error || !data || !data.active) {
      setCoupon(null); setCouponMsg({ text: 'Invalid or inactive coupon code.', bad: true }); return
    }
    if (data.expires && new Date(data.expires) < new Date()) {
      setCoupon(null); setCouponMsg({ text: 'This coupon has expired.', bad: true }); return
    }
    if (data.minorder && cartSubtotal < Number(data.minorder)) {
      setCoupon(null)
      setCouponMsg({ text: `Minimum order ৳${Number(data.minorder).toLocaleString()} required for this coupon.`, bad: true })
      return
    }
    setCoupon(data)
    setCouponMsg({ text: `Coupon "${data.code}" applied!`, bad: false })
  }

  const delivery = deliveryFor(settings, cartSubtotal, method, city)
  const discount = couponDiscount(coupon, cartSubtotal)
  const total = cartSubtotal - discount + delivery.charge

  async function placeOrder(e) {
    e.preventDefault()
    if (busy) return
    if (!cart.length) { showToast('Your cart is empty.'); return }
    const nm = name.trim()
    const ph = phone.trim()
    if (!nm || !ph) { showToast('Please fill in your name and phone number.'); return }
    if (method === 'home_delivery' && (!region || !city || !area || !address.trim())) {
      showToast('Please fill in region, city, area and address.'); return
    }

    setBusy(true)
    try {
      let profile = getProfile()
      if (!profile || !profile.id) {
        const { data: newId, error: pErr } = await supabase.rpc('create_customer_profile', {
          p_name: nm, p_phone: ph, p_email: null
        })
        if (pErr || !newId) {
          console.error(pErr)
          showToast('Could not save your details. Please try again.')
          setBusy(false); return
        }
        profile = { id: newId, name: nm, phone: ph, email: null }
      }

      const { data: sessionData } = await supabase.auth.getSession()
      const userId = sessionData && sessionData.session ? sessionData.session.user.id : null

      const cityLabel = city === DHAKA_CITY ? 'Dhaka City' : city
      const isHome = method === 'home_delivery'
      const addr = isHome ? address.trim() : settings.pickup_address
      const fullAddress = [addr, isHome ? area : '', isHome ? subArea : '', isHome ? cityLabel : '', isHome ? region : '']
        .filter(Boolean).join(', ')
      const couponCode = coupon ? coupon.code : ''
      const charge = delivery.charge
      const orderRef = 'VN' + Date.now().toString().slice(-8)
      const itemsText = cart.map(i => `${i.name}${i.size ? ` (${i.size})` : ''} x${i.qty}`).join(', ')

      const rows = cart.map((item, idx) => ({
        customer: nm,
        phone: ph,
        user_id: userId,
        customer_id: profile.id,
        address: addr,
        items: itemsText,
        payment: payment,
        status: 'Pending',
        date: new Date().toISOString(),
        order_ref: orderRef,
        district: isHome ? cityLabel : '',
        upazila: isHome ? area : '',
        delivery_method: method,
        delivery_address: fullAddress,
        delivery_phone: ph,
        delivery_note: [
          isHome && subArea ? `${city === DHAKA_CITY ? 'Sub Area' : 'Union'}: ${subArea}` : '',
          isHome && addrType ? `Address Type: ${addrType}` : '',
          couponCode ? `Coupon: ${couponCode} (−৳${discount.toLocaleString()})` : '',
          note.trim()
        ].filter(Boolean).join(' | '),
        delivery_charge: idx === 0 ? charge : 0,
        unit_price: item.price,
        total_amount: idx === 0 ? (item.price * item.qty) + charge - discount : (item.price * item.qty),
        product_id: item.id,
        quantity: item.qty
      }))

      const { error } = await supabase.from('orders').insert(rows)
      if (error) {
        console.error(error)
        showToast('Order failed: ' + (error.message || 'Unknown error'))
        setBusy(false); return
      }

      // Stock is reduced inside the database when the order row is inserted.
      saveOrder(orderRef, ph)

      const purchaseTotal = cartSubtotal - discount + charge

      if (typeof window.fbq === 'function') window.fbq('track', 'Purchase', { value: purchaseTotal, currency: 'BDT', content_ids: cart.map(i => String(i.id)), content_type: 'product', num_items: cart.reduce((s, i) => s + i.qty, 0) })
      if (typeof window.gtag === 'function') window.gtag('event', 'purchase', { transaction_id: orderRef, value: purchaseTotal, currency: 'BDT', items: cart.map(i => ({ item_id: String(i.id), item_name: i.name, price: i.price, quantity: i.qty })) })

      if (payment === 'ONLINE') {
        try {
          const { data: chargeData, error: chargeError } = await supabase.functions.invoke('create-charge', {
            body: { orderRef, fullName: nm, amount: purchaseTotal }
          })
          if (chargeError || !chargeData || !chargeData.payment_url) {
            console.error('create-charge failed:', chargeError, chargeData)
            showToast('Could not start online payment. Please try Cash on Delivery, or contact us — your order is saved as #' + orderRef + '.')
            setBusy(false); return
          }
          clearCart()
          window.location.href = chargeData.payment_url
          return
        } catch (err) {
          console.error('create-charge error:', err)
          showToast('Could not start online payment. Please try Cash on Delivery, or contact us — your order is saved as #' + orderRef + '.')
          setBusy(false); return
        }
      }

      const methodLabel = method === 'pickup'
        ? 'Store Pickup (Mirpur 12)'
        : `Home Delivery — ${cityLabel}${area ? ', ' + area : ''}${subArea ? ', ' + subArea : ''}`
      const waText = encodeURIComponent(
        `New Order #${orderRef}\n` +
        `Name: ${nm}\n` +
        `Phone: ${ph}\n` +
        `Items: ${itemsText}\n` +
        `Delivery: ${methodLabel}\n` +
        (addr ? `Address: ${addr}\n` : '') +
        (note.trim() ? `Note: ${note.trim()}\n` : '') +
        `Total: ৳${purchaseTotal.toLocaleString()} (Cash on Delivery)`
      )
      const waNumber = (settings.whatsapp_number || '8801877270165').replace(/\D/g, '')

      setProfile({ ...profile, name: nm, phone: ph })
      setLastOrder({
        orderRef, total: purchaseTotal, methodLabel,
        waUrl: `https://wa.me/${waNumber}?text=${waText}`
      })
      clearCart()
      setCoupon(null); setCouponInput(''); setCouponMsg({ text: '', bad: false })
      setNote(''); setAddress('')
      openSuccess()
    } catch (err) {
      console.error(err)
      showToast('Something went wrong. Please try again.')
    }
    setBusy(false)
  }

  return (
    <>
      <div className={`panel${show ? ' show' : ''}`}>
        <div className="panelHead">
          <h2>Checkout</h2>
          <button className="close" onClick={closePanel}>×</button>
        </div>

        <form className="form" onSubmit={placeOrder}>
          <label>FULL NAME</label>
          <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Your full name" required />

          <label>PHONE NUMBER</label>
          <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="01XXXXXXXXX" required />

          <label>DELIVERY METHOD</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <label className="optionPick">
              <input type="radio" name="coMethod" checked={method === 'home_delivery'} onChange={() => setMethod('home_delivery')} />
              <span className="opIcon">{homeIcon}</span>
              <span className="opTitle">Home Delivery</span>
            </label>
            <label className="optionPick">
              <input type="radio" name="coMethod" checked={method === 'pickup'} onChange={() => setMethod('pickup')} />
              <span className="opIcon">{storeIcon}</span>
              <span className="opTitle">Store Pickup</span>
              <span style={{ marginLeft: 'auto', fontSize: 12, fontWeight: 600, color: 'var(--muted)' }}>Free</span>
            </label>
          </div>

          {method === 'home_delivery' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <label htmlFor="coRegion">REGION</label>
              <select id="coRegion" aria-label="Select Region" value={region} onChange={e => onRegion(e.target.value)}>
                <option value="">Select Region</option>
                {regions.map(r => <option key={r.id} value={r.label}>{r.label}</option>)}
              </select>

              <label htmlFor="coCity">CITY</label>
              <select id="coCity" aria-label="Select City" value={city} onChange={e => onCity(e.target.value)} disabled={!cities.length}>
                <option value="">Select City</option>
                {cities.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>

              <label htmlFor="coArea">AREA</label>
              <select id="coArea" aria-label="Select Area" value={area} onChange={e => onArea(e.target.value)} disabled={!areas.length}>
                <option value="">Select Area</option>
                {areas.map(a => <option key={a.id} value={a.label}>{a.label}</option>)}
              </select>

              {areas.length > 0 && (
                <>
                  <label htmlFor="coSubArea">{city === DHAKA_CITY ? 'SUB AREA (OPTIONAL)' : 'UNION'}</label>
                  <select id="coSubArea" aria-label={city === DHAKA_CITY ? 'Select Subarea' : 'Select Union'} value={subArea} onChange={e => setSubArea(e.target.value)} disabled={!subAreas.length}>
                    <option value="">{city === DHAKA_CITY ? 'Select Subarea' : 'Select Union'}</option>
                    {subAreas.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </>
              )}

              <label>ADDRESS</label>
              <textarea value={address} onChange={e => setAddress(e.target.value)} placeholder="Type House, Flat No, Road" />

              <label>ADDRESS TYPE</label>
              <div className="radioRow" style={{ gap: 10 }}>
                <label className="optionPick" style={{ flex: 1 }}>
                  <input type="radio" name="coAddrType" checked={addrType === 'Home'} onChange={() => setAddrType('Home')} />
                  <span className="opIcon">{homeIcon}</span>
                  <span className="opTitle">Home</span>
                </label>
                <label className="optionPick" style={{ flex: 1 }}>
                  <input type="radio" name="coAddrType" checked={addrType === 'Office'} onChange={() => setAddrType('Office')} />
                  <span className="opIcon">{officeIcon}</span>
                  <span className="opTitle">Office</span>
                </label>
              </div>
            </div>
          ) : (
            <div style={{ fontSize: 12, color: 'var(--muted)', background: '#f5f4f1', padding: 14, borderRadius: 8 }}>
              Collect your order from our store:<br />
              <b>{settings.pickup_address}</b>
            </div>
          )}

          <label>ORDER NOTE (OPTIONAL)</label>
          <textarea value={note} onChange={e => setNote(e.target.value)} placeholder="Any special instruction..." />

          <label>COUPON CODE (OPTIONAL)</label>
          <div style={{ display: 'flex', gap: 8 }}>
            <input type="text" value={couponInput} onChange={e => setCouponInput(e.target.value)} placeholder="Enter coupon code" style={{ flex: 1, textTransform: 'uppercase' }} />
            <button type="button" className="btn light" style={{ padding: '14px 18px' }} onClick={applyCoupon}>APPLY</button>
          </div>
          <div style={{ fontSize: 11, color: couponMsg.bad ? 'var(--red)' : 'var(--gold)' }}>{couponMsg.text}</div>

          <div style={{ marginTop: 8 }}>
            <div className="summaryRow"><span>Subtotal</span><span>৳{cartSubtotal.toLocaleString()}</span></div>
            {discount > 0 && (
              <div className="summaryRow" style={{ color: 'var(--gold)' }}>
                <span>Discount ({coupon.code})</span><span>−৳{discount.toLocaleString()}</span>
              </div>
            )}
            <div className="summaryRow">
              <span>{delivery.label}</span>
              <span>{delivery.isFree ? 'FREE' : '৳' + delivery.charge.toLocaleString()}</span>
            </div>
            <div className="summaryRow total"><span>Total</span><span>৳{total.toLocaleString()}</span></div>
          </div>

          <label>PAYMENT METHOD</label>
          <div className="payMethodList">
            <label className="payOption">
              <div className="payOptionHead">
                <input type="radio" name="coPayment" checked={payment === 'COD'} onChange={() => setPayment('COD')} />
                <span className="payOptionTitle">Cash on Delivery</span>
              </div>
              <div className="payOptionDesc">Pay in cash when your order arrives at the door.</div>
            </label>
            <label className="payOption">
              <div className="payOptionHead">
                <input type="radio" name="coPayment" checked={payment === 'ONLINE'} onChange={() => setPayment('ONLINE')} />
                <span className="payOptionTitle">Pay Online</span>
              </div>
              <div className="payOptionDesc" style={{ display: 'block' }}>
                🔒 Secured &amp; verified by Paymently
                <div className="paymentLogosRow">
                  {(settings.payment_logos || []).map((url, i) => (
                    <img key={i} src={url} alt="" onError={e => { e.currentTarget.style.display = 'none' }} />
                  ))}
                </div>
              </div>
            </label>
          </div>

          <button type="submit" className="btn light" disabled={busy || cart.length === 0}
            style={{ border: '1.5px solid #111', padding: '14px 46px', marginTop: 10 }}>
            {busy ? 'PLACING ORDER...' : 'PLACE ORDER'}
          </button>
        </form>
      </div>

      <div className={`panel${showSuccess ? ' show' : ''}`}>
        <div className="panelHead">
          <h2>{paymentReturn ? (paymentReturn.isPaid ? 'Payment Successful!' : 'Payment Not Completed') : 'Order Placed!'}</h2>
          <button className="close" onClick={closePanel}>×</button>
        </div>
        {paymentReturn && (
          <div style={{ textAlign: 'center', padding: '10px 0' }}>
            <div style={{
              width: 64, height: 64, borderRadius: '50%',
              background: paymentReturn.isPaid ? 'rgba(26,92,74,.08)' : 'rgba(217,119,6,.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px'
            }}>
              {paymentReturn.isPaid ? (
                <svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="#1a5c4a" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 13l4 4L19 7" /></svg>
              ) : (
                <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#d97706" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 9v4" /><path d="M12 17h.01" /><circle cx="12" cy="12" r="9" /></svg>
              )}
            </div>
            <p style={{ fontSize: 13, marginBottom: 20 }}>
              {paymentReturn.isPaid
                ? <>Your payment has been received and your order is confirmed.<br />We'll contact you shortly.</>
                : <>Your order is saved, but the payment wasn't completed.<br />You can retry payment or contact us to arrange Cash on Delivery.</>}
            </p>
            <div style={{ textAlign: 'left' }}>
              <div className="summaryRow"><span>Order ID</span><b>#{paymentReturn.orderRef}</b></div>
              <div className="summaryRow"><span>Total Amount</span><b>৳{paymentReturn.total.toLocaleString()}</b></div>
              <div className="summaryRow"><span>Delivery</span><b>{paymentReturn.methodLabel}</b></div>
            </div>
            <button className="btn light" type="button" style={{ width: '100%', border: '1.5px solid #111', marginTop: 16 }} onClick={closePanel}>
              CONTINUE SHOPPING
            </button>
          </div>
        )}
        {!paymentReturn && lastOrder && (
          <div style={{ textAlign: 'center', padding: '10px 0' }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(46,125,50,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="#2e7d32" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
            </div>
            <p style={{ fontSize: 13, marginBottom: 20 }}>
              Thank you! Your order has been received.<br />We'll contact you shortly to confirm.
            </p>
            <div style={{ textAlign: 'left' }}>
              <div className="summaryRow"><span>Order ID</span><b>#{lastOrder.orderRef}</b></div>
              <div className="summaryRow"><span>Total Amount</span><b>৳{lastOrder.total.toLocaleString()}</b></div>
              <div className="summaryRow"><span>Delivery</span><b>{lastOrder.methodLabel}</b></div>
            </div>
            <p style={{ fontSize: 11.5, color: 'var(--muted)', margin: '16px 0' }}>
              Save this Order ID and your phone number — you can use them anytime to track your order.
            </p>
            <a className="btn light" href={lastOrder.waUrl} target="_blank" rel="noopener noreferrer"
              style={{ display: 'block', border: '1px solid #111', marginBottom: 10 }}>
              CONFIRM VIA WHATSAPP
            </a>
            <button className="btn light" type="button" style={{ width: '100%', border: '1.5px solid #111' }} onClick={closePanel}>
              CONTINUE SHOPPING
            </button>
          </div>
        )}
      </div>
    </>
  )
}
