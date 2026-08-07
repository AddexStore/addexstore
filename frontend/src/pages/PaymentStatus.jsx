import { useState, useEffect, useCallback } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { stripeService } from '../services/stripeService'
import Button from '../components/ui/Button'
import Icon from '../components/ui/Icon'
import Spinner from '../components/ui/Spinner'

function StatusShell({ icon, tone, title, message, extra, actions }) {
  const toneWrap = {
    success: 'bg-success/12 text-success',
    danger: 'bg-danger/12 text-danger',
    processing: 'bg-gold-100 text-gold-700 dark:bg-gold-500/10 dark:text-gold-400',
    unknown: 'bg-subtle text-sub',
  }[tone]

  return (
    <div className="min-h-screen bg-page px-4 py-16">
      <div className="mx-auto w-full max-w-md rounded-card border border-line bg-surface p-8 text-center shadow-card sm:p-10">
        {tone === 'processing' ? (
          <div className={`mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full ${toneWrap}`}>
            <Icon name="Loader2" size={32} className="animate-spin" />
          </div>
        ) : (
          <div className={`mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full ${toneWrap}`}>
            <Icon name={icon} size={32} />
          </div>
        )}

        <div className="mb-6 flex justify-center">
          <span className={`h-px w-16 ${tone === 'success' ? 'bg-gold-500' : 'bg-line'}`} />
        </div>

        <h1 className="heading-display text-2xl text-ink">{title}</h1>
        <p className="mt-2 text-sm leading-relaxed text-sub">{message}</p>

        {extra && <div className="mt-4 text-sm text-ink">{extra}</div>}

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">{actions}</div>
      </div>
    </div>
  )
}

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
      <StatusShell
        tone="processing"
        title="Payment Processing"
        message="Your payment is being processed. Please wait a few moments — we'll update your order once confirmed."
        actions={null}
      />
    )
  }

  if (status === 'succeeded') {
    return (
      <StatusShell
        tone="success"
        icon="Check"
        title="Payment Successful"
        message="Your payment has been received and your order is being prepared."
        extra={paymentInfo?.orderNumber && (
          <p>
            Order Number: <span className="font-semibold text-gold-600 dark:text-gold-400">{paymentInfo.orderNumber}</span>
          </p>
        )}
        actions={
          <>
            <Button to="/orders" icon="ClipboardList">View Orders</Button>
            <Button to="/products" variant="outline" icon="ShoppingBag">Continue Shopping</Button>
          </>
        }
      />
    )
  }

  if (status === 'failed') {
    return (
      <StatusShell
        tone="danger"
        icon="XCircle"
        title="Payment Failed"
        message="Your payment could not be processed. Please try again or use a different payment method."
        actions={
          <>
            <Button onClick={() => navigate('/checkout')} icon="RefreshCw">Try Again</Button>
            <Button to="/cart" variant="outline" icon="ShoppingCart">Back to Cart</Button>
          </>
        }
      />
    )
  }

  return (
    <StatusShell
      tone="unknown"
      icon="AlertTriangle"
      title="Payment Status Unknown"
      message={error || 'Unable to determine payment status. Please check your orders page for updates.'}
      actions={<Button to="/orders" icon="ClipboardList">View Orders</Button>}
    />
  )
}
