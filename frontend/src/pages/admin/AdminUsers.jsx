import { useCallback, useEffect, useRef, useState } from 'react'
import { adminService } from '../../services/adminService'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { formatDate } from '../../utils/helpers'
import BackButton from '../../components/BackButton'

const ROLE_LABELS = { ADMIN: 'Admin', CUSTOMER: 'Customer' }

const ROLE_BADGE_STYLES = {
  ADMIN: 'bg-[#C6A972]/20 text-[#C6A972]',
  CUSTOMER: 'bg-blue-500/20 text-blue-400',
}

const SORT_FIELDS = {
  name: 'name',
  email: 'email',
  role: 'role',
  createdAt: 'createdAt',
  blocked: 'blocked',
}

function Spinner({ label }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-10 text-[var(--text-secondary)]">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-[var(--border-color)] border-t-[#C6A972]" aria-hidden="true" />
      <span className="text-xs">{label}</span>
    </div>
  )
}

function ErrorState({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-4 py-10 text-center">
      <p className="text-sm font-medium text-[var(--text-primary)]">Failed to load users</p>
      <p className="max-w-md text-xs text-[var(--text-secondary)]">{message}</p>
      <button
        onClick={onRetry}
        className="mt-1 rounded-lg bg-[#C6A972] px-4 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[#B8965F] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C6A972]"
      >
        Retry
      </button>
    </div>
  )
}

function EmptyState({ hasFilters, onClear }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-4 py-10 text-center">
      <p className="text-sm font-medium text-[var(--text-primary)]">No users found</p>
      <p className="max-w-md text-xs text-[var(--text-secondary)]">
        {hasFilters ? 'Try adjusting your search or filters.' : 'Users who register on the store will appear here.'}
      </p>
      {hasFilters && (
        <button
          onClick={onClear}
          className="mt-1 rounded-lg bg-[#C6A972] px-4 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[#B8965F] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C6A972]"
        >
          Clear filters
        </button>
      )}
    </div>
  )
}

