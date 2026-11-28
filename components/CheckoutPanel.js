'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { getWallet, refreshWallet, subscribeWallet } from '../lib/walletCache'
import { useShop } from './ShopContext'
import {
  DHAKA_CITY, DEFAULT_SETTINGS, fetchDeliverySettings,
  deliveryFor, getProfile, setProfile, saveOrder
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
  const { cart, cartSubtotal, activePanel, closePanel, clearCart, showToast, setLastOrder, openSuccess, lastOrder, paymentReturn, openAccount, t } = useShop()
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
  const [uid, setUid] = useState(null)
  const [authChecked, setAuthChecked] = useState(false)
  const [walletBal, setWalletBal] = useState(0)
  const [useWallet, setUseWallet] = useState(true)
  const [showCoupon, setShowCoupon] = useState(false)
  const [tried, setTried] = useState(false)
  const [seen, setSeen] = useState({})
  const tt = x => t(x) || x
  const seeIt = k => setSeen(o => ({ ...o, [k]: true }))
  const bad = (k, v) => ((tried || seen[k]) && !String(v || '').trim() ? ' ckBad' : '')

  // wallet balance of the logged-in customer (the server re-checks it when the order is placed)
  useEffect(() => {
    if (!show) return
    let live = true
    let off = () => {}
    supabase.auth.getSession().then(({ data }) => {
      if (!live) return
      const id = data.session ? data.session.user.id : null
      setUid(id)
      setAuthChecked(true)
      if (!id) { setWalletBal(0); return }
      const w = getWallet(id)
      if (w) setWalletBal(Number(w.balance))
      off = subscribeWallet((u, d) => { if (live && u === id) setWalletBal(Number(d.balance)) })
      refreshWallet(id)
    })
    return () => { live = false; off() }
  }, [show])

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

  // The server decides whether the coupon works and how much it takes off
  async function runCoupon(code) {
    const { data, error } = await supabase.rpc('check_coupon', {
      p_code: code,
      p_items: cart.map(i => ({ id: i.id, qty: i.qty })),
      p_phone: phone.trim()
    })
    if (error || !data) return { ok: false, error: 'Could not check the coupon. Please try again.' }
    return data
  }

  async function applyCoupon() {
    const code = couponInput.trim()
    if (!code) { showToast(t('Please enter a coupon code.')); return }
    const r = await runCoupon(code)
    if (!r.ok) {
      setCoupon(null); setCouponMsg({ text: r.error, bad: true }); return
    }
    setCoupon({ code: r.code, discount: Number(r.discount) })
    setCouponMsg({ text: `Coupon "${r.code}" applied!`, bad: false })
  }

  // Re-check an applied coupon when the cart or phone number changes
  const cartKey = cart.map(i => i.id + 'x' + i.qty).join(',')
  useEffect(() => {
    if (!coupon) return
    let alive = true
    const t = setTimeout(async () => {
      const r = await runCoupon(coupon.code)
      if (!alive) return
      if (!r.ok) { setCoupon(null); setCouponMsg({ text: r.error, bad: true }) }
      else if (Number(r.discount) !== coupon.discount) setCoupon({ code: r.code, discount: Number(r.discount) })
    }, 500)
    return () => { alive = false; clearTimeout(t) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cartKey, phone, coupon?.code])

  const delivery = deliveryFor(settings, cartSubtotal, method, city)
  const discount = coupon ? Math.min(Number(coupon.discount) || 0, cartSubtotal) : 0
  const total = cartSubtotal - discount + delivery.charge
  const walletUse = useWallet && walletBal > 0 ? Math.min(walletBal, Math.max(total, 0)) : 0
  const payable = total - walletUse

  // coupon messages come from the server in English; show them in the chosen language
  function cErr(msg) {
    if (!msg) return msg
    let m = /^Minimum order ৳(.+)$/.exec(msg)
    if (m) return t('Minimum order ৳{n}', { n: m[1] })
    m = /^Coupon "(.+)" applied!$/.exec(msg)
    if (m) return t('Coupon "{c}" applied!', { c: m[1] })
    return t(msg)
  }

  async function placeOrder(e) {
    e.preventDefault()
    if (busy) return
    setTried(true)
    if (!uid) { showToast(t('Please log in to place your order.')); return }
    if (!cart.length) { showToast(t('Your cart is empty.')); return }
    const nm = name.trim()
    const ph = phone.trim()
    if (!nm || !ph) { showToast(t('Please fill in your name and phone number.')); return }
    if (method === 'home_delivery' && (!region || !city || !area || !address.trim())) {
      showToast(t('Please fill in region, city, area and address.')); return
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
          showToast(t('Could not save your details. Please try again.'))
          setBusy(false); return
        }
        profile = { id: newId, name: nm, phone: ph, email: null }
      }

      const cityLabel = city === DHAKA_CITY ? 'Dhaka City' : city
      const isHome = method === 'home_delivery'
      const addr = isHome ? address.trim() : settings.pickup_address
      const fullAddress = [addr, isHome ? area : '', isHome ? subArea : '', isHome ? cityLabel : '', isHome ? region : '']
        .filter(Boolean).join(', ')
      const noteBase = [
        isHome && subArea ? `${city === DHAKA_CITY ? 'Sub Area' : 'Union'}: ${subArea}` : '',
        isHome && addrType ? `Address Type: ${addrType}` : '',
        note.trim()
      ].filter(Boolean).join(' | ')

      // The server prices the order itself (products, coupon, delivery charge, stock).
      const { data: result, error } = await supabase.rpc('place_order', {
        p_name: nm,
        p_phone: ph,
        p_customer_id: profile.id,
        p_items: cart.map(i => ({ id: i.id, qty: i.qty, size: i.size || null })),
        p_method: method,
        p_city: isHome ? cityLabel : '',
        p_address: addr,
        p_area: isHome ? area : '',
        p_delivery_address: fullAddress,
        p_note: noteBase,
        p_coupon: coupon ? coupon.code : '',
        p_payment: payment,
        p_use_wallet: !!(useWallet && walletBal > 0)
      })
      if (error || !result) {
        console.error(error)
        showToast(t('Order failed: {m}', { m: (error && error.message) || 'Unknown error' }))
        setBusy(false); return
      }

      const orderRef = result.order_ref
      const itemsText = result.items_text
      const charge = Number(result.delivery_charge)
      const purchaseTotal = Number(result.total)
      const dueNow = result.due != null ? Number(result.due) : purchaseTotal
      saveOrder(orderRef, ph)
      if (uid) refreshWallet(uid)

      if (typeof window.fbq === 'function') window.fbq('track', 'Purchase', { value: purchaseTotal, currency: 'BDT', content_ids: cart.map(i => String(i.id)), content_type: 'product', num_items: cart.reduce((s, i) => s + i.qty, 0) })
      if (typeof window.gtag === 'function') window.gtag('event', 'purchase', { transaction_id: orderRef, value: purchaseTotal, currency: 'BDT', items: cart.map(i => ({ item_id: String(i.id), item_name: i.name, price: i.price, quantity: i.qty })) })

      if (payment === 'ONLINE' && dueNow > 0) {
        try {
          const { data: chargeData, error: chargeError } = await supabase.functions.invoke('create-charge', {
            body: { orderRef, fullName: nm, amount: purchaseTotal, web: !document.documentElement.hasAttribute('data-app') }
          })
          if (chargeError || !chargeData || !chargeData.payment_url) {
            console.error('create-charge failed:', chargeError, chargeData)
            showToast(t('Could not start online payment. Please try Cash on Delivery, or contact us — your order is saved as #{r}.', { r: orderRef }))
            setBusy(false); return
          }
          // the cart is emptied after the payment return is confirmed
          window.location.href = chargeData.payment_url
          return
        } catch (err) {
          console.error('create-charge error:', err)
          showToast(t('Could not start online payment. Please try Cash on Delivery, or contact us — your order is saved as #{r}.', { r: orderRef }))
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
      showToast(t('Something went wrong. Please try again.'))
    }
    setBusy(false)
  }

  return (
    <>
      <div className={`panel ckPanel${show ? ' show' : ''}`}>
        <div className="ckHead">
          <h2 className="ckTitle">{tt('Checkout')}</h2>
          <button className="close" onClick={closePanel}>×</button>
        </div>

        {authChecked && !uid && (
          <div className="ckInfo">
            {tt('Returning customer?')}{' '}
            <a href="#" onClick={e => { e.preventDefault(); openAccount() }}>{tt('Click here to login')}</a>
          </div>
        )}

        {authChecked && uid && (
          <>
            <div className="ckInfo">
              {tt('Have a coupon?')}{' '}
              <a href="#" onClick={e => { e.preventDefault(); setShowCoupon(v => !v) }}>{tt('Click here to enter your code')}</a>
            </div>
            {showCoupon && (
              <div className="ckCoupon">
                <p>{tt('If you have a coupon code, please apply it below.')}</p>
                <p className="ckRow"><input type="text" className="ckIn" value={couponInput} onChange={e => setCouponInput(e.target.value)} placeholder={tt('Coupon code')} /></p>
                <p className="ckRow"><button type="button" className="ckBtn" onClick={applyCoupon}>{tt('Apply coupon')}</button></p>
                {couponMsg.text && <p className={`ckMsg${couponMsg.bad ? ' bad' : ''}`}>{cErr(couponMsg.text)}</p>}
              </div>
            )}
          </>
        )}

        {authChecked && !uid && (
          <p className="ckNote">{tt('Log in or create a free account to place your order. Your cart is saved and will be waiting for you.')}</p>
        )}

        <form className="ckForm" onSubmit={placeOrder} noValidate style={authChecked && !uid ? { display: 'none' } : undefined}>
          <h3 className="ckH3">{tt('Billing details')}</h3>

          <p className="ckRow">
            <label htmlFor="coName">{tt('Name')}&nbsp;<span className="ckReq">*</span></label>
            <input id="coName" type="text" className={`ckIn${bad('name', name)}`} value={name} onChange={e => setName(e.target.value)} onBlur={() => seeIt('name')} autoComplete="name" />
          </p>

          <p className="ckRow">
            <label htmlFor="coPhone">{tt('Phone')}&nbsp;<span className="ckReq">*</span></label>
            <input id="coPhone" type="tel" className={`ckIn${bad('phone', phone)}`} value={phone} onChange={e => setPhone(e.target.value)} onBlur={() => seeIt('phone')} autoComplete="tel" />
          </p>

          <div className="ckRow">
            <label>{tt('Delivery method')}</label>
            <ul className="ckPayList ckShipList">
              <li>
                <label className="ckOpt">
                  <input type="radio" name="coMethod" checked={method === 'home_delivery'} onChange={() => setMethod('home_delivery')} />
                  {tt('Home Delivery')}
                </label>
              </li>
              <li>
                <label className="ckOpt">
                  <input type="radio" name="coMethod" checked={method === 'pickup'} onChange={() => setMethod('pickup')} />
                  {tt('Store Pickup')} ({tt('Free')})
                </label>
              </li>
            </ul>
          </div>

          {method === 'home_delivery' ? (
            <>
              <p className="ckRow">
                <label htmlFor="coRegion">{tt('Region')}&nbsp;<span className="ckReq">*</span></label>
                <select id="coRegion" className={`ckIn ckSel${bad('region', region)}`} aria-label="Select Region" value={region} onChange={e => onRegion(e.target.value)} onBlur={() => seeIt('region')}>
                  <option value="">{t('Select Region')}</option>
                  {regions.map(r => <option key={r.id} value={r.label}>{r.label}</option>)}
                </select>
              </p>

              <p className="ckRow">
                <label htmlFor="coCity">{tt('City / District')}&nbsp;<span className="ckReq">*</span></label>
                <select id="coCity" className={`ckIn ckSel${bad('city', city)}`} aria-label="Select City" value={city} onChange={e => onCity(e.target.value)} onBlur={() => seeIt('city')} disabled={!cities.length}>
                  <option value="">{t('Select City')}</option>
                  {cities.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </p>

              <p className="ckRow">
                <label htmlFor="coArea">{tt('Area / Thana')}&nbsp;<span className="ckReq">*</span></label>
                <select id="coArea" className={`ckIn ckSel${bad('area', area)}`} aria-label="Select Area" value={area} onChange={e => onArea(e.target.value)} onBlur={() => seeIt('area')} disabled={!areas.length}>
                  <option value="">{t('Select Area')}</option>
                  {areas.map(a => <option key={a.id} value={a.label}>{a.label}</option>)}
                </select>
              </p>

              {areas.length > 0 && (
                <p className="ckRow">
                  <label htmlFor="coSubArea">
                    {city === DHAKA_CITY ? tt('Sub area') : tt('Union')}&nbsp;
                    {city === DHAKA_CITY && <span className="ckOptional">({tt('optional')})</span>}
                  </label>
                  <select id="coSubArea" className="ckIn ckSel" aria-label={city === DHAKA_CITY ? 'Select Subarea' : 'Select Union'} value={subArea} onChange={e => setSubArea(e.target.value)} disabled={!subAreas.length}>
                    <option value="">{t(city === DHAKA_CITY ? 'Select Subarea' : 'Select Union')}</option>
                    {subAreas.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </p>
              )}

              <p className="ckRow">
                <label htmlFor="coAddress">{tt('Street address')}&nbsp;<span className="ckReq">*</span></label>
                <textarea id="coAddress" rows="2" className={`ckIn${bad('address', address)}`} value={address} onChange={e => setAddress(e.target.value)} onBlur={() => seeIt('address')} placeholder={tt('House number and street name')} />
              </p>

              <div className="ckRow">
                <label>{tt('Address type')}</label>
                <ul className="ckPayList ckShipList">
                  <li>
                    <label className="ckOpt">
                      <input type="radio" name="coAddrType" checked={addrType === 'Home'} onChange={() => setAddrType('Home')} />
                      {tt('Home')}
                    </label>
                  </li>
                  <li>
                    <label className="ckOpt">
                      <input type="radio" name="coAddrType" checked={addrType === 'Office'} onChange={() => setAddrType('Office')} />
                      {tt('Office')}
                    </label>
                  </li>
                </ul>
              </div>
            </>
          ) : (
            <div className="ckPayBox ckPickBox">
              <p>{tt('Collect your order from our store:')}<br /><b>{settings.pickup_address}</b></p>
            </div>
          )}

          <h3 className="ckH3">{tt('Additional information')}</h3>
          <p className="ckRow">
            <label htmlFor="coNote">{tt('Order notes')}&nbsp;<span className="ckOptional">({tt('optional')})</span></label>
            <textarea id="coNote" rows="2" className="ckIn" value={note} onChange={e => setNote(e.target.value)} placeholder={tt('Notes about your order, e.g. special notes for delivery.')} />
          </p>

          <h3 className="ckH3 ckReviewHead">{tt('Your order')}</h3>
          <div className="ckReview">
            <table className="ckTable">
              <thead>
                <tr><th>{tt('Product')}</th><th>{tt('Subtotal')}</th></tr>
              </thead>
              <tbody>
                {cart.map(i => (
                  <tr key={`${i.id}-${i.size || ''}`}>
                    <td className="ckName">
                      <div className="ckNameIn">
                        <div>{i.name}{i.size ? ` - ${i.size}` : ''}</div>&nbsp;
                        <strong>×&nbsp;{i.qty}</strong>
                      </div>
                    </td>
                    <td>৳{(Number(i.price) * i.qty).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr><th>{tt('Subtotal')}</th><td>৳{cartSubtotal.toLocaleString()}</td></tr>
                {discount > 0 && (
                  <tr><th>{tt('Discount')} ({coupon.code})</th><td>−৳{discount.toLocaleString()}</td></tr>
                )}
                <tr><th>{tt(delivery.label)}</th><td>{delivery.isFree ? tt('FREE') : '৳' + delivery.charge.toLocaleString()}</td></tr>
                {walletUse > 0 && (
                  <tr><th>{tt('Wallet')}</th><td>−৳{walletUse.toLocaleString()}</td></tr>
                )}
                <tr><th>{tt('Total')}</th><td><strong>৳{payable.toLocaleString()}</strong></td></tr>
              </tfoot>
            </table>

            {walletBal > 0 && (
              <p className="ckRow ckWallet">
                <label className="ckOpt">
                  <input type="checkbox" checked={useWallet} onChange={e => setUseWallet(e.target.checked)} />
                  {tt('Use my wallet balance')} <b>৳{walletBal.toLocaleString()}</b>
                </label>
              </p>
            )}

            <div className="ckPayment">
              <ul className="ckPayList">
                <li>
                  <label className="ckOpt">
                    <input type="radio" name="coPayment" checked={payment === 'COD'} onChange={() => setPayment('COD')} />
                    {tt('Cash on delivery')}
                  </label>
                  {payment === 'COD' && (
                    <div className="ckPayBox"><p>{tt('Pay with cash upon delivery.')}</p></div>
                  )}
                </li>
                <li>
                  <label className="ckOpt">
                    <input type="radio" name="coPayment" checked={payment === 'ONLINE'} onChange={() => setPayment('ONLINE')} />
                    {tt('Pay Online')}
                    {(settings.payment_logos || []).map((url, i) => (
                      <img key={i} src={url} alt="" onError={e => { e.currentTarget.style.display = 'none' }} />
                    ))}
                  </label>
                  {payment === 'ONLINE' && (
                    <div className="ckPayBox"><p>{tt('Pay securely by Credit/Debit card, Internet banking or Mobile banking through Paymently.')}</p></div>
                  )}
                </li>
              </ul>

              <button type="submit" className="ckPlace" disabled={busy || cart.length === 0}>
                {busy ? tt('Placing order...') : tt('Place order')}
              </button>
            </div>
          </div>
        </form>
      </div>

      <div className={`panel${showSuccess ? ' show' : ''}`}>
        <div className="panelHead">
          <h2>{paymentReturn ? (paymentReturn.isPaid ? t('Payment Successful!') : t('Payment Not Completed')) : t('Order Placed!')}</h2>
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
                ? <>{t('Your payment has been received and your order is confirmed.')}<br />{t("We'll contact you shortly.")}</>
                : <>{t("Your order is saved, but the payment wasn't completed.")}<br />{t('You can retry payment or contact us to arrange Cash on Delivery.')}</>}
            </p>
            <div style={{ textAlign: 'left' }}>
              <div className="summaryRow"><span>{t('Order ID')}</span><b>#{paymentReturn.orderRef}</b></div>
              <div className="summaryRow"><span>{t('Total Amount')}</span><b>৳{paymentReturn.total.toLocaleString()}</b></div>
              <div className="summaryRow"><span>{t('Delivery')}</span><b>{paymentReturn.methodLabel}</b></div>
            </div>
            <button className="btn light" type="button" style={{ width: '100%', border: '1.5px solid #111', marginTop: 16 }} onClick={closePanel}>
              {t('CONTINUE SHOPPING')}
            </button>
          </div>
        )}
        {!paymentReturn && lastOrder && (
          <div style={{ textAlign: 'center', padding: '10px 0' }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(46,125,50,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="#2e7d32" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
            </div>
            <p style={{ fontSize: 13, marginBottom: 20 }}>
              {t('Thank you! Your order has been received.')}<br />{t("We'll contact you shortly to confirm.")}
            </p>
            <div style={{ textAlign: 'left' }}>
              <div className="summaryRow"><span>{t('Order ID')}</span><b>#{lastOrder.orderRef}</b></div>
              <div className="summaryRow"><span>{t('Total Amount')}</span><b>৳{lastOrder.total.toLocaleString()}</b></div>
              <div className="summaryRow"><span>{t('Delivery')}</span><b>{lastOrder.methodLabel}</b></div>
            </div>
            <p style={{ fontSize: 11.5, color: 'var(--muted)', margin: '16px 0' }}>
              {t('Save this Order ID and your phone number — you can use them anytime to track your order.')}
            </p>
            <a className="btn light" href={lastOrder.waUrl} target="_blank" rel="noopener noreferrer"
              style={{ display: 'block', border: '1px solid #111', marginBottom: 10 }}>
              {t('CONFIRM VIA WHATSAPP')}
            </a>
            <button className="btn light" type="button" style={{ width: '100%', border: '1.5px solid #111' }} onClick={closePanel}>
              {t('CONTINUE SHOPPING')}
            </button>
          </div>
        )}
      </div>
    </>
  )
}
