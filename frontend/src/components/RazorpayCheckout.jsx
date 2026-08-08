import { useState, useEffect, useRef } from 'react'
import { checkoutService } from '../services/checkoutService'
import { useToast } from '../context/ToastContext'
import { getStoreCurrency } from '../utils/currency'

function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true)
      return
    }
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}

export default function RazorpayCheckout({ shipping, onSuccess, onError, onSyncCart }) {
  const { showToast } = useToast()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [orderData, setOrderData] = useState(null)
  const initiated = useRef(false)
  const scriptLoaded = useRef(false)

  useEffect(() => {
    if (initiated.current) return
    initiated.current = true

    const initPayment = async () => {
      try {
        if (!import.meta.env.VITE_RAZORPAY_KEY_ID) {
          setError('Razorpay key not configured. Please set VITE_RAZORPAY_KEY_ID in your environment.')
          setLoading(false)
          return
        }

        const loaded = await loadRazorpayScript()
        if (!loaded) {
          setError('Failed to load Razorpay SDK')
          setLoading(false)
          return
        }
        scriptLoaded.current = true

        if (onSyncCart) await onSyncCart()

        const res = await checkoutService.createPayment({
          street: shipping.street,
          city: shipping.city,
          state: shipping.state,
          zipCode: shipping.zip,
          country: shipping.country,
          paymentMethod: 'RAZORPAY',
        })
        const data = res.data || res
        setOrderData(data)
      } catch (err) {
        setError(err.message || 'Failed to initialize payment')
        if (onError) onError(err)
      } finally {
        setLoading(false)
      }
    }
    initPayment()
  }, [])

  const handlePayment = () => {
    if (!orderData || !window.Razorpay) return

    const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID
    if (!razorpayKey) {
      showToast('Razorpay is not configured. Please set VITE_RAZORPAY_KEY_ID.', 'error')
      return
    }

    const options = {
      key: razorpayKey,
      amount: orderData.amount,
      currency: orderData.currency || getStoreCurrency(),
      name: import.meta.env.VITE_APP_NAME || 'AddexStores',
      order_id: orderData.paymentIntentId,
      prefill: {
        name: `${shipping.firstName} ${shipping.lastName}`.trim(),
        email: shipping.email,
        contact: shipping.phone,
      },
      handler: function (response) {
        showToast('Payment successful!', 'success')
        if (onSuccess) {
          onSuccess({
            paymentIntentId: response.razorpay_payment_id,
            orderId: response.razorpay_order_id,
            signature: response.razorpay_signature,
            orderNumber: orderData.orderNumber,
            status: 'succeeded',
          })
        }
      },
      modal: {
        ondismiss: function () {
          showToast('Payment cancelled', 'info')
        },
      },
    }

    const rzp = new window.Razorpay(options)
    rzp.on('payment.failed', function (response) {
      showToast(response.error?.description || 'Payment failed', 'error')
      if (onError) onError(response.error)
    })
    rzp.open()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <svg className="w-6 h-6 animate-spin text-[#C6A972]" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <span className="ml-3 text-sm text-[var(--text-secondary)]">Initializing payment...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 text-sm text-red-600 dark:text-red-400">
        {error}
      </div>
    )
  }

  if (!orderData) {
    return (
      <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 text-sm text-yellow-600 dark:text-yellow-400">
        Razorpay is not configured. Please try another payment method.
      </div>
    )
  }

  return (
    <div>
      <div className="bg-[var(--bg-secondary)] rounded-lg p-4 mb-4 text-sm text-[var(--text-secondary)]">
        <p className="font-medium text-[var(--text-primary)] mb-1">Pay with Razorpay</p>
        <p>Secure payment via Razorpay. UPI, Cards, Net Banking, and Wallets accepted.</p>
      </div>
      <button
        onClick={handlePayment}
        className="w-full px-6 py-3 bg-[#C6A972] text-white text-sm font-semibold rounded-full hover:bg-[#B8965F] transition active:scale-[0.98] min-h-[48px] inline-flex items-center justify-center gap-2"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
        Pay Now
      </button>
    </div>
  )
}
