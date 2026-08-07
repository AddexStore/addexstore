import Badge from './Badge'

const STATUS_TONE = {
  PENDING: 'warning',
  PENDINGPAYMENT: 'info',
  PROCESSING: 'info',
  SHIPPED: 'gold',
  DELIVERED: 'success',
  CANCELLED: 'danger',
  REFUNDED: 'neutral',
  ACTIVE: 'success',
  INACTIVE: 'neutral',
  BLOCKED: 'danger',
  SUSPENDED: 'danger',
  DRAFT: 'neutral',
  PUBLISHED: 'success',
  ARCHIVED: 'neutral',
  LOWSTOCK: 'warning',
  OUTOFSTOCK: 'danger',
  PAID: 'success',
  UNPAID: 'warning',
  REFUNDEDPAYMENT: 'neutral',
  COMPLETED: 'success',
  SUCCEEDED: 'success',
  FAILED: 'danger',
  ERROR: 'danger',
}

const normalize = (status) => String(status || '').toUpperCase().replace(/[_\s]+/g, '')

export function getStatusTone(status) {
  return STATUS_TONE[normalize(status)] || 'neutral'
}

/**
 * Order/status badge shared by customer + admin areas.
 * Accepts any status string; unknown statuses fall back to neutral.
 */
export default function StatusBadge({ status, className = '' }) {
  const display = String(status || '').replace(/_/g, ' ').toUpperCase()
  return (
    <Badge tone={getStatusTone(status)} size="sm" className={className}>
      {display}
    </Badge>
  )
}
