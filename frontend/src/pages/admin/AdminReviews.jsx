import { useState, useEffect, useMemo } from 'react'
import { reviewService } from '../../services/reviewService'
import { useToast } from '../../context/ToastContext'
import { formatDate } from '../../utils/helpers'
import BackButton from '../../components/BackButton'

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
      <div className="h-full flex flex-col gap-2 py-3">
        <div className="flex items-center gap-3">
          <BackButton />
          <h1 className="text-lg font-bold text-[var(--text-primary)] font-['Playfair_Display']">Reviews</h1>
        </div>
        <div className="flex-1 bg-[var(--bg-card)] rounded-lg border border-[var(--border-color)]/50 animate-pulse" />
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col gap-2 py-3">
      <div className="flex items-center justify-between flex-shrink-0 flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <BackButton />
          <h1 className="text-lg font-bold text-[var(--text-primary)] font-['Playfair_Display']">Reviews</h1>
        </div>
        <div className="flex gap-2">
          <input type="text" placeholder="Search by product..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-44 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg px-3 py-1.5 text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[#C6A972]" />
          {['All', 'Approved', 'Pending'].map((s) => {
            const count = s === 'All' ? reviews.length : reviews.filter((r) => mapStatus(r.approved) === s).length
            return (
              <button key={s} onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${statusFilter === s ? 'bg-[#C6A972] text-white' : 'bg-[var(--bg-card)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}>
                {s}{s !== 'All' && <span className="ml-1 text-[10px] opacity-60">({count})</span>}
              </button>
            )
          })}
        </div>
      </div>

      <div className="flex-1 min-h-0 bg-[var(--bg-card)] rounded-lg border border-[var(--border-color)]/50 overflow-hidden">
        <div className="overflow-auto h-full">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-[var(--border-color)] sticky top-0 bg-[var(--bg-card)]">
                <th className="text-left py-2 px-2 text-[var(--text-secondary)] font-medium">Product</th>
                <th className="text-left py-2 px-2 text-[var(--text-secondary)] font-medium">Customer</th>
                <th className="text-center py-2 px-2 text-[var(--text-secondary)] font-medium">Rating</th>
                <th className="text-left py-2 px-2 text-[var(--text-secondary)] font-medium hidden sm:table-cell">Review</th>
                <th className="text-left py-2 px-2 text-[var(--text-secondary)] font-medium">Status</th>
                <th className="text-right py-2 px-2 text-[var(--text-secondary)] font-medium w-16">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((review) => {
                const status = mapStatus(review.approved)
                const isLoading = actionLoading === review.id
                return (
                  <tr key={review.id} className="border-b border-[var(--border-color)]/30 hover:bg-[var(--bg-hover)] transition-colors">
                    <td className="py-1.5 px-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[var(--text-primary)] truncate max-w-[120px]">{review.productName || 'Unknown'}</span>
                      </div>
                    </td>
                    <td className="py-1.5 px-2 text-[var(--text-secondary)]">{review.userName || 'Unknown'}</td>
                    <td className="py-1.5 px-2 text-center">
                      <div className="flex justify-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <svg key={star} className={`w-3 h-3 ${star <= review.rating ? 'text-[#C6A972]' : 'text-[var(--text-secondary)]'}`} viewBox="0 0 24 24" fill={star <= review.rating ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                          </svg>
                        ))}
                      </div>
                    </td>
                    <td className="py-1.5 px-2 text-[var(--text-secondary)] truncate max-w-[200px] hidden sm:table-cell">{review.comment}</td>
                    <td className="py-1.5 px-2">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                        status === 'Approved' ? 'bg-green-500/20 text-green-600' :
                        status === 'Pending' ? 'bg-yellow-500/20 text-yellow-600' : 'bg-red-500/20 text-red-600'
                      }`}>{status}</span>
                    </td>
                    <td className="py-1.5 px-2 text-right">
                      <div className="flex items-center justify-end gap-0.5">
                        {isLoading ? (
                          <svg className="w-3.5 h-3.5 animate-spin text-[var(--text-secondary)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" strokeDasharray="32" strokeDashoffset="8"/></svg>
                        ) : (
                          <>
                            {status !== 'Approved' && (
                              <button onClick={() => handleApprove(review.id)} className="p-1 rounded text-[var(--text-secondary)] hover:text-green-600 hover:bg-green-500/10 transition-colors" title="Approve">
                                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
                              </button>
                            )}
                            {status !== 'Approved' && (
                              <button onClick={() => handleReject(review.id)} className="p-1 rounded text-[var(--text-secondary)] hover:text-red-600 hover:bg-red-500/10 transition-colors" title="Reject">
                                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                              </button>
                            )}
                            <button onClick={() => setDeleteConfirm(review.id)} className="p-1 rounded text-[var(--text-secondary)] hover:text-red-600 hover:bg-red-500/10 transition-colors" title="Delete">
                              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && !loading && <div className="text-center py-6 text-[var(--text-secondary)] text-xs">No reviews found</div>}
      </div>

      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70" onClick={() => setDeleteConfirm(null)}>
          <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border-color)] p-5 w-full max-w-sm mx-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-base font-semibold text-[var(--text-primary)] mb-1">Delete Review</h3>
            <p className="text-xs text-[var(--text-secondary)] mb-4">Are you sure?</p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setDeleteConfirm(null)} className="px-4 py-1.5 rounded-lg text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--bg-input)] hover:bg-[var(--bg-hover)] transition-colors">Cancel</button>
              <button onClick={() => handleDelete(deleteConfirm)} disabled={actionLoading === deleteConfirm} className="px-4 py-1.5 rounded-lg text-xs font-semibold text-white bg-red-500 hover:bg-red-600 transition-colors">
                {actionLoading === deleteConfirm ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
