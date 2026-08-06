import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { adminPaymentService } from '../../services/stripeService'
import { formatDate, formatPrice, getCurrencySymbol } from '../../utils/helpers'

const STATUS_COLORS = {
  PENDING: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  PROCESSING: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  COMPLETED: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  FAILED: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  CANCELLED: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
  REFUNDED: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
}

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
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-[var(--text-primary)]">Payments</h1>
        <span className="text-sm text-[var(--text-secondary)]">{payments.totalElements} total</span>
      </div>

      <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border-color)] overflow-hidden">
        <div className="p-4 border-b border-[var(--border-color)]">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder="Search by order number, email, or payment ID..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="flex-1 px-4 py-2.5 text-sm border border-[var(--border-color)] rounded-lg bg-[var(--bg-secondary)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-1 focus:ring-[#C6A972]"
            />
            <select
              value={statusFilter}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="px-4 py-2.5 text-sm border border-[var(--border-color)] rounded-lg bg-[var(--bg-secondary)] text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[#C6A972]"
            >
              <option value="">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="PROCESSING">Processing</option>
              <option value="COMPLETED">Completed</option>
              <option value="FAILED">Failed</option>
              <option value="CANCELLED">Cancelled</option>
              <option value="REFUNDED">Refunded</option>
            </select>
            <button type="submit"
              className="px-6 py-2.5 bg-[#C6A972] text-white text-sm font-medium rounded-lg hover:bg-[#B8965F] transition">
              Search
            </button>
          </form>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[var(--bg-secondary)] text-[var(--text-secondary)] text-xs uppercase tracking-wider">
                <th className="text-left px-4 py-3 font-medium">ID</th>
                <th className="text-left px-4 py-3 font-medium">Order</th>
                <th className="text-left px-4 py-3 font-medium">Customer</th>
                <th className="text-right px-4 py-3 font-medium">Amount</th>
                <th className="text-center px-4 py-3 font-medium">Currency</th>
                <th className="text-center px-4 py-3 font-medium">Method</th>
                <th className="text-center px-4 py-3 font-medium">Status</th>
                <th className="text-left px-4 py-3 font-medium">Date</th>
                <th className="text-center px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-color)]">
              {loading ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-[var(--text-secondary)]">
                    <svg className="w-6 h-6 animate-spin mx-auto text-[#C6A972]" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12">
                    <div className="flex flex-col items-center gap-3">
                      <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
                      <button onClick={() => fetchPayments()}
                        className="px-4 py-2 text-sm font-medium text-[var(--text-secondary)] rounded-lg border border-[var(--border-color)] hover:bg-[var(--bg-hover)] transition">
                        Retry
                      </button>
                    </div>
                  </td>
                </tr>
              ) : payments.content?.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-[var(--text-secondary)]">No payments found</td>
                </tr>
              ) : (
                payments.content?.map((payment) => (
                  <tr key={payment.id} className="hover:bg-[var(--bg-hover)] transition">
                    <td className="px-4 py-3 text-[var(--text-primary)] font-mono text-xs">#{payment.id}</td>
                    <td className="px-4 py-3">
                      {payment.orderNumber ? (
                        <Link to={`/admin/orders`} className="text-[#C6A972] hover:underline font-mono text-xs">
                          {payment.orderNumber}
                        </Link>
                      ) : (
                        <span className="text-[var(--text-muted)]">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-[var(--text-primary)] text-xs max-w-[150px] truncate">{payment.customerEmail || '-'}</td>
                    <td className="px-4 py-3 text-right text-[var(--text-primary)] font-medium">
                      {formatPrice(payment.amount, getCurrencySymbol(payment.currency))}
                    </td>
                    <td className="px-4 py-3 text-center text-[var(--text-secondary)] text-xs">{payment.currency}</td>
                    <td className="px-4 py-3 text-center text-[var(--text-secondary)] text-xs">{payment.paymentMethod}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[payment.status] || 'bg-gray-100 text-gray-800'}`}>
                        {payment.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[var(--text-secondary)] text-xs whitespace-nowrap">{formatDate(payment.createdAt)}</td>
                    <td className="px-4 py-3 text-center">
                      <Link to={`/admin/payments/${payment.id}`}
                        className="text-[#C6A972] hover:underline text-xs font-medium">
                        View
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {payments.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-[var(--border-color)]">
            <button
              onClick={() => setPage(Math.max(0, page - 1))}
              disabled={page === 0}
              className="px-4 py-2 text-sm font-medium text-[var(--text-secondary)] rounded-lg border border-[var(--border-color)] hover:bg-[var(--bg-hover)] disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              Previous
            </button>
            <span className="text-sm text-[var(--text-secondary)]">
              Page {payments.page + 1} of {payments.totalPages}
            </span>
            <button
              onClick={() => setPage(page + 1)}
              disabled={payments.last}
              className="px-4 py-2 text-sm font-medium text-[var(--text-secondary)] rounded-lg border border-[var(--border-color)] hover:bg-[var(--bg-hover)] disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
