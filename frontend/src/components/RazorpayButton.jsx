import { useState, useEffect } from 'react'
import { paymentService } from '../services/orderService'
import { useCart } from '../context/CartContext'
import { useToast } from '../context/ToastContext'

const RAZORPAY_KEY_ID = 'rzp_test_placeholder'

export default function RazorpayButton({ shipping, onSuccess, onError, onSyncCart }) {
  const { getCartTotal } = useCart()
  const { showToast } = useToast()
  const [loading, setLoading] = useState(false)
  const [sdkReady, setSdkReady] = useState(false)

  useEffect(() => {
    if (document.getElementById('razorpay-sdk') || window.Razorpay) {
      setSdkReady(true)
      return
    }

    const script = document.createElement('script')
    script.id = 'razorpay-sdk'
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    script.onload = () => setSdkReady(true)
    document.body.appendChild(script)

    return () => {
      const el = document.getElementById('razorpay-sdk')
      if (el) el.remove()
    }
  }, [])

  const handlePayment = async () => {
    if (!window.Razorpay) {
      showToast('Razorpay SDK not loaded. Please try again.', 'error')
      return
    }
    setLoading(true)
    try {
      if (onSyncCart) await onSyncCart()
      const orderRes = await paymentService.createRazorpayOrder({
        street: shipping.street,
        city: shipping.city,
        state: shipping.state,
        zipCode: shipping.zip,
        country: shipping.country,
        notes: '',
      })

      const total = getCartTotal()
      const shippingCost = total >= 100 || total === 0 ? 0 : 15
      const tax = total * 0.08
      const grandTotal = Math.round((total + shippingCost + tax) * 100)

      const options = {
        key: RAZORPAY_KEY_ID,
        amount: grandTotal,
        currency: 'INR',
        name: 'AddexStores',
        description: 'Premium Luxury Order',
        order_id: orderRes.data.gatewayOrderId,
        handler: async function (response) {
          try {
            const verifyRes = await paymentService.verifyRazorpayPayment({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              street: shipping.street,
              city: shipping.city,
              state: shipping.state,
              zipCode: shipping.zip,
              country: shipping.country,
              notes: '',
            })
            onSuccess(verifyRes.data)
          } catch (err) {
            showToast(err.message || 'Payment verification failed', 'error')
            onError(err)
          }
        },
        prefill: {
          name: `${shipping.firstName} ${shipping.lastName}`,
          email: shipping.email,
          contact: shipping.phone,
        },
        theme: { color: '#C6A972' },
        modal: {
          ondismiss: () => {
            showToast('Payment cancelled', 'info')
            setLoading(false)
          },
        },
      }

      const rzp = new window.Razorpay(options)
      rzp.on('payment.failed', function (response) {
        showToast(response.error.description || 'Payment failed', 'error')
        setLoading(false)
      })
      rzp.open()
    } catch (err) {
      showToast(err.message || 'Failed to initiate payment', 'error')
      onError(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handlePayment}
      disabled={loading}
      className="w-full px-6 py-3 bg-[#C6A972] text-white text-sm font-semibold rounded-lg hover:bg-[#B8965F] transition active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-h-[48px]"
    >
      {loading ? (
        <>
          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Processing...
        </>
      ) : (
        <>
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15l-5-5 1.41-1.41L11 14.17l7.59-7.59L20 8l-9 9z"/>
          </svg>
          Pay with Razorpay
        </>
      )}
    </button>
  )
}
