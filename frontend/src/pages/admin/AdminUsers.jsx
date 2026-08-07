import { useCallback, useEffect, useRef, useState } from 'react'
import { adminService } from '../../services/adminService'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { formatDate } from '../../utils/helpers'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Icon from '../../components/ui/Icon'
import Spinner from '../../components/ui/Spinner'
import EmptyState from '../../components/EmptyState'
import Modal, { ConfirmDialog } from '../../components/ui/Modal'
import PageHeader from '../../components/ui/PageHeader'
import Pagination from '../../components/ui/Pagination'
import { Table, THead, TBody, TR, TH, TD } from '../../components/ui/Table'

const ROLE_LABELS = { ADMIN: 'Admin', CUSTOMER: 'Customer' }
const ROLE_TONES = { ADMIN: 'gold', CUSTOMER: 'info' }

const SORT_FIELDS = {
  name: 'name',
  email: 'email',
  role: 'role',
  createdAt: 'createdAt',
  blocked: 'blocked',
}

function ErrorState({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-4 py-10 text-center">
      <div className="flex items-start gap-3 rounded-card border border-danger/30 bg-danger/8 p-4 text-sm text-danger">
        <Icon name="AlertCircle" size="sm" className="mt-0.5 shrink-0" />
        <div className="text-left">
          <p className="font-medium text-ink">Failed to load users</p>
          <p className="mt-0.5 max-w-md text-xs text-sub">{message}</p>
        </div>
      </div>
      <Button size="sm" icon="RefreshCw" onClick={onRetry}>
        Retry
      </Button>
    </div>
  )
}

function SortableTh({ label, sortKey, sortBy, sortDir, onSort }) {
  const isActive = sortBy === sortKey
  return (
    <TH>
      <button
        type="button"
        onClick={() => onSort(sortKey)}
        className={`inline-flex items-center gap-1 rounded transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-500 ${
          isActive ? 'text-ink' : 'text-sub'
        }`}
      >
        {label}
        <Icon
          name="ArrowUp"
          size={11}
          className={`transition-transform ${isActive && sortDir === 'desc' ? 'rotate-180' : ''} ${isActive ? 'text-gold-600' : 'opacity-40'}`}
        />
      </button>
    </TH>
  )
}

