// Thin line icons for the admin panel (same style as the bottom nav icons); colour comes from the text colour
const P = {
  dashboard: <><path d="M3.5 20.5h17" /><path d="M7 20.5v-6.5" /><path d="M12 20.5V6" /><path d="M17 20.5v-10" /></>,
  products: <><path d="M6 8h12l-1.2 11a2 2 0 0 1-2 1.8H9.2a2 2 0 0 1-2-1.8L6 8Z" /><path d="M9 8V6a3 3 0 0 1 6 0v2" /></>,
  orders: <><path d="M21 8 12 3 3 8l9 5 9-5Z" /><path d="M3 8v8l9 5 9-5V8" /><path d="M12 13v8" /></>,
  returns: <><path d="M9 14 4 9l5-5" /><path d="M4 9h10a6 6 0 0 1 0 12h-3" /></>,
  customers: <><circle cx="9" cy="8" r="3.3" /><path d="M3 20c.8-3.3 3.2-5 6-5s5.2 1.7 6 5" /><circle cx="17" cy="9" r="2.5" /><path d="M16.5 14.3c2.2.2 3.8 1.8 4.5 4.2" /></>,
  settings: <><path d="M4 7h9" /><path d="M17 7h3" /><path d="M4 17h3" /><path d="M11 17h9" /><circle cx="15" cy="7" r="2" /><circle cx="9" cy="17" r="2" /></>,
  stock: <><path d="M22 17l-8.5-8.5-5 5L2 7" /><path d="M16 17h6v-6" /></>,
  backup: <><path d="M12 4v11" /><path d="M7 11l5 5 5-5" /><path d="M4 20h16" /></>,
  sales: <><path d="M3 12V4h8l10 10-8 8L3 12Z" /><circle cx="7.5" cy="8.5" r="1.2" /></>,
  coupons: <><path d="M4 6h16v4a2 2 0 0 0 0 4v4H4v-4a2 2 0 0 0 0-4V6Z" /><path d="M14 7v2" /><path d="M14 11v2" /><path d="M14 15v2" /></>,
  activity: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  today: <><rect x="3.5" y="5" width="17" height="15.5" rx="2" /><path d="M3.5 10h17" /><path d="M8 3v4" /><path d="M16 3v4" /><circle cx="12" cy="15" r="1.3" /></>,
  week: <><rect x="3.5" y="5" width="17" height="15.5" rx="2" /><path d="M3.5 10h17" /><path d="M8 3v4" /><path d="M16 3v4" /><path d="M8 15h8" /></>,
  month: <><rect x="3.5" y="5" width="17" height="15.5" rx="2" /><path d="M3.5 10h17" /><path d="M8 3v4" /><path d="M16 3v4" /><path d="M8 14h.01M12 14h.01M16 14h.01M8 17.5h.01M12 17.5h.01M16 17.5h.01" /></>,
  bell: <><path d="M6 16v-5a6 6 0 0 1 12 0v5l1.5 2h-15L6 16Z" /><path d="M10 21a2 2 0 0 0 4 0" /></>,
  truck: <><path d="M2.5 6.5h10.5v9H2.5Z" /><path d="M13 9.5h4l3.5 3.5v2.5H13" /><circle cx="7" cy="17.5" r="1.8" /><circle cx="17" cy="17.5" r="1.8" /></>,
  alert: <><path d="M12 3.5 21.5 20h-19L12 3.5Z" /><path d="M12 10v4.5" /><path d="M12 17.3h.01" /></>
}

export default function AdminIcon({ name, size = 20 }) {
  if (name === 'taka') return <span style={{ fontSize: size + 2, lineHeight: 1, fontWeight: 400 }}>৳</span>
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flexShrink: 0 }}>
      {P[name] || null}
    </svg>
  )
}
