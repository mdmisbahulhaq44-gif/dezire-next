'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabaseClient'
import { useShop } from './ShopContext'

export default function PaymentReturnCheck() {
  const router = useRouter()
  const { setPaymentReturn, openSuccess } = useShop()

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const orderRef = params.get('order')
    const paid = params.get('paid')
    if (!orderRef || paid === null) return

    // Clean the URL right away so refreshing this page doesn't reopen the panel
    window.history.replaceState(null, '', window.location.pathname + window.location.hash)

    ;(async () => {
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('total_amount,delivery_method,payment_status')
          .eq('order_ref', orderRef)

        if (error || !data || !data.length) return

        const total = data.reduce((sum, r) => sum + Number(r.total_amount || 0), 0)
        const isPaid = data[0].payment_status === 'paid'

        setPaymentReturn({
          isPaid,
          orderRef,
          total,
          methodLabel: data[0].delivery_method === 'pickup' ? 'Store Pickup (Mirpur 12)' : 'Home Delivery'
        })
        openSuccess()
      } catch (e) {
        console.error('Payment return check failed:', e)
      }
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return null
}
