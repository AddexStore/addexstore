import { useState, useEffect, useRef } from 'react'
import { checkoutService } from '../services/checkoutService'
import { useToast } from '../context/ToastContext'
import Button from './ui/Button'
import Icon from './ui/Icon'
import Spinner from './ui/Spinner'

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

  const getCurrencyForCountry = (country) => {
    const currencyMap = {
      US: 'USD', UK: 'GBP', GB: 'GBP', CA: 'USD',
      AE: 'AED', FR: 'EUR', IT: 'EUR', IN: 'INR',
    }
    return currencyMap[country] || 'INR'
  }

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
          currency: getCurrencyForCountry(shipping.country),
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
      currency: orderData.currency || 'INR',
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
      <div className="flex items-center justify-center gap-3 py-10">
        <Spinner />
        <span className="text-sm text-sub">Initializing secure payment...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-start gap-3 rounded-card border border-danger/30 bg-danger/8 p-4 text-sm text-danger">
        <Icon name="AlertCircle" size="sm" className="mt-0.5 shrink-0" />
        <p>{error}</p>
      </div>
    )
  }

  if (!orderData) {
    return (
      <div className="flex items-start gap-3 rounded-card border border-gold-500/30 bg-gold-50 p-4 text-sm text-gold-700 dark:bg-gold-500/5 dark:text-gold-400">
        <Icon name="AlertTriangle" size="sm" className="mt-0.5 shrink-0" />
        <p>Razorpay is not configured. Please try another payment method.</p>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-4 flex items-start gap-3 rounded-card border border-line bg-subtle p-4 text-sm text-sub">
        <Icon name="Wallet" size="sm" className="mt-0.5 shrink-0 text-gold-600 dark:text-gold-400" />
        <div>
          <p className="font-medium text-ink">Pay with Razorpay</p>
          <p className="mt-0.5">Secure payment via Razorpay. UPI, Cards, Net Banking, and Wallets accepted.</p>
        </div>
      </div>
      <Button fullWidth size="lg" icon="Lock" iconPosition="right" onClick={handlePayment}>
        Pay Now
      </Button>
    </div>
  )
}