function SortableTh({ label, sortKey, sortBy, sortDir, onSort }) {
  const isActive = sortBy === sortKey
  return (
    <th scope="col" className="py-2 px-2 text-left font-medium text-[var(--text-secondary)]">
      <button
        type="button"
        onClick={() => onSort(sortKey)}
        className={`inline-flex items-center gap-1 rounded transition-colors hover:text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C6A972] ${isActive ? 'text-[var(--text-primary)]' : ''}`}
      >
        {label}
        <svg
          className={`h-2.5 w-2.5 transition-transform ${isActive && sortDir === 'asc' ? '' : 'rotate-180'}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M12 5l7 7h-14z" />
        </svg>
      </button>
    </th>
  )
}

function ConfirmDialog({ title, description, confirmLabel, busy, onConfirm, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
      <div
        className="w-full max-w-sm rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] p-5"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <h2 className="text-base font-semibold text-[var(--text-primary)]">{title}</h2>
        <p className="mt-1 text-xs text-[var(--text-secondary)]">{description}</p>
        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="rounded-lg border border-[var(--border-color)] px-4 py-1.5 text-xs font-medium text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)] disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className="rounded-lg bg-[#C6A972] px-4 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[#B8965F] disabled:opacity-50"
          >
            {busy ? 'Working...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

function UserDetailModal({ user, currentUserId, busy, onUpdateRole, onToggleBlock, onClose }) {
  const isSelf = Number(user.id) === Number(currentUserId)
  const roleLabels = Object.entries(ROLE_LABELS)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
      <div
        className="max-h-[80vh] w-full max-w-lg overflow-y-auto rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)]"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={`${user.name} details`}
      >
        <div className="flex items-center justify-between border-b border-[var(--border-color)] p-4">
          <div className="flex items-center gap-3">
            {user.avatar ? (
              <img src={user.avatar} alt={user.name} className="h-10 w-10 rounded-full bg-[var(--bg-card)]" />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--bg-hover)] text-sm font-semibold text-[var(--text-secondary)]">
                {user.name?.charAt(0)?.toUpperCase() || '?'}
              </div>
            )}
            <div>
              <h2 className="text-base font-semibold text-[var(--text-primary)]">{user.name}</h2>
              <p className="text-xs text-[var(--text-secondary)]">{user.email}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded p-1 text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]"
            aria-label="Close details"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2 p-4">
          <div className="rounded-lg bg-[var(--bg-input)] p-3">
            <p className="text-[10px] uppercase tracking-wider text-[var(--text-secondary)]">Role</p>
            <p className="mt-0.5 text-sm text-[var(--text-primary)] capitalize">{ROLE_LABELS[user.role] || user.role}</p>
          </div>
          <div className="rounded-lg bg-[var(--bg-input)] p-3">
            <p className="text-[10px] uppercase tracking-wider text-[var(--text-secondary)]">Status</p>
            <p className={`mt-0.5 text-sm ${user.blocked ? 'text-red-600' : 'text-green-600'}`}>
              {user.blocked ? 'Blocked' : 'Active'}
            </p>
          </div>
          <div className="rounded-lg bg-[var(--bg-input)] p-3">
            <p className="text-[10px] uppercase tracking-wider text-[var(--text-secondary)]">Phone</p>
            <p className="mt-0.5 text-sm text-[var(--text-primary)]">{user.phone || '-'}</p>
          </div>
          <div className="rounded-lg bg-[var(--bg-input)] p-3">
            <p className="text-[10px] uppercase tracking-wider text-[var(--text-secondary)]">Joined</p>
            <p className="mt-0.5 text-sm text-[var(--text-primary)]">{formatDate(user.createdAt)}</p>
          </div>
          <div className="rounded-lg bg-[var(--bg-input)] p-3">
            <p className="text-[10px] uppercase tracking-wider text-[var(--text-secondary)]">Last updated</p>
            <p className="mt-0.5 text-sm text-[var(--text-primary)]">{formatDate(user.updatedAt)}</p>
          </div>
          <div className="rounded-lg bg-[var(--bg-input)] p-3">
            <p className="text-[10px] uppercase tracking-wider text-[var(--text-secondary)]">User ID</p>
            <p className="mt-0.5 font-mono text-sm text-[var(--text-primary)]">#{user.id}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 border-t border-[var(--border-color)] p-4">
          <label className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
            Role
            <select
              value={user.role}
              disabled={busy || isSelf}
              onChange={(e) => onUpdateRole(e.target.value)}
              className="rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] px-2 py-1.5 text-xs text-[var(--text-primary)] focus:border-[#C6A972] focus:outline-none disabled:opacity-50"
              title={isSelf ? 'You cannot change your own role' : 'Change role'}
            >
              {roleLabels.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            onClick={onToggleBlock}
            disabled={busy || isSelf}
            className={`ml-auto rounded-lg px-4 py-1.5 text-xs font-semibold transition-colors disabled:opacity-50 ${
              user.blocked
                ? 'bg-green-500/20 text-green-600 hover:bg-green-500/30'
                : 'bg-red-500/20 text-red-600 hover:bg-red-500/30'
            }`}
            title={isSelf ? 'You cannot modify your own account' : user.blocked ? 'Unblock user' : 'Block user'}
          >
            {user.blocked ? 'Unblock user' : 'Block user'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function AdminUsers() {
  const { showToast } = useToast()
  const { user: currentUser } = useAuth()

  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [page, setPage] = useState(0)
  const [size, setSize] = useState(10)
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [sortBy, setSortBy] = useState('createdAt')
  const [sortDir, setSortDir] = useState('desc')

  const [viewingUser, setViewingUser] = useState(null)
  const [confirmState, setConfirmState] = useState(null)
  const [busy, setBusy] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const searchTimerRef = useRef(null)

  const currentUserId = currentUser?.id

  useEffect(() => {
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current)
    searchTimerRef.current = setTimeout(() => {
      setSearch(searchInput.trim())
      setPage(0)
    }, 400)
    return () => clearTimeout(searchTimerRef.current)
  }, [searchInput])

  const load = useCallback(async (showSpinner = true) => {
    if (showSpinner) setLoading(true)
    else setRefreshing(true)
    setError(null)
    try {
      const params = { page, size, sortBy, sortDir }
      if (search) params.search = search
      if (roleFilter) params.role = roleFilter
      if (statusFilter) params.blocked = statusFilter
      const result = await adminService.getUsers(params)
      setData(result)
    } catch (err) {
      setError(err?.message || 'Failed to load users')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [page, size, search, roleFilter, statusFilter, sortBy, sortDir])

  useEffect(() => {
    load()
  }, [load])

  const handleSort = (key) => {
    if (sortBy === key) {
      setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortBy(key)
      setSortDir('asc')
    }
    setPage(0)
  }

  const handleFilterChange = (setter, value) => {
    setter(value)
    setPage(0)
  }

  const refreshCurrentUser = async (id) => {
    if (viewingUser && Number(viewingUser.id) === Number(id)) {
      try {
        const updated = await adminService.getUser(id)
        setViewingUser(updated)
      } catch {
        setViewingUser(null)
      }
    }
  }

  const handleToggleBlock = async () => {
    const target = confirmState?.user
    if (!target) return
    const nextBlocked = !target.blocked
    setBusy(true)
    try {
      const updated = await adminService.updateUserStatus(target.id, nextBlocked)
      showToast(`${target.name} ${nextBlocked ? 'blocked' : 'unblocked'}`, 'success')
      setConfirmState(null)
      setData((prev) => prev ? { ...prev, content: prev.content.map((u) => (u.id === updated.id ? updated : u)) } : prev)
      await refreshCurrentUser(updated.id)
    } catch (err) {
      showToast(err?.message || `Failed to ${nextBlocked ? 'block' : 'unblock'} user`, 'error')
    } finally {
      setBusy(false)
    }
  }

  const handleUpdateRole = async (role) => {
    if (!viewingUser) return
    setBusy(true)
    try {
      const updated = await adminService.updateUserRole(viewingUser.id, role)
      showToast(`${updated.name}'s role changed to ${ROLE_LABELS[updated.role] || updated.role}`, 'success')
      setViewingUser(updated)
      setData((prev) => prev ? { ...prev, content: prev.content.map((u) => (u.id === updated.id ? updated : u)) } : prev)
    } catch (err) {
      showToast(err?.message || 'Failed to update role', 'error')
    } finally {
      setBusy(false)
    }
  }

  const handleDelete = async () => {
    const target = confirmState?.user
    if (!target) return
    setBusy(true)
    try {
      await adminService.deleteUser(target.id)
      showToast(`${target.name} deleted`, 'success')
      setConfirmState(null)
      setViewingUser((prev) => (prev && Number(prev.id) === Number(target.id) ? null : prev))
      setData((prev) =>
        prev ? { ...prev, content: prev.content.filter((u) => u.id !== target.id), totalElements: Math.max(prev.totalElements - 1, 0) } : prev
      )
      if (data && data.content.length === 1 && page > 0) {
        setPage((p) => p - 1)
      } else {
        load(false)
      }
    } catch (err) {
      showToast(err?.message || 'Failed to delete user', 'error')
    } finally {
      setBusy(false)
    }
  }

  const users = data?.content || []
  const totalElements = data?.totalElements ?? 0
  const totalPages = data?.totalPages ?? 0
  const from = totalElements === 0 ? 0 : page * size + 1
  const to = Math.min((page + 1) * size, totalElements)
  const hasFilters = Boolean(search || roleFilter || statusFilter)
  const pageRange = size > 0 && totalPages > 0 ? Math.max(0, Math.min(page, totalPages - 1)) : 0

  const clearFilters = () => {
    setSearchInput('')
    setSearch('')
    setRoleFilter('')
    setStatusFilter('')
    setPage(0)
  }

  return (
    <div className="flex h-full flex-col gap-3 py-4">
      <div className="flex flex-shrink-0 flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <BackButton />
          <h1 className="text-lg font-bold text-[var(--text-primary)] font-['Playfair_Display']">Users</h1>
          {refreshing && <span className="text-[11px] text-[var(--text-secondary)]">Refreshing...</span>}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-48 rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] px-3 py-1.5 pr-8 text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:border-[#C6A972] focus:outline-none"
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => setSearchInput('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                aria-label="Clear search"
              >
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            )}
          </div>
          <select
            value={roleFilter}
            onChange={(e) => handleFilterChange(setRoleFilter, e.target.value)}
            className="rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] px-3 py-1.5 text-xs text-[var(--text-secondary)] focus:border-[#C6A972] focus:outline-none"
            aria-label="Filter by role"
          >
            <option value="">All roles</option>
            <option value="ADMIN">Admins</option>
            <option value="CUSTOMER">Customers</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => handleFilterChange(setStatusFilter, e.target.value)}
            className="rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] px-3 py-1.5 text-xs text-[var(--text-secondary)] focus:border-[#C6A972] focus:outline-none"
            aria-label="Filter by status"
          >
            <option value="">All statuses</option>
            <option value="false">Active</option>
            <option value="true">Blocked</option>
          </select>
          <button
            type="button"
            onClick={() => load(false)}
            disabled={refreshing}
            className="rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] p-2 text-[var(--text-secondary)] transition-colors hover:border-[#C6A972]/50 hover:text-[var(--text-primary)] disabled:opacity-50"
            aria-label="Refresh users"
            title="Refresh users"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M23 4v6h-6" />
              <path d="M1 20v-6h6" />
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
            </svg>
          </button>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border border-[var(--border-color)]/50 bg-[var(--bg-card)]">
        {error && <ErrorState message={error} onRetry={() => load()} />}

        {!error && loading && (
          <div className="space-y-2 p-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex animate-pulse items-center gap-3 rounded-lg bg-[var(--bg-hover)] p-3">
                <div className="h-7 w-7 rounded-full bg-[var(--border-color)]" />
                <div className="flex-1 space-y-1">
                  <div className="h-3 w-1/3 rounded bg-[var(--border-color)]" />
                  <div className="h-2.5 w-1/2 rounded bg-[var(--border-color)]" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!error && !loading && (
          <div className="flex min-h-0 flex-1 flex-col">
            <div className="min-h-0 flex-1 overflow-auto">
              {users.length === 0 ? (
                <EmptyState hasFilters={hasFilters} onClear={clearFilters} />
              ) : (
                <table className="w-full text-xs">
                  <thead>
                    <tr className="sticky top-0 z-10 border-b border-[var(--border-color)] bg-[var(--bg-card)]">
                      <SortableTh label="User" sortKey="name" sortBy={sortBy} sortDir={sortDir} onSort={handleSort} />
                      <SortableTh label="Email" sortKey="email" sortBy={sortBy} sortDir={sortDir} onSort={handleSort} />
                      <th scope="col" className="hidden py-2 px-2 text-left font-medium text-[var(--text-secondary)] sm:table-cell">
                        Phone
                      </th>
                      <SortableTh label="Role" sortKey="role" sortBy={sortBy} sortDir={sortDir} onSort={handleSort} />
                      <SortableTh label="Status" sortKey="blocked" sortBy={sortBy} sortDir={sortDir} onSort={handleSort} />
                      <SortableTh label="Joined" sortKey="createdAt" sortBy={sortBy} sortDir={sortDir} onSort={handleSort} />
                      <th scope="col" className="w-28 py-2 px-2 text-right font-medium text-[var(--text-secondary)]">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => {
                      const isSelf = Number(user.id) === Number(currentUserId)
                      return (
                        <tr
                          key={user.id}
                          className="border-b border-[var(--border-color)]/30 transition-colors last:border-0 hover:bg-[var(--bg-hover)]"
                        >
                          <td className="py-2 px-2">
                            <div className="flex items-center gap-2">
                              {user.avatar ? (
                                <img src={user.avatar} alt={user.name} className="h-7 w-7 rounded-full bg-[var(--bg-card)]" />
                              ) : (
                                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--bg-hover)] text-xs font-semibold text-[var(--text-secondary)]">
                                  {user.name?.charAt(0)?.toUpperCase() || '?'}
                                </div>
                              )}
                              <div className="min-w-0">
                                <p className="truncate font-medium text-[var(--text-primary)]">
                                  {user.name}
                                  {isSelf && <span className="ml-1.5 text-[10px] font-normal text-[#C6A972]">(you)</span>}
                                </p>
                                <p className="truncate font-mono text-[10px] text-[var(--text-secondary)]">#{user.id}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-2 px-2 text-[var(--text-secondary)]">{user.email}</td>
                          <td className="hidden py-2 px-2 text-[var(--text-secondary)] sm:table-cell">{user.phone || '-'}</td>
                          <td className="py-2 px-2">
                            <span className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${ROLE_BADGE_STYLES[user.role] || 'bg-gray-500/20 text-gray-500'}`}>
                              {ROLE_LABELS[user.role] || user.role}
                            </span>
                          </td>
                          <td className="py-2 px-2">
                            <span className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${user.blocked ? 'bg-red-500/20 text-red-600' : 'bg-green-500/20 text-green-600'}`}>
                              {user.blocked ? 'Blocked' : 'Active'}
                            </span>
                          </td>
                          <td className="py-2 px-2 text-[var(--text-secondary)]">{formatDate(user.createdAt)}</td>
                          <td className="py-2 px-2">
                            <div className="flex items-center justify-end gap-0.5">
                              <button
                                type="button"
                                onClick={() => setViewingUser(user)}
                                className="rounded p-1 text-[var(--text-secondary)] transition-colors hover:bg-[#C6A972]/10 hover:text-[#C6A972]"
                                title="Details"
                                aria-label={`View ${user.name} details`}
                              >
                                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                  <circle cx="12" cy="12" r="3" />
                                </svg>
                              </button>
                              <button
                                type="button"
                                onClick={() => setConfirmState({ type: user.blocked ? 'unblock' : 'block', user })}
                                disabled={isSelf}
                                className={`rounded p-1 transition-colors disabled:opacity-30 ${
                                  user.blocked
                                    ? 'text-green-600 hover:bg-green-500/10'
                                    : 'text-[var(--text-secondary)] hover:bg-red-500/10 hover:text-red-600'
                                }`}
                                title={isSelf ? 'You cannot modify your own account' : user.blocked ? 'Unblock' : 'Block'}
                                aria-label={user.blocked ? `Unblock ${user.name}` : `Block ${user.name}`}
                              >
                                {user.blocked ? (
                                  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                                    <polyline points="9 12 11 14 15 10" />
                                  </svg>
                                ) : (
                                  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                  </svg>
                                )}
                              </button>
                              <button
                                type="button"
                                onClick={() => setConfirmState({ type: 'delete', user })}
                                disabled={isSelf}
                                className="rounded p-1 text-[var(--text-secondary)] transition-colors hover:bg-red-500/10 hover:text-red-600 disabled:opacity-30"
                                title={isSelf ? 'You cannot delete your own account' : 'Delete'}
                                aria-label={`Delete ${user.name}`}
                              >
                                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <polyline points="3 6 5 6 21 6" />
                                  <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                                  <path d="M10 11v6M14 11v6" />
                                </svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              )}
            </div>

            {users.length > 0 && (
              <div className="flex flex-shrink-0 flex-wrap items-center justify-between gap-2 border-t border-[var(--border-color)] px-3 py-2">
                <div className="flex items-center gap-2 text-[11px] text-[var(--text-secondary)]">
                  <select
                    value={size}
                    onChange={(e) => {
                      setSize(Number(e.target.value))
                      setPage(0)
                    }}
                    className="rounded border border-[var(--border-color)] bg-[var(--bg-card)] px-1.5 py-1 text-[11px] text-[var(--text-primary)] focus:border-[#C6A972] focus:outline-none"
                    aria-label="Rows per page"
                  >
                    {[10, 25, 50].map((n) => (
                      <option key={n} value={n}>
                        {n} / page
                      </option>
                    ))}
                  </select>
                  <span>
                    Showing {from}-{to} of {totalElements}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.max(p - 1, 0))}
                    disabled={page <= 0}
                    className="rounded-lg border border-[var(--border-color)] px-2.5 py-1 text-[11px] font-medium text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)] disabled:opacity-40"
                  >
                    Prev
                  </button>
                  <span className="px-2 text-[11px] text-[var(--text-secondary)]">
                    Page {pageRange + 1} of {Math.max(totalPages, 1)}
                  </span>
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.min(p + 1, totalPages - 1))}
                    disabled={page >= totalPages - 1}
                    className="rounded-lg border border-[var(--border-color)] px-2.5 py-1 text-[11px] font-medium text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)] disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {viewingUser && (
        <UserDetailModal
          user={viewingUser}
          currentUserId={currentUserId}
          busy={busy}
          onUpdateRole={handleUpdateRole}
          onToggleBlock={() => setConfirmState({ type: viewingUser.blocked ? 'unblock' : 'block', user: viewingUser })}
          onClose={() => setViewingUser(null)}
        />
      )}

      {confirmState && (
        <ConfirmDialog
          title={
            confirmState.type === 'delete'
              ? 'Delete user'
              : confirmState.type === 'block'
                ? 'Block user'
                : 'Unblock user'
          }
          description={
            confirmState.type === 'delete'
              ? `This will permanently delete ${confirmState.user.name} and all their data. This action cannot be undone.`
              : confirmState.type === 'block'
                ? `${confirmState.user.name} will lose access to their account and all active sessions will be terminated.`
                : `${confirmState.user.name} will regain access to their account.`
          }
          confirmLabel={
            confirmState.type === 'delete'
              ? 'Delete'
              : confirmState.type === 'block'
                ? 'Block'
                : 'Unblock'
          }
          busy={busy}
          onConfirm={confirmState.type === 'delete' ? handleDelete : handleToggleBlock}
          onClose={() => setConfirmState(null)}
        />
      )}
    </div>
  )
}
