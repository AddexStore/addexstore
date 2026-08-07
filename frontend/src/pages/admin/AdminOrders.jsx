import { useState, useMemo, useEffect, Fragment } from 'react'
import { orderService } from '../../services/orderService'
import { getAssetUrl } from '../../services/api'
import { useToast } from '../../context/ToastContext'
import { formatPrice, formatDate, getCurrencySymbol } from '../../utils/helpers'
import StatusBadge, { getStatusTone } from '../../components/ui/StatusBadge'
import { getToneClass } from '../../components/ui/Badge'
import { Table, THead, TBody, TR, TH, TD } from '../../components/ui/Table'
import Pagination from '../../components/ui/Pagination'
import PageHeader from '../../components/ui/PageHeader'
import Tabs from '../../components/ui/Tabs'
import EmptyState from '../../components/EmptyState'
import Icon from '../../components/ui/Icon'

const PAGE_SIZE = 20

const TABS = [
  { key: 'All', label: 'All' },
  { key: 'Pending', label: 'Pending' },
  { key: 'Pending Payment', label: 'Pending Payment' },
  { key: 'Processing', label: 'Processing' },
  { key: 'Shipped', label: 'Shipped' },
  { key: 'Delivered', label: 'Delivered' },
  { key: 'Cancelled', label: 'Cancelled' },
  { key: 'Refunded', label: 'Refunded' },
]

const VALID_TRANSITIONS = {
  Pending: ['Pending Payment', 'Processing', 'Cancelled'],
  'Pending Payment': ['Processing', 'Cancelled'],
  Processing: ['Shipped', 'Cancelled', 'Refunded'],
  Shipped: ['Delivered', 'Cancelled', 'Refunded'],
  Delivered: ['Refunded'],
  Cancelled: [],
  Refunded: [],
}

const toDisplayStatus = (status = '') =>
  status.toLowerCase().replace(/(^|_)([a-z])/g, (_, __, char) => char.toUpperCase())

const toApiStatus = (status = '') => status.toUpperCase().replace(/\s+/g, '_')

const mapOrder = (order) => ({
  id: order.id,
  orderNumber: order.orderNumber || `ORD-${order.id}`,
  userId: order.userId,
  customerName: order.userName || 'Unknown',
  customerEmail: order.userEmail || '',
  items: (order.items || []).map((item) => ({
    id: item.id,
    productId: item.productId,
    name: item.productName || 'Product',
    image: item.productImage || '/assets/placeholders/product.svg',
    price: Number(item.price || 0),
    quantity: item.quantity || 0,
    subtotal: Number(item.subtotal || 0),
  })),
  subtotal: Number(order.subtotal || 0),
  tax: Number(order.tax || 0),
  shippingCost: Number(order.shippingCost || 0),
  totalAmount: Number(order.totalAmount || 0),
  currency: order.currency || 'USD',
  status: toDisplayStatus(order.status || 'PENDING'),
  shippingAddress: order.shippingAddress || {},
  paymentMethod: order.paymentMethod || '',
  notes: order.notes || '',
  createdAt: order.createdAt,
})

