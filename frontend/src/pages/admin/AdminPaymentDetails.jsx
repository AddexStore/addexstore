import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { adminPaymentService } from '../../services/stripeService'
import { formatDate, formatPrice, getCurrencySymbol } from '../../utils/helpers'
import { useToast } from '../../context/ToastContext'
import Button from '../../components/ui/Button'
import Icon from '../../components/ui/Icon'
import StatusBadge from '../../components/ui/StatusBadge'
import Modal from '../../components/ui/Modal'
import PageHeader from '../../components/ui/PageHeader'
import EmptyState from '../../components/EmptyState'
import { Field, Input, Textarea } from '../../components/ui/Input'
import { Table, THead, TBody, TR, TH, TD } from '../../components/ui/Table'

function DetailCard({ title, children }) {
  return (
    <div className="rounded-card border border-line bg-surface p-6 shadow-sm">
      <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-sub">{title}</h2>
      <dl className="space-y-3 text-sm">{children}</dl>
    </div>
  )
}

function DetailRow({ label, children, mono }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-sub">{label}</dt>
      <dd className={`text-right text-ink ${mono ? 'font-mono text-xs break-all max-w-[250px]' : ''}`}>{children}</dd>
    </div>
  )
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
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gold-500 border-t-transparent" />
      </div>
    )
  }

  if (!payment) {
    return (
      <div className="py-20 text-center">
        <EmptyState
          icon="CreditCard"
          title="Payment not found"
          message="This payment record could not be located."
          actionLabel="Back to Payments"
          actionLink="/admin/payments"
        />
      </div>
    )
  }

  const successfulRefunds = (payment.refunds || []).filter((r) => r.status === 'SUCCEEDED')
  const refundedTotal = successfulRefunds.reduce((sum, r) => sum + Number(r.amount || 0), 0)
  const paymentAmount = Number(payment.amount || 0)
  const maxRefundable = Math.max(0, paymentAmount - refundedTotal)
  const canRefund = (payment.status === 'COMPLETED' || payment.status === 'REFUNDED') && maxRefundable > 0

  return (
    <div className="py-4">
      <PageHeader
        eyebrow="Payments"
        title={`Payment #${payment.id}`}
        description={`Payment record for ${payment.customerEmail || 'unknown customer'}.`}
        actions={
          canRefund && (
            <Button
              variant="dangerSolid"
              icon="HandCoins"
              onClick={() => setShowRefundModal(true)}
            >
              {payment.status === 'REFUNDED' ? 'Refund Again' : 'Refund'}
            </Button>
          )
        }
      />

      <div className="mb-6 flex items-center gap-3">
        <span className="text-sm text-sub">Status</span>
        <StatusBadge status={payment.status} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <DetailCard title="Payment Details">
          <DetailRow label="Payment ID" mono>#{payment.id}</DetailRow>
          <DetailRow label="Amount"><span className="font-medium text-ink">{formatPrice(payment.amount, getCurrencySymbol(payment.currency))}</span></DetailRow>
          <DetailRow label="Base Amount">{formatPrice(payment.baseAmount, getCurrencySymbol(payment.currency))}</DetailRow>
          <DetailRow label="Refunded">{formatPrice(refundedTotal, getCurrencySymbol(payment.currency))}</DetailRow>
          <DetailRow label="Remaining Refundable">{formatPrice(maxRefundable, getCurrencySymbol(payment.currency))}</DetailRow>
          <DetailRow label="Currency">{payment.currency}</DetailRow>
          <DetailRow label="Payment Method">{payment.paymentMethod}</DetailRow>
          <DetailRow label="Date">{formatDate(payment.createdAt)}</DetailRow>
        </DetailCard>

        <DetailCard title="Gateway Information">
          <DetailRow label="Gateway Order ID" mono>{payment.gatewayOrderId || '-'}</DetailRow>
          <DetailRow label="Gateway Payment ID" mono>{payment.gatewayPaymentId || '-'}</DetailRow>
        </DetailCard>

        <DetailCard title="Customer">
          <DetailRow label="Customer Email">{payment.customerEmail || '-'}</DetailRow>
          <DetailRow label="User ID" mono>#{payment.userId}</DetailRow>
        </DetailCard>

        <DetailCard title="Order">
          <DetailRow label="Order Number">
            {payment.orderNumber ? (
              <Link to="/admin/orders" className="text-gold-600 hover:underline">{payment.orderNumber}</Link>
            ) : '-'}
          </DetailRow>
          <DetailRow label="Order ID" mono>{payment.orderId ? `#${payment.orderId}` : '-'}</DetailRow>
        </DetailCard>
      </div>

      {payment.transactions?.length > 0 && (
        <div className="mt-6 rounded-card border border-line bg-surface p-6 shadow-sm">
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-sub">Transaction History</h2>
          <Table>
            <THead>
              <TR className="border-0">
                <TH>ID</TH>
                <TH>Transaction ID</TH>
                <TH>Gateway</TH>
                <TH className="text-right">Amount</TH>
                <TH className="text-center">Status</TH>
                <TH>Date</TH>
              </TR>
            </THead>
            <TBody>
              {payment.transactions.map((tx) => (
                <TR key={tx.id} className="hover:bg-subtle">
                  <TD className="font-mono text-xs text-ink">#{tx.id}</TD>
                  <TD className="max-w-[200px] truncate font-mono text-xs text-ink">{tx.transactionId || '-'}</TD>
                  <TD className="text-sub">{tx.gateway}</TD>
                  <TD className="text-right text-ink">{tx.currency} {Number(tx.amount).toFixed(2)}</TD>
                  <TD className="text-center"><StatusBadge status={tx.status} /></TD>
                  <TD className="whitespace-nowrap text-xs text-sub">{formatDate(tx.createdAt)}</TD>
                </TR>
              ))}
            </TBody>
          </Table>
        </div>
      )}

      {payment.refunds?.length > 0 && (
        <div className="mt-6 rounded-card border border-line bg-surface p-6 shadow-sm">
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-sub">Refund History</h2>
          <Table>
            <THead>
              <TR className="border-0">
                <TH>ID</TH>
                <TH>Refund ID</TH>
                <TH className="text-right">Amount</TH>
                <TH>Reason</TH>
                <TH className="text-center">Status</TH>
                <TH>Date</TH>
              </TR>
            </THead>
            <TBody>
              {payment.refunds.map((ref) => (
                <TR key={ref.id} className="hover:bg-subtle">
                  <TD className="font-mono text-xs text-ink">#{ref.id}</TD>
                  <TD className="max-w-[200px] truncate font-mono text-xs text-ink">{ref.refundId || '-'}</TD>
                  <TD className="text-right text-ink">{formatPrice(ref.amount, getCurrencySymbol(payment.currency))}</TD>
                  <TD className="max-w-[200px] truncate text-sub">{ref.reason || '-'}</TD>
                  <TD className="text-center"><StatusBadge status={ref.status} /></TD>
                  <TD className="whitespace-nowrap text-xs text-sub">{formatDate(ref.createdAt)}</TD>
                </TR>
              ))}
            </TBody>
          </Table>
        </div>
      )}

      <Modal
        open={showRefundModal}
        onClose={() => { setShowRefundModal(false); setRefundAmount(''); setRefundReason('') }}
        title="Process Refund"
        size="md"
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => { setShowRefundModal(false); setRefundAmount(''); setRefundReason('') }}
              disabled={refunding}
            >
              Cancel
            </Button>
            <Button variant="dangerSolid" icon="HandCoins" onClick={handleRefund} loading={refunding}>
              Process Refund
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Field
            label="Refund Amount"
            hint={`Leave empty for full remaining refund. Remaining refundable: ${formatPrice(maxRefundable, getCurrencySymbol(payment.currency))} (${formatPrice(refundedTotal, getCurrencySymbol(payment.currency))} already refunded).`}
          >
            <Input
              type="number"
              step="0.01"
              min="0"
              max={maxRefundable}
              placeholder={`Max: ${formatPrice(maxRefundable, getCurrencySymbol(payment.currency))}`}
              value={refundAmount}
              onChange={(e) => setRefundAmount(e.target.value)}
            />
          </Field>
          <Field label="Refund Reason">
            <Textarea
              rows={3}
              placeholder="Reason for refund..."
              value={refundReason}
              onChange={(e) => setRefundReason(e.target.value)}
            />
          </Field>
        </div>
      </Modal>
    </div>
  )
}
