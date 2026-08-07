import { useState, useEffect, useMemo } from 'react'
import { reviewService } from '../../services/reviewService'
import { useToast } from '../../context/ToastContext'
import Badge from '../../components/ui/Badge'
import StarRating from '../../components/StarRating'
import { Table, THead, TBody, TR, TH, TD } from '../../components/ui/Table'
import Tabs from '../../components/ui/Tabs'
import PageHeader from '../../components/ui/PageHeader'
import EmptyState from '../../components/EmptyState'
import Icon from '../../components/ui/Icon'
import { ConfirmDialog } from '../../components/ui/Modal'

function mapStatus(approved) {
  return approved ? 'Approved' : 'Pending'
}

export default function AdminReviews() {
  const { showToast } = useToast()
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [actionLoading, setActionLoading] = useState(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const res = await reviewService.getAdminReviews(0, 50)
        const list = Array.isArray(res) ? res : res?.content || []
        if (!cancelled) setReviews(list)
      } catch (err) {
        showToast('Failed to load reviews', 'error')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [showToast])

  const filtered = useMemo(() => {
    return reviews.filter((r) => {
      if (statusFilter !== 'All') {
        const s = mapStatus(r.approved)
        if (s !== statusFilter) return false
      }
      if (search) {
        const q = search.toLowerCase()
        if (!r.productName?.toLowerCase().includes(q)) return false
      }
      return true
    })
  }, [reviews, search, statusFilter])

  const filterTabs = [
    { key: 'All', label: 'All' },
    { key: 'Approved', label: 'Approved', count: reviews.filter((r) => mapStatus(r.approved) === 'Approved').length },
    { key: 'Pending', label: 'Pending', count: reviews.filter((r) => mapStatus(r.approved) === 'Pending').length },
  ]

  const handleApprove = async (id) => {
    setActionLoading(id)
    try {
      await reviewService.approveReview(id)
      setReviews((prev) => prev.map((r) => (r.id === id ? { ...r, approved: true } : r)))
      showToast('Review approved', 'success')
    } catch (err) {
      showToast(err.message || 'Failed to approve review', 'error')
    } finally {
      setActionLoading(null)
    }
  }

  const handleReject = async (id) => {
    setActionLoading(id)
    try {
      await reviewService.deleteReview(id)
      setReviews((prev) => prev.filter((r) => r.id !== id))
      showToast('Review rejected', 'success')
    } catch (err) {
      showToast(err.message || 'Failed to reject review', 'error')
    } finally {
      setActionLoading(null)
    }
  }

  const handleDelete = async (id) => {
    setActionLoading(id)
    try {
      await reviewService.deleteReview(id)
      setReviews((prev) => prev.filter((r) => r.id !== id))
      showToast('Review deleted', 'success')
    } catch (err) {
      showToast(err.message || 'Failed to delete review', 'error')
    } finally {
      setActionLoading(null)
      setDeleteConfirm(null)
    }
  }

  if (loading) {
    return (
      <div className="flex h-full flex-col gap-4 py-4">
        <PageHeader title="Reviews" description="Moderate customer reviews before they go live." />
        <div className="h-64 animate-pulse rounded-card border border-line bg-surface shadow-sm" />
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col gap-4 py-4">
      <PageHeader
        title="Reviews"
        description="Moderate customer reviews before they go live."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative w-full sm:w-64">
              <Icon name="Search" size="sm" className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-faint" />
              <input
                type="text"
                placeholder="Search by product..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-11 w-full rounded-field border border-line bg-inset pl-10 pr-4 text-sm text-ink placeholder-faint transition-colors focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-500/25"
              />
            </div>
            <Tabs tabs={filterTabs} activeKey={statusFilter} onChange={setStatusFilter} />
          </div>
        }
      />

      <div className="min-h-0 flex-1 overflow-hidden rounded-card border border-line bg-surface shadow-sm">
        {filtered.length === 0 ? (
          <div className="flex h-64 items-center justify-center">
            <EmptyState
              compact
              icon="MessageSquare"
              title="No reviews found"
              message="Try adjusting your filters or search query."
            />
          </div>
        ) : (
          <div className="h-full overflow-auto">
            <Table>
              <THead>
                <TR className="border-0">
                  <TH className="px-2 py-2">Product</TH>
                  <TH className="px-2 py-2">Customer</TH>
                  <TH className="px-2 py-2 text-center">Rating</TH>
                  <TH className="hidden px-2 py-2 sm:table-cell">Review</TH>
                  <TH className="px-2 py-2">Status</TH>
                  <TH className="w-16 px-2 py-2 text-right">Actions</TH>
                </TR>
              </THead>
              <TBody>
                {filtered.map((review) => {
                  const status = mapStatus(review.approved)
                  const isLoading = actionLoading === review.id
                  return (
                    <TR key={review.id} className="hover:bg-subtle">
                      <TD className="px-2 py-2">
                        <span className="block max-w-[120px] truncate text-ink">{review.productName || 'Unknown'}</span>
                      </TD>
                      <TD className="px-2 py-2 text-sub">{review.userName || 'Unknown'}</TD>
                      <TD className="px-2 py-2 text-center">
                        <div className="flex justify-center">
                          <StarRating rating={review.rating || 0} size="xs" />
                        </div>
                      </TD>
                      <TD className="hidden max-w-[200px] truncate px-2 py-2 text-sub sm:table-cell">{review.comment}</TD>
                      <TD className="px-2 py-2">
                        <Badge tone={status === 'Approved' ? 'success' : 'warning'} size="sm">{status}</Badge>
                      </TD>
                      <TD className="px-2 py-2 text-right">
                        <div className="flex items-center justify-end gap-0.5">
                          {isLoading ? (
                            <Icon name="Loader2" size="sm" className="animate-spin text-sub" />
                          ) : (
                            <>
                              {status !== 'Approved' && (
                                <button onClick={() => handleApprove(review.id)} className="rounded-soft p-1 text-sub transition-colors hover:bg-success/10 hover:text-success" title="Approve" aria-label="Approve">
                                  <Icon name="Check" size="sm" />
                                </button>
                              )}
                              {status !== 'Approved' && (
                                <button onClick={() => handleReject(review.id)} className="rounded-soft p-1 text-sub transition-colors hover:bg-danger/10 hover:text-danger" title="Reject" aria-label="Reject">
                                  <Icon name="X" size="sm" />
                                </button>
                              )}
                              <button onClick={() => setDeleteConfirm(review.id)} className="rounded-soft p-1 text-sub transition-colors hover:bg-danger/10 hover:text-danger" title="Delete" aria-label="Delete">
                                <Icon name="Trash2" size="sm" />
                              </button>
                            </>
                          )}
                        </div>
                      </TD>
                    </TR>
                  )
                })}
              </TBody>
            </Table>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={deleteConfirm !== null}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={() => handleDelete(deleteConfirm)}
        title="Delete Review"
        message="Are you sure you want to delete this review?"
        confirmLabel="Delete"
        danger
        loading={actionLoading === deleteConfirm}
      />
    </div>
  )
}
