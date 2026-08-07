import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { adminPaymentService } from '../../services/stripeService'
import { formatDate, formatPrice, getCurrencySymbol } from '../../utils/helpers'
import StatusBadge from '../../components/ui/StatusBadge'
import { Table, THead, TBody, TR, TH, TD } from '../../components/ui/Table'
import Pagination from '../../components/ui/Pagination'
import PageHeader from '../../components/ui/PageHeader'
import EmptyState from '../../components/EmptyState'
import Button from '../../components/ui/Button'
import { Input, Select } from '../../components/ui/Input'

export default function AdminPayments() {
  const [payments, setPayments] = useState({ content: [], totalPages: 0, totalElements: 0, page: 0, last: true })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [page, setPage] = useState(0)
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  const fetchPayments = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await adminPaymentService.getAll({
        page,
        size: 20,
        status: statusFilter || undefined,
        search: search || undefined,
      })
      setPayments(res.data || res)
    } catch (err) {
      setError(err.message || 'Failed to fetch payments')
    } finally {
      setLoading(false)
    }
  }, [page, statusFilter, search])

  useEffect(() => {
    fetchPayments()
  }, [fetchPayments])

  const handleSearch = (e) => {
    e.preventDefault()
    setSearch(searchInput.trim())
    setPage(0)
  }

  const handleStatusChange = (value) => {
    setStatusFilter(value)
    setPage(0)
  }

  return (
    <div className="flex h-full flex-col gap-4 py-4">
      <PageHeader
        title="Payments"
        description="Review and search payment transactions across your store."
        actions={
          <span className="text-sm text-sub">{payments.totalElements} total</span>
        }
      />

      <div className="min-h-0 flex-1 overflow-hidden rounded-card border border-line bg-surface shadow-sm">
        <div className="border-b border-line p-4">
          <form onSubmit={handleSearch} className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Search by order number, email, or payment ID..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
            </div>
            <div className="sm:w-52">
              <Select
                value={statusFilter}
                onChange={(e) => handleStatusChange(e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="PENDING">Pending</option>
                <option value="PROCESSING">Processing</option>
                <option value="COMPLETED">Completed</option>
                <option value="FAILED">Failed</option>
                <option value="CANCELLED">Cancelled</option>
                <option value="REFUNDED">Refunded</option>
              </Select>
            </div>
            <Button type="submit" icon="Search">
              Search
            </Button>
          </form>
        </div>

        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-gold-500 border-t-transparent" />
          </div>
        ) : error ? (
          <div className="flex h-64 flex-col items-center justify-center gap-3 px-4">
            <p className="text-sm text-danger">{error}</p>
            <Button variant="outline" size="sm" icon="RefreshCw" onClick={() => fetchPayments()}>
              Retry
            </Button>
          </div>
        ) : payments.content?.length === 0 ? (
          <div className="flex h-64 items-center justify-center">
            <EmptyState
              compact
              icon="CreditCard"
              title="No payments found"
              message="Try adjusting your filters or search query."
            />
          </div>
        ) : (
          <Table>
            <THead>
              <TR className="border-0">
                <TH>ID</TH>
                <TH>Order</TH>
                <TH>Customer</TH>
                <TH className="text-right">Amount</TH>
                <TH className="text-center">Currency</TH>
                <TH className="text-center">Method</TH>
                <TH className="text-center">Status</TH>
                <TH>Date</TH>
                <TH className="text-center">Actions</TH>
              </TR>
            </THead>
            <TBody>
              {payments.content?.map((payment) => (
                <TR key={payment.id} className="hover:bg-subtle">
                  <TD className="font-mono text-xs text-ink">#{payment.id}</TD>
                  <TD>
                    {payment.orderNumber ? (
                      <Link to={`/admin/orders`} className="font-mono text-xs text-gold-600 hover:underline">
                        {payment.orderNumber}
                      </Link>
                    ) : (
                      <span className="text-faint">-</span>
                    )}
                  </TD>
                  <TD className="max-w-[150px] truncate text-xs text-ink">{payment.customerEmail || '-'}</TD>
                  <TD className="text-right font-medium text-ink">
                    {formatPrice(payment.amount, getCurrencySymbol(payment.currency))}
                  </TD>
                  <TD className="text-center text-xs text-sub">{payment.currency}</TD>
                  <TD className="text-center text-xs text-sub">{payment.paymentMethod}</TD>
                  <TD className="text-center">
                    <StatusBadge status={payment.status} />
                  </TD>
                  <TD className="whitespace-nowrap text-xs text-sub">{formatDate(payment.createdAt)}</TD>
                  <TD className="text-center">
                    <Link to={`/admin/payments/${payment.id}`} className="text-xs font-medium text-gold-600 hover:underline">
                      View
                    </Link>
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>
        )}

        {!loading && !error && payments.totalPages > 1 && (
          <div className="flex flex-shrink-0 flex-col items-center justify-between gap-3 border-t border-line px-4 py-3 sm:flex-row">
            <span className="text-[11px] text-sub">
              {payments.totalElements} payment{payments.totalElements === 1 ? '' : 's'} · Page {page + 1} of {Math.max(1, payments.totalPages)}
            </span>
            <Pagination
              page={page + 1}
              totalPages={Math.max(1, payments.totalPages)}
              onPageChange={(p) => setPage(p - 1)}
            />
          </div>
        )}
      </div>
    </div>
  )
}