export default function AdminOrders() {
  const { showToast } = useToast()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('All')
  const [search, setSearch] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [expandedId, setExpandedId] = useState(null)

  useEffect(() => {
    const timer = setTimeout(() => setSearchTerm(search.trim()), 300)
    return () => clearTimeout(timer)
  }, [search])

  useEffect(() => {
    setPage(0)
  }, [activeTab, searchTerm])

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true)
        const status = activeTab === 'All' ? undefined : toApiStatus(activeTab)
        const res = await orderService.getAdminOrders({
          page,
          size: PAGE_SIZE,
          status,
          search: searchTerm || undefined,
        })
        const data = res.data || {}
        setOrders((data.content || []).map(mapOrder))
        setTotalPages(data.totalPages || 0)
        setTotalElements(data.totalElements || 0)
      } catch (e) {
        showToast(e.message || 'Failed to load orders', 'error')
      } finally {
        setLoading(false)
      }
    }
    fetchOrders()
  }, [activeTab, searchTerm, page])

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const res = await orderService.updateAdminOrderStatus(orderId, toApiStatus(newStatus))
      const updated = mapOrder(res.data)
      setOrders((prev) => prev.map((order) => (order.id === orderId ? updated : order)))
      showToast(`Order ${updated.orderNumber} updated to ${newStatus}`, 'success')
    } catch (e) {
      showToast(e.message || 'Failed to update order status', 'error')
    }
  }

  const renderedOrders = useMemo(() => orders, [orders])

  return (
    <div className="flex h-full flex-col gap-4 py-4">
      <PageHeader
        title="Orders"
        description="Manage, search, and update order statuses across your store."
        actions={
          <div className="relative w-full sm:w-72">
            <Icon name="Search" size="sm" className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-faint" />
            <input
              type="text"
              placeholder="Search order or customer..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-11 w-full rounded-field border border-line bg-inset pl-10 pr-4 text-sm text-ink placeholder-faint transition-colors focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-500/25"
            />
          </div>
        }
      />

      <div className="flex flex-shrink-0 flex-wrap gap-1">
        <Tabs tabs={TABS} activeKey={activeTab} onChange={(key) => { setExpandedId(null); setActiveTab(key) }} />
      </div>

      <div className="min-h-0 flex-1 overflow-hidden rounded-card border border-line bg-surface shadow-sm">
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-gold-500 border-t-transparent" />
          </div>
        ) : renderedOrders.length === 0 ? (
          <div className="flex h-64 items-center justify-center">
            <EmptyState
              compact
              icon="Package"
              title="No orders found"
              message="Try adjusting your filters or search query."
            />
          </div>
        ) : (
          <Table>
            <THead>
              <TR className="border-0">
                <TH>ID</TH>
                <TH>Customer</TH>
                <TH className="text-center">Items</TH>
                <TH className="text-right">Total</TH>
                <TH>Status</TH>
                <TH className="w-10 text-right" />
              </TR>
            </THead>
            <TBody>
              {renderedOrders.map((order) => {
                const isExpanded = expandedId === order.id
                const transitions = VALID_TRANSITIONS[order.status] || []
                const toneClass = getToneClass(getStatusTone(order.status))
                return (
                  <Fragment key={order.id}>
                    <TR
                      className="cursor-pointer hover:bg-subtle"
                      onClick={() => setExpandedId(isExpanded ? null : order.id)}
                    >
                      <TD className="font-mono text-[11px] text-ink">{order.orderNumber}</TD>
                      <TD className="text-sub">{order.customerName}</TD>
                      <TD className="text-center text-sub">{order.items.length}</TD>
                      <TD className="text-right text-ink">{formatPrice(order.totalAmount, getCurrencySymbol(order.currency))}</TD>
                      <TD>
                        {transitions.length === 0 ? (
                          <StatusBadge status={order.status} />
                        ) : (
                          <select
                            value={order.status}
                            onChange={(e) => {
                              e.stopPropagation()
                              handleStatusChange(order.id, e.target.value)
                            }}
                            onClick={(e) => e.stopPropagation()}
                            aria-label={`Change status for ${order.orderNumber}`}
                            className={`cursor-pointer rounded-full border text-[10px] font-medium uppercase focus:outline-none ${toneClass}`}
                          >
                            <option value={order.status} disabled className="bg-surface text-sub">
                              {order.status}
                            </option>
                            {transitions.map((s) => (
                              <option key={s} value={s} className="bg-surface text-sub">
                                {s}
                              </option>
                            ))}
                          </select>
                        )}
                      </TD>
                      <TD className="text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setExpandedId(isExpanded ? null : order.id)
                          }}
                          aria-label={isExpanded ? 'Collapse details' : 'Expand details'}
                          className="rounded-soft p-1.5 text-sub transition-colors hover:text-gold-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-500"
                        >
                          <Icon name={isExpanded ? 'ChevronUp' : 'ChevronDown'} size="sm" />
                        </button>
                      </TD>
                    </TR>
                    {isExpanded && (
                      <TR className="bg-page">
                        <TD colSpan={6} className="px-4 py-4">
                          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            <div>
                              <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-sub">Items</p>
                              {order.items.map((item) => (
                                <div key={item.id || item.productId} className="flex items-center gap-3 py-1.5">
                                  <img
                                    src={getAssetUrl(item.image)}
                                    alt={item.name}
                                    onError={(e) => {
                                      e.currentTarget.src = '/assets/placeholders/product.svg'
                                    }}
                                    className="h-10 w-10 rounded-soft bg-surface object-cover"
                                  />
                                  <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm text-ink">{item.name}</p>
                                    <p className="text-[11px] text-sub">
                                      x{item.quantity} @ {formatPrice(item.price, getCurrencySymbol(order.currency))}
                                    </p>
                                  </div>
                                </div>
                              ))}
                              <div className="mt-3 space-y-1.5 border-t border-line pt-3 text-xs">
                                <div className="flex justify-between">
                                  <span className="text-sub">Subtotal</span>
                                  <span className="text-ink">{formatPrice(order.subtotal, getCurrencySymbol(order.currency))}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-sub">Tax</span>
                                  <span className="text-ink">{formatPrice(order.tax, getCurrencySymbol(order.currency))}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-sub">Shipping</span>
                                  <span className="text-ink">{formatPrice(order.shippingCost, getCurrencySymbol(order.currency))}</span>
                                </div>
                                <div className="flex justify-between border-t border-line pt-2 font-semibold text-ink">
                                  <span>Total</span>
                                  <span>{formatPrice(order.totalAmount, getCurrencySymbol(order.currency))}</span>
                                </div>
                              </div>
                            </div>
                            <div className="space-y-4 text-xs">
                              <div>
                                <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-sub">Customer</p>
                                <p className="text-ink">{order.customerName}</p>
                                <p className="text-[11px] text-sub">{order.customerEmail}</p>
                              </div>
                              <div>
                                <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-sub">Payment</p>
                                <p className="text-ink">{order.paymentMethod || 'Not available'}</p>
                              </div>
                              <div>
                                <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-sub">Placed</p>
                                <p className="text-ink">{formatDate(order.createdAt)}</p>
                              </div>
                              <div>
                                <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-sub">Shipping</p>
                                <p className="text-ink">{order.shippingAddress.street || 'Not available'}</p>
                                <p className="text-[11px] text-sub">
                                  {[order.shippingAddress.city, order.shippingAddress.state, order.shippingAddress.zip, order.shippingAddress.country].filter(Boolean).join(', ')}
                                </p>
                              </div>
                            </div>
                          </div>
                        </TD>
                      </TR>
                    )}
                  </Fragment>
                )
              })}
            </TBody>
          </Table>
        )}

        {!loading && renderedOrders.length > 0 && totalPages > 0 && (
          <div className="flex flex-shrink-0 flex-col items-center justify-between gap-3 border-t border-line px-4 py-3 sm:flex-row">
            <span className="text-[11px] text-sub">
              {totalElements} order{totalElements === 1 ? '' : 's'} · Page {page + 1} of {Math.max(1, totalPages)}
            </span>
            <Pagination
              page={page + 1}
              totalPages={Math.max(1, totalPages)}
              onPageChange={(p) => setPage(p - 1)}
            />
          </div>
        )}
      </div>
    </div>
  )
}
