import { useState, useEffect, useCallback } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import { stripeService } from '../services/stripeService'

export default function PaymentStatus() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [status, setStatus] = useState('checking')
  const [paymentInfo, setPaymentInfo] = useState(null)
  const [error, setError] = useState('')
  const [retries, setRetries] = useState(0)

  const paymentIntentId = searchParams.get('payment_intent')
  const redirectStatus = searchParams.get('redirect_status')

  const checkPayment = useCallback(async () => {
    if (!paymentIntentId) {
      setError('No payment reference found')
      setStatus('error')
      return
    }

    try {
      const res = await stripeService.getPaymentStatus(paymentIntentId)
      const data = res.data || res
      setPaymentInfo(data)

      if (data.status === 'COMPLETED') {
        setStatus('succeeded')
      } else if (data.status === 'FAILED' || data.status === 'CANCELLED') {
        setStatus('failed')
      } else if (data.status === 'PROCESSING' || data.status === 'PENDING') {
        setStatus('processing')
        if (retries < 10) {
          setTimeout(() => {
            setRetries(prev => prev + 1)
          }, 2000)
        }
      } else {
        setStatus('unknown')
      }
    } catch (err) {
      if (retries < 5) {
        setTimeout(() => setRetries(prev => prev + 1), 3000)
      } else {
        setError(err.message || 'Failed to check payment status')
        setStatus('error')
      }
    }
  }, [paymentIntentId, retries])

  useEffect(() => {
    checkPayment()
  }, [checkPayment])

  useEffect(() => {
    if (redirectStatus === 'succeeded') {
      setStatus('processing')
    }
  }, [redirectStatus])

  if (status === 'checking' || status === 'processing') {
    return (
      <div className="min-h-screen bg-[var(--bg-page)] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 rounded-full bg-[var(--bg-card)] flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 animate-spin text-[#C6A972]" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-2">Payment Processing</h2>
          <p className="text-[var(--text-secondary)] text-sm mb-2">
            Your payment is being processed. Please wait...
          </p>
          <p className="text-[var(--text-muted)] text-xs">
            This may take a few moments. We&apos;ll update your order once confirmed.
          </p>
        </div>
      </div>
    )
  }

  if (status === 'succeeded') {
    return (
      <div className="min-h-screen bg-[var(--bg-page)] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-2">Payment Successful!</h2>
          <p className="text-[var(--text-secondary)] text-sm mb-6">
            Your payment has been received. Your order is being processed.
          </p>
          {paymentInfo?.orderNumber && (
            <p className="text-sm text-[var(--text-secondary)] mb-6">
              Order Number: <span className="font-medium text-[var(--text-primary)]">{paymentInfo.orderNumber}</span>
            </p>
          )}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to="/orders"
              className="px-6 py-3 bg-[#C6A972] text-white text-sm font-semibold rounded-full hover:bg-[#B8965F] transition">
              View Orders
            </Link>
            <Link to="/products"
              className="px-6 py-3 text-sm font-medium text-[var(--text-secondary)] rounded-full border border-[var(--border-color)] hover:bg-[var(--bg-hover)] transition">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (status === 'failed') {
    return (
      <div className="min-h-screen bg-[var(--bg-page)] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-2">Payment Failed</h2>
          <p className="text-[var(--text-secondary)] text-sm mb-6">
            Your payment could not be processed. Please try again or use a different payment method.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button onClick={() => navigate('/checkout')}
              className="px-6 py-3 bg-[#C6A972] text-white text-sm font-semibold rounded-full hover:bg-[#B8965F] transition">
              Try Again
            </button>
            <Link to="/cart"
              className="px-6 py-3 text-sm font-medium text-[var(--text-secondary)] rounded-full border border-[var(--border-color)] hover:bg-[var(--bg-hover)] transition">
              Back to Cart
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--bg-page)] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-2">Payment Status Unknown</h2>
        <p className="text-[var(--text-secondary)] text-sm mb-2">{error || 'Unable to determine payment status.'}</p>
        <p className="text-[var(--text-muted)] text-xs mb-6">
          Please check your orders page for updates.
        </p>
        <Link to="/orders"
          className="px-6 py-3 bg-[#C6A972] text-white text-sm font-semibold rounded-full hover:bg-[#B8965F] transition">
          View Orders
        </Link>
      </div>
    </div>
  )
}
