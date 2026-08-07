import { useState, useEffect } from 'react'
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'

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
      <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 text-sm text-red-600 dark:text-red-400">
        Unable to initialize payment. Please try again or choose another payment method.
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 mb-4">
        <PaymentElement />
      </div>

      {errorMessage && (
        <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3 mb-4 text-sm text-red-600 dark:text-red-400">
          {errorMessage}
        </div>
      )}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={!stripe || loading}
          className="flex-1 px-6 py-3 bg-[#C6A972] text-white text-sm font-semibold rounded-full hover:bg-[#B8965F] transition active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed min-h-[48px] inline-flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Processing...
            </>
          ) : 'Pay Now'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="px-6 py-3 text-sm font-medium text-[var(--text-secondary)] rounded-full border border-[var(--border-color)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] transition min-h-[48px]"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  )
}
