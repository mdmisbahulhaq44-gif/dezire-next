'use client'

import { useEffect } from 'react'
import { addRecent } from '../lib/recent'

export default function TrackView({ id }) {
  useEffect(() => { addRecent(id) }, [id])
  return null
}