function UserDetailModal({ user, currentUserId, busy, onUpdateRole, onToggleBlock, onClose }) {
  const isSelf = Number(user.id) === Number(currentUserId)

  const detailTiles = [
    { label: 'Role', value: ROLE_LABELS[user.role] || user.role, capitalize: true },
    {
      label: 'Status',
      value: user.blocked ? 'Blocked' : 'Active',
      className: user.blocked ? 'text-danger' : 'text-success',
    },
    { label: 'Phone', value: user.phone || '-' },
    { label: 'Joined', value: formatDate(user.createdAt) },
    { label: 'Last updated', value: formatDate(user.updatedAt) },
    { label: 'User ID', value: `#${user.id}`, mono: true },
  ]

  return (
    <Modal open onClose={onClose} title="" size="lg" hideCloseButton>
      <div className="flex items-center gap-4">
        {user.avatar ? (
          <img src={user.avatar} alt={user.name} className="h-14 w-14 rounded-full bg-surface object-cover" />
        ) : (
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-gold-100 to-gold-200 text-xl font-semibold text-gold-700 dark:from-gold-500/20 dark:to-gold-500/5 dark:text-gold-300">
            {user.name?.charAt(0)?.toUpperCase() || '?'}
          </div>
        )}
        <div className="min-w-0">
          <h2 className="heading-display text-xl text-ink">{user.name}</h2>
          <p className="text-sm text-sub">{user.email}</p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3">
        {detailTiles.map((tile) => (
          <div key={tile.label} className="rounded-card border border-line bg-inset p-3">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-sub">{tile.label}</p>
            <p className={`mt-0.5 text-sm text-ink ${tile.mono ? 'font-mono' : ''} ${tile.capitalize ? 'capitalize' : ''} ${tile.className || ''}`}>
              {tile.value}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-5">
        <label className="flex items-center gap-2 text-sm text-sub">
          Role
          <select
            value={user.role}
            disabled={busy || isSelf}
            onChange={(e) => onUpdateRole(e.target.value)}
            className="h-11 cursor-pointer rounded-field border border-line bg-inset px-3 text-sm text-ink focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-500/25 disabled:opacity-50"
            title={isSelf ? 'You cannot change your own role' : 'Change role'}
          >
            {Object.entries(ROLE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <Button
          variant={user.blocked ? 'success' : 'danger'}
          size="sm"
          icon={user.blocked ? 'UserCheck' : 'Ban'}
          onClick={onToggleBlock}
          disabled={busy || isSelf}
          title={isSelf ? 'You cannot modify your own account' : user.blocked ? 'Unblock user' : 'Block user'}
        >
          {user.blocked ? 'Unblock user' : 'Block user'}
        </Button>
      </div>
    </Modal>
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

  const clearFilters = () => {
    setSearchInput('')
    setSearch('')
    setRoleFilter('')
    setStatusFilter('')
    setPage(0)
  }

  return (
    <div className="flex h-full flex-col gap-4 py-4">
      <PageHeader
        title="Users"
        description="Manage customers and staff, control access, and moderate accounts."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            {refreshing && <span className="text-[11px] text-sub">Refreshing...</span>}
            <div className="relative">
              <Icon name="Search" size="sm" className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-faint" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="h-11 w-56 rounded-field border border-line bg-inset pl-10 pr-9 text-sm text-ink placeholder-faint transition-colors focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-500/25"
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={() => setSearchInput('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-soft p-1 text-sub transition-colors hover:text-ink"
                  aria-label="Clear search"
                >
                  <Icon name="X" size="sm" />
                </button>
              )}
            </div>
            <select
              value={roleFilter}
              onChange={(e) => handleFilterChange(setRoleFilter, e.target.value)}
              className="h-11 cursor-pointer rounded-field border border-line bg-inset px-3 text-sm text-sub focus:border-gold-500 focus:outline-none"
              aria-label="Filter by role"
            >
              <option value="">All roles</option>
              <option value="ADMIN">Admins</option>
              <option value="CUSTOMER">Customers</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => handleFilterChange(setStatusFilter, e.target.value)}
              className="h-11 cursor-pointer rounded-field border border-line bg-inset px-3 text-sm text-sub focus:border-gold-500 focus:outline-none"
              aria-label="Filter by status"
            >
              <option value="">All statuses</option>
              <option value="false">Active</option>
              <option value="true">Blocked</option>
            </select>
            <Button
              variant="ghost"
              size="iconSm"
              icon="RefreshCw"
              onClick={() => load(false)}
              disabled={refreshing}
              aria-label="Refresh users"
              title="Refresh users"
            />
          </div>
        }
      />

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-card border border-line bg-surface shadow-sm">
        {error && <ErrorState message={error} onRetry={() => load()} />}

        {!error && loading && (
          <div className="space-y-2 p-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex animate-pulse items-center gap-3 rounded-card bg-subtle p-3">
                <div className="h-8 w-8 rounded-full bg-line" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 w-1/3 rounded bg-line" />
                  <div className="h-2.5 w-1/2 rounded bg-line" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!error && !loading && (
          <div className="flex min-h-0 flex-1 flex-col">
            <div className="min-h-0 flex-1 overflow-auto">
              {users.length === 0 ? (
                <EmptyState
                  compact
                  icon="Users"
                  title="No users found"
                  message={hasFilters ? 'Try adjusting your search or filters.' : 'Users who register on the store will appear here.'}
                  actionLabel={hasFilters ? 'Clear filters' : undefined}
                  onAction={hasFilters ? clearFilters : undefined}
                />
              ) : (
                <Table>
                  <THead>
                    <TR className="border-0">
                      <SortableTh label="User" sortKey="name" sortBy={sortBy} sortDir={sortDir} onSort={handleSort} />
                      <SortableTh label="Email" sortKey="email" sortBy={sortBy} sortDir={sortDir} onSort={handleSort} />
                      <TH className="hidden sm:table-cell">Phone</TH>
                      <SortableTh label="Role" sortKey="role" sortBy={sortBy} sortDir={sortDir} onSort={handleSort} />
                      <SortableTh label="Status" sortKey="blocked" sortBy={sortBy} sortDir={sortDir} onSort={handleSort} />
                      <SortableTh label="Joined" sortKey="createdAt" sortBy={sortBy} sortDir={sortDir} onSort={handleSort} />
                      <TH className="text-right">Actions</TH>
                    </TR>
                  </THead>
                  <TBody>
                    {users.map((user) => {
                      const isSelf = Number(user.id) === Number(currentUserId)
                      return (
                        <TR key={user.id} className="hover:bg-subtle">
                          <TD>
                            <div className="flex items-center gap-2.5">
                              {user.avatar ? (
                                <img src={user.avatar} alt={user.name} className="h-8 w-8 rounded-full bg-surface object-cover" />
                              ) : (
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gold-100 text-xs font-semibold text-gold-700 dark:bg-gold-500/15 dark:text-gold-300">
                                  {user.name?.charAt(0)?.toUpperCase() || '?'}
                                </div>
                              )}
                              <div className="min-w-0">
                                <p className="truncate font-medium text-ink">
                                  {user.name}
                                  {isSelf && <span className="ml-1.5 text-[10px] font-normal text-gold-600">(you)</span>}
                                </p>
                                <p className="truncate font-mono text-[10px] text-sub">#{user.id}</p>
                              </div>
                            </div>
                          </TD>
                          <TD className="text-sub">{user.email}</TD>
                          <TD className="hidden text-sub sm:table-cell">{user.phone || '-'}</TD>
                          <TD>
                            <Badge tone={ROLE_TONES[user.role] || 'neutral'} size="sm">
                              {ROLE_LABELS[user.role] || user.role}
                            </Badge>
                          </TD>
                          <TD>
                            <Badge tone={user.blocked ? 'danger' : 'success'} size="sm">
                              {user.blocked ? 'Blocked' : 'Active'}
                            </Badge>
                          </TD>
                          <TD className="text-sub">{formatDate(user.createdAt)}</TD>
                          <TD>
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="iconSm"
                                icon="Eye"
                                onClick={() => setViewingUser(user)}
                                title="Details"
                                aria-label={`View ${user.name} details`}
                              />
                              <Button
                                variant="ghost"
                                size="iconSm"
                                icon={user.blocked ? 'UserCheck' : 'Ban'}
                                onClick={() => setConfirmState({ type: user.blocked ? 'unblock' : 'block', user })}
                                disabled={isSelf}
                                className={user.blocked ? '!text-success' : '!text-danger'}
                                title={isSelf ? 'You cannot modify your own account' : user.blocked ? 'Unblock' : 'Block'}
                                aria-label={user.blocked ? `Unblock ${user.name}` : `Block ${user.name}`}
                              />
                              <Button
                                variant="ghost"
                                size="iconSm"
                                icon="Trash2"
                                onClick={() => setConfirmState({ type: 'delete', user })}
                                disabled={isSelf}
                                className="!text-danger"
                                title={isSelf ? 'You cannot delete your own account' : 'Delete'}
                                aria-label={`Delete ${user.name}`}
                              />
                            </div>
                          </TD>
                        </TR>
                      )
                    })}
                  </TBody>
                </Table>
              )}
            </div>

            {users.length > 0 && (
              <div className="flex flex-shrink-0 flex-wrap items-center justify-between gap-3 border-t border-line px-4 py-3">
                <div className="flex items-center gap-3 text-[11px] text-sub">
                  <select
                    value={size}
                    onChange={(e) => {
                      setSize(Number(e.target.value))
                      setPage(0)
                    }}
                    className="cursor-pointer rounded-field border border-line bg-inset px-2.5 py-1.5 text-[11px] text-ink focus:border-gold-500 focus:outline-none"
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
                <Pagination page={page + 1} totalPages={Math.max(1, totalPages)} onPageChange={(p) => setPage(p - 1)} />
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
          open
          danger={confirmState.type === 'delete' || confirmState.type === 'block'}
          title={
            confirmState.type === 'delete'
              ? 'Delete user'
              : confirmState.type === 'block'
                ? 'Block user'
                : 'Unblock user'
          }
          message={
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
          loading={busy}
          onConfirm={confirmState.type === 'delete' ? handleDelete : handleToggleBlock}
          onClose={() => setConfirmState(null)}
        />
      )}
    </div>
  )
}
