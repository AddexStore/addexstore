import { useState, useEffect, useRef } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { Elements } from '@stripe/react-stripe-js'
import { checkoutService } from '../services/checkoutService'
import StripePaymentElement from './StripePaymentElement'
import { useToast } from '../context/ToastContext'
import Spinner from './ui/Spinner'
import Icon from './ui/Icon'

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
          paymentMethod: 'STRIPE',
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

  if (!clientSecret) {
    return (
      <div className="flex items-start gap-3 rounded-card border border-gold-500/30 bg-gold-50 p-4 text-sm text-gold-700 dark:bg-gold-500/5 dark:text-gold-400">
        <Icon name="AlertTriangle" size="sm" className="mt-0.5 shrink-0" />
        <p>Stripe is not configured. Please try another payment method.</p>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-4 flex items-start gap-3 rounded-card border border-line bg-subtle p-4 text-sm text-sub">
        <Icon name="CreditCard" size="sm" className="mt-0.5 shrink-0 text-gold-600 dark:text-gold-400" />
        <div>
          <p className="font-medium text-ink">Pay with Credit/Debit Card</p>
          <p className="mt-0.5">Secure payment via Stripe. Cards, Apple Pay, and Google Pay accepted.</p>
        </div>
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
