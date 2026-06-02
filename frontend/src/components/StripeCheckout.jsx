import { useState, useEffect, useRef } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { Elements } from '@stripe/react-stripe-js'
import { checkoutService } from '../services/checkoutService'
import { cartService } from '../services/cartService'
import StripePaymentElement from './StripePaymentElement'
import { useToast } from '../context/ToastContext'

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '')

export default function StripeCheckout({ shipping, onSuccess, onError, onSyncCart }) {
  const { showToast } = useToast()
  const [clientSecret, setClientSecret] = useState('')
  const [paymentIntentId, setPaymentIntentId] = useState('')
  const [orderNumber, setOrderNumber] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const initiated = useRef(false)

  const getCurrencyForCountry = (country) => {
    const currencyMap = {
      US: 'USD',
      UK: 'GBP',
      GB: 'GBP',
      CA: 'USD',
      AE: 'AED',
      FR: 'EUR',
      IT: 'EUR',
      IN: 'INR',
    }
    return currencyMap[country] || 'USD'
  }

  useEffect(() => {
    if (initiated.current) return
    initiated.current = true

    const initPayment = async () => {
      try {
        if (onSyncCart) await onSyncCart()

        const res = await checkoutService.createPayment({
          street: shipping.street,
          city: shipping.city,
          state: shipping.state,
          zipCode: shipping.zip,
          country: shipping.country,
          currency: getCurrencyForCountry(shipping.country),
        })
        const data = res.data || res
        setClientSecret(data.clientSecret)
        setPaymentIntentId(data.paymentIntentId)
        setOrderNumber(data.orderNumber)
      } catch (err) {
        setError(err.message || 'Failed to initialize payment')
        if (onError) onError(err)
      } finally {
        setLoading(false)
      }
    }
    initPayment()
  }, [])

  const handleSuccess = async (paymentIntent) => {
    showToast('Payment successful!', 'success')
    if (onSuccess) onSuccess({
      paymentIntentId: paymentIntent.id || paymentIntentId,
      status: paymentIntent.status,
      orderNumber,
    })
  }

  const handleError = (err) => {
    showToast(err.message || 'Payment failed', 'error')
    if (onError) onError(err)
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

  if (!clientSecret) {
    return (
      <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 text-sm text-yellow-600 dark:text-yellow-400">
        Stripe is not configured. Please try another payment method.
      </div>
    )
  }

  return (
    <div>
      <div className="bg-[var(--bg-secondary)] rounded-lg p-4 mb-4 text-sm text-[var(--text-secondary)]">
        <p className="font-medium text-[var(--text-primary)] mb-1">Pay with Credit/Debit Card</p>
        <p>Secure payment via Stripe. Cards, Apple Pay, and Google Pay accepted.</p>
      </div>
      <Elements stripe={stripePromise} options={{ clientSecret }}>
        <StripePaymentElement
          clientSecret={clientSecret}
          onSuccess={handleSuccess}
          onError={handleError}
        />
      </Elements>
    </div>
  )
}
