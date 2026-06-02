import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { adminPaymentService } from '../../services/stripeService'
import { formatDate } from '../../utils/helpers'
import { useToast } from '../../context/ToastContext'

const STATUS_COLORS = {
  PENDING: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  PROCESSING: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  COMPLETED: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  FAILED: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  CANCELLED: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
  REFUNDED: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
}

export default function AdminPaymentDetails() {
  const { id } = useParams()
  const { showToast } = useToast()
  const [payment, setPayment] = useState(null)
  const [loading, setLoading] = useState(true)
  const [refundAmount, setRefundAmount] = useState('')
  const [refundReason, setRefundReason] = useState('')
  const [refunding, setRefunding] = useState(false)
  const [showRefundModal, setShowRefundModal] = useState(false)

  useEffect(() => {
    const fetchPayment = async () => {
      try {
        const res = await adminPaymentService.getById(id)
        setPayment(res.data || res)
      } catch (err) {
        showToast('Failed to load payment details', 'error')
      } finally {
        setLoading(false)
      }
    }
    fetchPayment()
  }, [id])

  const handleRefund = async () => {
    setRefunding(true)
    try {
      const amount = refundAmount ? parseFloat(refundAmount) : undefined
      await adminPaymentService.refund(id, {
        amount,
        reason: refundReason || 'Customer requested refund',
      })
      showToast('Refund processed successfully', 'success')
      setShowRefundModal(false)
      setRefundAmount('')
      setRefundReason('')
      const res = await adminPaymentService.getById(id)
      setPayment(res.data || res)
    } catch (err) {
      showToast(err.message || 'Refund failed', 'error')
    } finally {
      setRefunding(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <svg className="w-8 h-8 animate-spin text-[#C6A972]" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    )
  }

  if (!payment) {
    return (
      <div className="text-center py-20">
        <p className="text-[var(--text-secondary)]">Payment not found</p>
        <Link to="/admin/payments" className="text-[#C6A972] hover:underline mt-4 inline-block">Back to Payments</Link>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link to="/admin/payments" className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-2xl font-semibold text-[var(--text-primary)]">Payment #{payment.id}</h1>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[payment.status] || ''}`}>
            {payment.status}
          </span>
        </div>
        {(payment.status === 'COMPLETED' || payment.status === 'REFUNDED') && (
          <button
            onClick={() => setShowRefundModal(true)}
            className="px-5 py-2.5 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition"
          >
            {payment.status === 'REFUNDED' ? 'Refund Again' : 'Refund'}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border-color)] p-6">
          <h2 className="text-sm font-semibold text-[var(--text-primary)] uppercase tracking-wider mb-4">Payment Details</h2>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-[var(--text-secondary)]">Payment ID</dt>
              <dd className="text-[var(--text-primary)] font-mono text-xs">#{payment.id}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-[var(--text-secondary)]">Amount</dt>
              <dd className="text-[var(--text-primary)] font-medium">{payment.currency} {Number(payment.amount).toFixed(2)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-[var(--text-secondary)]">Base Amount</dt>
              <dd className="text-[var(--text-primary)]">{payment.baseAmount ? Number(payment.baseAmount).toFixed(2) : '-'}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-[var(--text-secondary)]">Currency</dt>
              <dd className="text-[var(--text-primary)]">{payment.currency}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-[var(--text-secondary)]">Payment Method</dt>
              <dd className="text-[var(--text-primary)]">{payment.paymentMethod}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-[var(--text-secondary)]">Status</dt>
              <dd className="text-[var(--text-primary)]">{payment.status}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-[var(--text-secondary)]">Date</dt>
              <dd className="text-[var(--text-primary)]">{formatDate(payment.createdAt)}</dd>
            </div>
          </dl>
        </div>

        <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border-color)] p-6">
          <h2 className="text-sm font-semibold text-[var(--text-primary)] uppercase tracking-wider mb-4">Stripe Information</h2>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-[var(--text-secondary)]">PaymentIntent ID</dt>
              <dd className="text-[var(--text-primary)] font-mono text-xs break-all max-w-[250px] text-right">
                {payment.stripePaymentIntentId || payment.gatewayOrderId || '-'}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-[var(--text-secondary)]">Gateway Payment ID</dt>
              <dd className="text-[var(--text-primary)] font-mono text-xs break-all max-w-[250px] text-right">
                {payment.gatewayPaymentId || '-'}
              </dd>
            </div>
          </dl>
        </div>

        <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border-color)] p-6">
          <h2 className="text-sm font-semibold text-[var(--text-primary)] uppercase tracking-wider mb-4">Customer</h2>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-[var(--text-secondary)]">Customer Email</dt>
              <dd className="text-[var(--text-primary)]">{payment.customerEmail || '-'}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-[var(--text-secondary)]">User ID</dt>
              <dd className="text-[var(--text-primary)] font-mono text-xs">#{payment.userId}</dd>
            </div>
          </dl>
        </div>

        <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border-color)] p-6">
          <h2 className="text-sm font-semibold text-[var(--text-primary)] uppercase tracking-wider mb-4">Order</h2>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-[var(--text-secondary)]">Order Number</dt>
              <dd className="text-[var(--text-primary)]">
                {payment.orderNumber ? (
                  <Link to={`/admin/orders`} className="text-[#C6A972] hover:underline">{payment.orderNumber}</Link>
                ) : '-'}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-[var(--text-secondary)]">Order ID</dt>
              <dd className="text-[var(--text-primary)] font-mono text-xs">{payment.orderId ? `#${payment.orderId}` : '-'}</dd>
            </div>
          </dl>
        </div>
      </div>

      {payment.transactions?.length > 0 && (
        <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border-color)] p-6 mb-6">
          <h2 className="text-sm font-semibold text-[var(--text-primary)] uppercase tracking-wider mb-4">Transaction History</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[var(--bg-secondary)] text-[var(--text-secondary)] text-xs uppercase tracking-wider">
                  <th className="text-left px-4 py-2 font-medium">ID</th>
                  <th className="text-left px-4 py-2 font-medium">Transaction ID</th>
                  <th className="text-left px-4 py-2 font-medium">Gateway</th>
                  <th className="text-right px-4 py-2 font-medium">Amount</th>
                  <th className="text-center px-4 py-2 font-medium">Status</th>
                  <th className="text-left px-4 py-2 font-medium">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)]">
                {payment.transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-[var(--bg-hover)]">
                    <td className="px-4 py-2 text-[var(--text-primary)] font-mono text-xs">#{tx.id}</td>
                    <td className="px-4 py-2 text-[var(--text-primary)] font-mono text-xs max-w-[200px] truncate">{tx.transactionId || '-'}</td>
                    <td className="px-4 py-2 text-[var(--text-secondary)]">{tx.gateway}</td>
                    <td className="px-4 py-2 text-right text-[var(--text-primary)]">{tx.currency} {Number(tx.amount).toFixed(2)}</td>
                    <td className="px-4 py-2 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[tx.status] || 'bg-gray-100'}`}>
                        {tx.status}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-[var(--text-secondary)] text-xs whitespace-nowrap">{formatDate(tx.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {payment.refunds?.length > 0 && (
        <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border-color)] p-6 mb-6">
          <h2 className="text-sm font-semibold text-[var(--text-primary)] uppercase tracking-wider mb-4">Refund History</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[var(--bg-secondary)] text-[var(--text-secondary)] text-xs uppercase tracking-wider">
                  <th className="text-left px-4 py-2 font-medium">ID</th>
                  <th className="text-left px-4 py-2 font-medium">Refund ID</th>
                  <th className="text-right px-4 py-2 font-medium">Amount</th>
                  <th className="text-left px-4 py-2 font-medium">Reason</th>
                  <th className="text-center px-4 py-2 font-medium">Status</th>
                  <th className="text-left px-4 py-2 font-medium">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)]">
                {payment.refunds.map((ref) => (
                  <tr key={ref.id} className="hover:bg-[var(--bg-hover)]">
                    <td className="px-4 py-2 text-[var(--text-primary)] font-mono text-xs">#{ref.id}</td>
                    <td className="px-4 py-2 text-[var(--text-primary)] font-mono text-xs max-w-[200px] truncate">{ref.refundId || '-'}</td>
                    <td className="px-4 py-2 text-right text-[var(--text-primary)]">{payment.currency} {Number(ref.amount).toFixed(2)}</td>
                    <td className="px-4 py-2 text-[var(--text-secondary)] max-w-[200px] truncate">{ref.reason || '-'}</td>
                    <td className="px-4 py-2 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[ref.status] || 'bg-gray-100'}`}>
                        {ref.status}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-[var(--text-secondary)] text-xs whitespace-nowrap">{formatDate(ref.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showRefundModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-[var(--bg-card)] rounded-xl shadow-xl p-6 w-full max-w-md border border-[var(--border-color)]">
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Process Refund</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
                  Refund Amount (leave empty for full refund)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max={Number(payment.amount)}
                  placeholder={`Max: ${payment.currency} ${Number(payment.amount).toFixed(2)}`}
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm border border-[var(--border-color)] rounded-lg bg-[var(--bg-secondary)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-1 focus:ring-[#C6A972]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">Refund Reason</label>
                <textarea
                  rows={3}
                  placeholder="Reason for refund..."
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm border border-[var(--border-color)] rounded-lg bg-[var(--bg-secondary)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-1 focus:ring-[#C6A972] resize-none"
                />
              </div>
              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={handleRefund}
                  disabled={refunding}
                  className="flex-1 px-6 py-2.5 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {refunding ? 'Processing...' : 'Process Refund'}
                </button>
                <button
                  onClick={() => { setShowRefundModal(false); setRefundAmount(''); setRefundReason('') }}
                  disabled={refunding}
                  className="px-6 py-2.5 text-sm font-medium text-[var(--text-secondary)] rounded-lg border border-[var(--border-color)] hover:bg-[var(--bg-hover)] transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
