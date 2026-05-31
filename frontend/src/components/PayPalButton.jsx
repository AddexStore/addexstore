import { useEffect, useRef, useState } from 'react'
import { paymentService } from '../services/orderService'
import { useCart } from '../context/CartContext'
import { useToast } from '../context/ToastContext'

const PAYPAL_CLIENT_ID = 'sb'
const PAYPAL_CURRENCY = 'USD'

export default function PayPalButton({ shipping, onSuccess, onError, disabled, onSyncCart }) {
  const { getCartTotal } = useCart()
  const { showToast } = useToast()
  const [loading, setLoading] = useState(false)
  const [sdkReady, setSdkReady] = useState(false)
  const paypalRef = useRef()
  const buttonsRendered = useRef(false)

  useEffect(() => {
    if (document.getElementById('paypal-sdk')) {
      setSdkReady(true)
      return
    }

    const script = document.createElement('script')
    script.id = 'paypal-sdk'
    script.src = `https://www.paypal.com/sdk/js?client-id=${PAYPAL_CLIENT_ID}&currency=${PAYPAL_CURRENCY}&intent=capture`
    script.async = true
    script.onload = () => setSdkReady(true)
    document.body.appendChild(script)

    return () => {
      const existing = document.getElementById('paypal-sdk')
      if (existing) existing.remove()
    }
  }, [])

  useEffect(() => {
    if (!sdkReady || !window.paypal || buttonsRendered.current) return

    const total = getCartTotal()
    const shippingCost = total >= 100 || total === 0 ? 0 : 15
    const tax = total * 0.08
    const grandTotal = (total + shippingCost + tax).toFixed(2)

    window.paypal.Buttons({
      style: { layout: 'vertical', color: 'gold', shape: 'rect', label: 'paypal' },
      createOrder: async () => {
        setLoading(true)
        try {
          if (onSyncCart) await onSyncCart()
          const res = await paymentService.createPayPalOrder({
            street: shipping.street,
            city: shipping.city,
            state: shipping.state,
            zipCode: shipping.zip,
            country: shipping.country,
            notes: '',
          })
          return res.data.gatewayOrderId
        } catch (err) {
          showToast(err.message || 'Failed to create PayPal order', 'error')
          throw err
        } finally {
          setLoading(false)
        }
      },
      onApprove: async (data) => {
        setLoading(true)
        try {
          const res = await paymentService.capturePayPalOrder({
            paypalOrderId: data.orderID,
            street: shipping.street,
            city: shipping.city,
            state: shipping.state,
            zipCode: shipping.zip,
            country: shipping.country,
            notes: '',
          })
          onSuccess(res.data)
        } catch (err) {
          showToast(err.message || 'Payment failed', 'error')
          onError(err)
        } finally {
          setLoading(false)
        }
      },
      onError: (err) => {
        showToast('PayPal payment error', 'error')
        onError(err)
      },
    }).render(paypalRef.current)

    buttonsRendered.current = true
  }, [sdkReady])

  useEffect(() => {
    return () => { buttonsRendered.current = false }
  }, [])

  if (!sdkReady) {
    return (
      <div className="flex items-center justify-center py-6">
        <svg className="w-6 h-6 animate-spin text-[#C6A972]" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <span className="ml-2 text-sm text-[var(--text-secondary)]">Loading PayPal...</span>
      </div>
    )
  }

  if (disabled) {
    return (
      <div className="py-4 text-center">
        <p className="text-sm text-[var(--text-secondary)]">Complete shipping information first</p>
      </div>
    )
  }

  return (
    <div className="py-2">
      <div ref={paypalRef} />
      {loading && (
        <div className="text-center mt-3">
          <p className="text-sm text-[var(--text-secondary)]">Processing payment...</p>
        </div>
      )}
    </div>
  )
}
