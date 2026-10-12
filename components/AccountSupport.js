'use client'

// "Support" page inside My Account: grouped contact options.
const PHONE = '8801877270165'
const FB = 'https://www.facebook.com/profile.php?id=61583860210132'
const MAIL = 'mdmisbahulhaq44@gmail.com'

const PATHS = {
  call: 'M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z',
  chat: 'M12 2C6.36 2 2 6.13 2 11.7c0 2.91 1.19 5.44 3.14 7.17.16.13.26.35.27.57l.05 1.78c.02.57.6.94 1.12.71l1.98-.87c.17-.07.36-.09.53-.04.91.25 1.87.38 2.91.38 5.64 0 10-4.13 10-9.7S17.64 2 12 2zM6.8 14.5l2.94-4.66a1.5 1.5 0 0 1 2.17-.4l2.34 1.75c.21.16.5.16.7 0l3.16-2.4c.42-.32.97.19.69.64l-2.94 4.66a1.5 1.5 0 0 1-2.17.4l-2.34-1.75a.6.6 0 0 0-.7 0l-3.16 2.4c-.42.32-.97-.19-.69-.64z',
  whatsapp: 'M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z',
  mail: 'M4 5h16a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z M3 7l9 6 9-6',
  arrow: 'M9 6l6 6-6 6'
}

const SOLID = { chat: true, whatsapp: true }

function Ic({ name, cls = 'acIcon' }) {
  if (SOLID[name]) {
    return (
      <svg className={cls} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path fillRule="evenodd" d={PATHS[name]} />
      </svg>
    )
  }
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
