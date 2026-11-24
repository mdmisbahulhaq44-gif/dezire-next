'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { useShop } from '../ShopContext'
import { ytId } from '../../lib/ytId'

const head = { display: 'block', fontSize: 12, fontWeight: 700, letterSpacing: '.5px', marginBottom: 8 }
const note = { fontSize: 12, color: 'var(--muted)', marginBottom: 14, lineHeight: 1.7 }
const lbl = { display: 'block', fontSize: 11, color: 'var(--muted)', marginBottom: 4 }
const card = { border: '1px solid var(--line)', borderRadius: 10, padding: 14, marginBottom: 12 }
const addBtn = { background: 'none', border: '1px dashed var(--line)', borderRadius: 8, padding: 10, width: '100%', fontSize: 12, letterSpacing: '.5px', cursor: 'pointer', marginBottom: 14 }
const rm = { background: 'none', border: 0, color: 'var(--red)', fontSize: 12, cursor: 'pointer' }

function Steps({ title, items }) {
  return (
    <div style={{ background: '#f7f7f5', border: '1px solid var(--line)', borderRadius: 10, padding: '12px 14px', marginBottom: 16 }}>
      <b style={{ fontSize: 12, letterSpacing: '.5px', display: 'block', marginBottom: 6 }}>{title}</b>
      <ol style={{ margin: 0, paddingLeft: 18, fontSize: 12, lineHeight: 1.8, color: '#444' }}>
        {items.map((s, i) => <li key={i}>{s}</li>)}
      </ol>
    </div>
  )
}

function useSetting(key) {
  const [val, setVal] = useState(null)
  useEffect(() => {
    supabase.from('settings').select('value').eq('key', key).maybeSingle().then(({ data }) => {
      let list = []
      if (data && data.value) { try { const p = JSON.parse(data.value); if (Array.isArray(p)) list = p } catch (e) {} }
      setVal(list)
    })
  }, [key])
  return [val, setVal]
}

async function saveSetting(key, list) {
  return supabase.from('settings').upsert({ key, value: JSON.stringify(list) }, { onConflict: 'key' })
}

