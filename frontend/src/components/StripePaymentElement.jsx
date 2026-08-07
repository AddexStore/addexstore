import { useState, useEffect } from 'react'
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import Button from './ui/Button'
import Icon from './ui/Icon'

export default function StripePaymentElement({ clientSecret, onSuccess, onError, onCancel }) {
  const stripe = useStripe()
  const elements = useElements()
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    if (!clientSecret) {
      setErrorMessage('Payment initialization failed. Please try again.')
    }
  }, [clientSecret])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!stripe || !elements) return

    setLoading(true)
    setErrorMessage('')

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/payment/status`,
      },
      redirect: 'if_required',
    })

    if (error) {
      setErrorMessage(error.message || 'Payment failed')
      setLoading(false)
      if (onError) onError(error)
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      if (onSuccess) onSuccess(paymentIntent)
    } else if (paymentIntent && paymentIntent.status === 'processing') {
      if (onSuccess) onSuccess(paymentIntent)
    }
  }

  if (!clientSecret) {
    return (
      <div className="flex items-start gap-3 rounded-card border border-danger/30 bg-danger/8 p-4 text-sm text-danger">
        <Icon name="AlertCircle" size="sm" className="mt-0.5 shrink-0" />
        <p>Unable to initialize payment. Please try again or choose another payment method.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-4 rounded-card border border-line bg-inset p-4">
        <PaymentElement />
      </div>

      {errorMessage && (
        <div className="mb-4 flex items-start gap-3 rounded-card border border-danger/30 bg-danger/8 p-4 text-sm text-danger">
          <Icon name="AlertCircle" size="sm" className="mt-0.5 shrink-0" />
          <p>{errorMessage}</p>
        </div>
      )}

      <div className="flex items-center gap-3">
        <Button
          type="submit"
          fullWidth
          size="lg"
          icon="Lock"
          iconPosition="right"
          disabled={!stripe}
          loading={loading}
        >
          {loading ? 'Processing...' : 'Pay Now'}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" size="lg" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  )
}
