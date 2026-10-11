'use client'

import { useRef, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

const GENDERS = [['male', 'Male'], ['female', 'Female'], ['other', 'Other']]

function CameraIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 8h3l2-3h6l2 3h3a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z" />
      <circle cx="12" cy="13.5" r="3.5" />
    </svg>
  )
}

function Tick() {
  return (
    <svg className="pfTick" viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
      <circle cx="12" cy="12" r="10" fill="#111" />
      <path d="M7.5 12.5l3 3 6-6.5" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// crop to a centred square and shrink, so every photo is small (well under 1 MB)
async function toSquareJpeg(file, size = 400) {
  const url = URL.createObjectURL(file)
  try {
    const img = await new Promise((resolve, reject) => {
      const i = new Image()
      i.onload = () => resolve(i)
      i.onerror = reject
      i.src = url
    })
    const s = Math.min(img.width, img.height)
    const c = document.createElement('canvas')
    c.width = c.height = size
    c.getContext('2d').drawImage(img, (img.width - s) / 2, (img.height - s) / 2, s, s, 0, 0, size, size)
    return await new Promise(resolve => c.toBlob(resolve, 'image/jpeg', 0.85))
  } finally {
    URL.revokeObjectURL(url)
  }
}

function genderLabel(v) {
  const hit = GENDERS.find(g => g[0] === v)
  return hit ? hit[1] : ''
}

export function ProfileView({ session, showToast, onEdit }) {
  const meta = session.user.user_metadata || {}
  const fileRef = useRef(null)
  const [busy, setBusy] = useState(false)
  const initial = (meta.full_name || session.user.email || '').trim().charAt(0).toUpperCase()

  async function pickPhoto(e) {
    const file = e.target.files && e.target.files[0]
    e.target.value = ''
    if (!file) return
    setBusy(true)
    try {
      const blob = await toSquareJpeg(file)
      if (!blob) throw new Error('Could not read this image.')
      const path = session.user.id + '/avatar.jpg'
      const { error } = await supabase.storage.from('avatars').upload(path, blob, { upsert: true, contentType: 'image/jpeg' })
      if (error) throw error
      const { data } = supabase.storage.from('avatars').getPublicUrl(path)
      const { error: uErr } = await supabase.auth.updateUser({ data: { avatar_url: data.publicUrl + '?v=' + Date.now() } })
      if (uErr) throw uErr
      showToast('Photo updated.')
    } catch (err) {
      showToast('Could not update photo: ' + ((err && err.message) || 'try a JPG or PNG image'))
    }
    setBusy(false)
  }

  return (
    <div>
      <div className="pfAvatarWrap">
        {meta.avatar_url
          ? <img className="pfAvatar" src={meta.avatar_url} alt="" />
          : <div className="pfAvatar">{initial || '?'}</div>}
        <button type="button" className="pfCam" onClick={() => fileRef.current && fileRef.current.click()} disabled={busy} aria-label="Change photo">
          {busy ? <span style={{ fontSize: 11 }}>...</span> : <CameraIcon />}
        </button>
        <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={pickPhoto} style={{ display: 'none' }} />
      </div>

      <div className="pfCard">
        <div className="pfField"><div className="pfLabel">Name</div><div className="pfValue">{meta.full_name || '—'}</div></div>
        <div className="pfField"><div className="pfLabel">Date of Birth</div><div className="pfValue">{meta.birth_date || '—'}</div></div>
        <div className="pfField"><div className="pfLabel">Gender</div><div className="pfValue">{genderLabel(meta.gender) || '—'}</div></div>
        <div className="pfField"><div className="pfLabel">Phone Number</div><div className="pfValue">{meta.phone || '—'}</div></div>
        <div className="pfField"><div className="pfLabel">Email Address</div><div className="pfValue">{session.user.email}</div></div>
        <button type="button" className="btn light" style={{ width: '100%', marginTop: 6 }} onClick={onEdit}>EDIT PROFILE</button>
      </div>
    </div>
  )
}

export function EditProfile({ session, showToast, onDone }) {
  const meta = session.user.user_metadata || {}
  const [name, setName] = useState(meta.full_name || '')
  const [gender, setGender] = useState(meta.gender || '')
  const [dob, setDob] = useState(meta.birth_date || '')
  const [busy, setBusy] = useState(false)
  const today = new Date().toISOString().slice(0, 10)

  async function save(e) {
    e.preventDefault()
    const nm = name.trim()
    if (nm.length < 2) { showToast('Please enter your full name.'); return }
    if (dob && (dob > today || dob < '1900-01-01')) { showToast('Please enter a valid date of birth.'); return }
    setBusy(true)
    const { error } = await supabase.auth.updateUser({ data: { full_name: nm, gender: gender || null, birth_date: dob || null } })
    setBusy(false)
    if (error) { showToast('Could not save: ' + (error.message || 'try again')); return }
    showToast('Profile updated.')
    onDone()
  }

  return (
    <form className="pfCard form" onSubmit={save}>
      <div>
        <label className="pfFormLabel">Full Name <span style={{ color: '#d33' }}>*</span></label>
        <input type="text" value={name} onChange={e => setName(e.target.value)} required maxLength={100} />
      </div>
      <div>
        <label className="pfFormLabel">Gender</label>
        <select value={gender} onChange={e => setGender(e.target.value)}>
          <option value="">Select</option>
          {GENDERS.map(g => <option key={g[0]} value={g[0]}>{g[1]}</option>)}
        </select>
      </div>
      <div>
        <label className="pfFormLabel">Date of Birth</label>
        <input type="date" value={dob} min="1900-01-01" max={today} onChange={e => setDob(e.target.value)} />
      </div>
      <div>
        <label className="pfFormLabel">Email Address</label>
        <div style={{ position: 'relative' }}>
          <input type="email" value={session.user.email} disabled className="pfLocked" />
          <Tick />
        </div>
      </div>
      <div>
        <label className="pfFormLabel">Phone Number</label>
        <input type="text" value={meta.phone || ''} disabled className="pfLocked" />
      </div>
      <button className="btn" disabled={busy}>{busy ? 'SAVING...' : 'SAVE CHANGES'}</button>
    </form>
  )
}