// ---------------- VIDEOS ----------------
function VideosEditor({ showToast }) {
  const [saved, setSaved] = useSetting('about_videos')
  const [rows, setRows] = useState(null)
  useEffect(() => {
    if (saved && rows === null) setRows(saved.map(v => ({ url: v.id ? 'https://youtu.be/' + v.id : '', title: v.title || '' })))
  }, [saved, rows])
  if (rows === null) return <p style={{ fontSize: 12, color: 'var(--muted)' }}>Loading...</p>

  function upd(i, k, v) { setRows(p => p.map((r, x) => x === i ? { ...r, [k]: v } : r)) }

  async function save() {
    const out = []
    for (let i = 0; i < rows.length; i++) {
      const r = rows[i]
      if (!r.url.trim() && !r.title.trim()) continue
      const id = ytId(r.url)
      if (!id) { showToast(`Video ${i + 1}: this is not a valid YouTube link.`); return }
      out.push({ id, title: r.title.trim() })
    }
    const { error } = await saveSetting('about_videos', out)
    if (error) { showToast('Could not save: ' + (error.message || 'Unknown error')); return }
    setRows(out.map(v => ({ url: 'https://youtu.be/' + v.id, title: v.title })))
    showToast(out.length ? 'Videos saved! Open the About Us page to see them.' : 'Videos removed.')
  }

  return (
    <div style={{ maxWidth: 520 }}>
      <label style={head}>1. PODCASTS AND FEATURES (YOUTUBE VIDEOS)</label>
      <p style={note}>
        These videos show on the About Us page under the heading "Podcasts and Features". Add only videos that are about HEAVEN (an interview, a podcast, a news feature). If you add nothing, this whole section stays hidden.
      </p>
      <Steps title="HOW TO ADD A VIDEO" items={[
        'Open the video on YouTube.',
        'Tap Share, then Copy link.',
        'Tap "+ ADD VIDEO" below and paste the link in the YOUTUBE LINK box.',
        'Optional: type a short title (only used by screen readers).',
        'Tap SAVE VIDEOS. Done — the page updates within a minute.'
      ]} />
      {rows.map((r, i) => {
        const id = ytId(r.url)
        return (
          <div key={i} style={card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <b style={{ fontSize: 12, letterSpacing: '.5px' }}>VIDEO {i + 1}</b>
              <button type="button" style={rm} onClick={() => setRows(p => p.filter((_, x) => x !== i))}>Remove</button>
            </div>
            {id ? <img src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`} alt="" style={{ width: '100%', maxHeight: 150, objectFit: 'cover', borderRadius: 8, marginBottom: 10, background: '#eee' }} /> : null}
            <label style={lbl}>YOUTUBE LINK</label>
            <input type="text" value={r.url} onChange={e => upd(i, 'url', e.target.value)} placeholder="https://youtu.be/xxxxxxxxxxx" style={{ marginBottom: 6 }} />
            {r.url.trim() && !id ? <div style={{ fontSize: 11, color: 'var(--red)', marginBottom: 8 }}>This does not look like a YouTube link.</div> : null}
            <label style={lbl}>TITLE (OPTIONAL)</label>
            <input type="text" value={r.title} onChange={e => upd(i, 'title', e.target.value)} placeholder="e.g. The story behind HEAVEN" />
          </div>
        )
      })}
      <button type="button" style={addBtn} onClick={() => setRows(p => [...p, { url: '', title: '' }])}>+ ADD VIDEO</button>
      <button className="btn" onClick={save}>SAVE VIDEOS</button>
    </div>
  )
}

// ---------------- PRESS ----------------
function PressEditor({ showToast }) {
  const [saved] = useSetting('about_press')
  const [rows, setRows] = useState(null)
  useEffect(() => {
    if (saved && rows === null) setRows(saved.map(p => ({ name: p.name || '', logo: p.logo || '', url: p.url || '' })))
  }, [saved, rows])
  if (rows === null) return <p style={{ fontSize: 12, color: 'var(--muted)' }}>Loading...</p>

  function upd(i, k, v) { setRows(p => p.map((r, x) => x === i ? { ...r, [k]: v } : r)) }

  async function save() {
    const out = []
    for (let i = 0; i < rows.length; i++) {
      const r = rows[i]
      const name = r.name.trim(), logo = r.logo.trim(), url = r.url.trim()
      if (!name && !logo && !url) continue
      if (!name) { showToast(`Logo ${i + 1}: please type the newspaper / site name.`); return }
      if (!/^https?:\/\//i.test(logo)) { showToast(`Logo ${i + 1}: the LOGO IMAGE LINK must start with https://`); return }
      if (url && !/^https?:\/\//i.test(url)) { showToast(`Logo ${i + 1}: the website link must start with https://`); return }
      out.push({ name, logo, url })
    }
    const { error } = await saveSetting('about_press', out)
    if (error) { showToast('Could not save: ' + (error.message || 'Unknown error')); return }
    setRows(out)
    showToast(out.length ? 'Featured On saved! Open the About Us page to see it.' : 'Featured On removed.')
  }

  return (
    <div style={{ maxWidth: 520 }}>
      <label style={head}>2. FEATURED ON (NEWSPAPER / WEBSITE LOGOS)</label>
      <p style={note}>
        Logos of newspapers, magazines or websites that really wrote about HEAVEN. They show in two columns on the About Us page under "Featured On". Please add only places that truly featured you. If you add nothing, this section stays hidden.
      </p>
      <Steps title="HOW TO ADD A LOGO" items={[
        'Get the logo as a picture (PNG with a clear / white background looks best).',
        'Upload the picture to Cloudinary, then copy the image link (it starts with https://res.cloudinary.com/...).',
        'Tap "+ ADD LOGO" below.',
        'Type the name in NAME, paste the picture link in LOGO IMAGE LINK.',
        'Optional: paste the link of the article in ARTICLE LINK, so tapping the logo opens it.',
        'Tap SAVE FEATURED ON.'
      ]} />
      {rows.map((r, i) => (
        <div key={i} style={card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <b style={{ fontSize: 12, letterSpacing: '.5px' }}>LOGO {i + 1}</b>
            <button type="button" style={rm} onClick={() => setRows(p => p.filter((_, x) => x !== i))}>Remove</button>
          </div>
          {r.logo ? <img src={r.logo} alt="" style={{ width: '100%', maxHeight: 90, objectFit: 'contain', marginBottom: 10, background: '#f7f7f5', borderRadius: 8 }} onError={e => { e.currentTarget.style.display = 'none' }} /> : null}
          <label style={lbl}>NAME (e.g. The Daily Star)</label>
          <input type="text" value={r.name} onChange={e => upd(i, 'name', e.target.value)} style={{ marginBottom: 10 }} />
          <label style={lbl}>LOGO IMAGE LINK</label>
          <input type="text" value={r.logo} onChange={e => upd(i, 'logo', e.target.value)} placeholder="https://res.cloudinary.com/..." style={{ marginBottom: 10 }} />
          <label style={lbl}>ARTICLE LINK (OPTIONAL)</label>
          <input type="text" value={r.url} onChange={e => upd(i, 'url', e.target.value)} placeholder="https://..." />
        </div>
      ))}
      <button type="button" style={addBtn} onClick={() => setRows(p => [...p, { name: '', logo: '', url: '' }])}>+ ADD LOGO</button>
      <button className="btn" onClick={save}>SAVE FEATURED ON</button>
    </div>
  )
}

// ---------------- LEGAL ----------------
function LegalEditor({ showToast }) {
  const [saved] = useSetting('about_legal')
  const [text, setText] = useState(null)
  useEffect(() => {
    if (saved && text === null) setText(saved.join('\n'))
  }, [saved, text])
  if (text === null) return <p style={{ fontSize: 12, color: 'var(--muted)' }}>Loading...</p>

  async function save() {
    const lines = text.split('\n').map(s => s.trim()).filter(Boolean)
    const { error } = await saveSetting('about_legal', lines)
    if (error) { showToast('Could not save: ' + (error.message || 'Unknown error')); return }
    setText(lines.join('\n'))
    showToast(lines.length ? 'Legal info saved!' : 'Legal info removed.')
  }

  return (
    <div style={{ maxWidth: 520 }}>
      <label style={head}>3. LEGAL INFO</label>
      <p style={note}>
        Shows at the bottom of the About Us page under "Legal Info:" (under the Contact box). Use it for your trade license and TIN number. If you leave it empty, nothing is shown.
      </p>
      <Steps title="HOW TO ADD" items={[
        'Type one line for each item (press Enter for a new line).',
        'Example line 1: Trade License Number: 12345',
        'Example line 2: TIN Number: 000-000-000',
        'Tap SAVE LEGAL INFO.'
      ]} />
      <label style={lbl}>LEGAL LINES (ONE PER LINE)</label>
      <textarea value={text} onChange={e => setText(e.target.value)} placeholder={'Trade License Number: ...\nTIN Number: ...'} style={{ minHeight: 100, marginBottom: 12 }} />
      <button className="btn" onClick={save}>SAVE LEGAL INFO</button>
    </div>
  )
}

export default function AdminAbout() {
  const { showToast } = useShop()
  return (
    <div className="adminTable">
      <h2 style={{ marginBottom: 8 }}>About Us page</h2>
      <p style={{ ...note, maxWidth: 520 }}>
        The About Us page (/about) already has your story and contact box. Use the three parts below to add extra sections. Each part only appears on the page after you add something to it. After you save, the page updates within about a minute.
      </p>
      <VideosEditor showToast={showToast} />
      <hr style={{ margin: '36px 0', border: 0, borderTop: '1px solid var(--line)' }} />
      <PressEditor showToast={showToast} />
      <hr style={{ margin: '36px 0', border: 0, borderTop: '1px solid var(--line)' }} />
      <LegalEditor showToast={showToast} />
    </div>
  )
}
