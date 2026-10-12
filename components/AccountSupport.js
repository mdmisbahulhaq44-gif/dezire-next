'use client'

// "Support" page inside My Account: grouped contact options.
const PHONE = '8801877270165'
const FB = 'https://www.facebook.com/profile.php?id=61583860210132'
const MAIL = 'mdmisbahulhaq44@gmail.com'

const PATHS = {
  call: 'M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z',
  chat: 'M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z M8 13l2.5-3 2 2 3-3',
  whatsapp: 'M21 12a9 9 0 0 1-13.4 7.8L3 21l1.3-4.4A9 9 0 1 1 21 12z M9 8.5c0 3.5 3 6.5 6.5 6.5l1-1.5-2-1-1 .8a4 4 0 0 1-2-2l.8-1-1-2-1.3.2z',
  mail: 'M4 5h16a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z M3 7l9 6 9-6',
  arrow: 'M9 6l6 6-6 6'
}

function Ic({ name, cls = 'acIcon' }) {
  return (
    <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={PATHS[name]} />
    </svg>
  )
}

function Item({ icon, label, href, external }) {
  return (
    <a className="acRow" href={href} {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
      <Ic name={icon} />
      <span>{label}</span>
      <Ic name="arrow" cls="acArrow" />
    </a>
  )
}

export default function AccountSupport() {
  return (
    <div>
      <div className="acSection">Place Order</div>
      <div className="acGroup">
        <Item icon="call" label="Call for Order" href={'tel:+' + PHONE} />
        <Item icon="whatsapp" label="Order on WhatsApp" href={'https://wa.me/' + PHONE} external />
      </div>
      <div className="acSection">Support</div>
      <div className="acGroup">
        <Item icon="call" label="Call" href={'tel:+' + PHONE} />
        <Item icon="chat" label="Messenger" href={FB} external />
        <Item icon="whatsapp" label="WhatsApp" href={'https://wa.me/' + PHONE} external />
        <Item icon="mail" label="Mail" href={'mailto:' + MAIL} />
      </div>
    </div>
  )
}
