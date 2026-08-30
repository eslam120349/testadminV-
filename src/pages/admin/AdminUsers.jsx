import { useState, useEffect } from 'react'
import { Search, Trash2, ShieldBan, ShieldCheck, Users } from 'lucide-react'
import { supabase } from '../../lib/supabase.js'

export default function AdminUsers({ onToast }) {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [confirm, setConfirm] = useState(null) // { type, user }

  const fetchUsers = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching users:', error)
      onToast?.('Failed to load users', 'error')
    } else {
      setUsers(data || [])
    }
    setLoading(false)
  }

  useEffect(() => { fetchUsers() }, [])

  const filtered = users.filter(u =>
    u.email?.toLowerCase().includes(search.toLowerCase())
  )

  const handleBanToggle = async (user) => {
    const newBanned = !user.is_banned
    const { error } = await supabase
      .from('profiles')
      .update({ is_banned: newBanned })
      .eq('id', user.id)

    if (error) {
      onToast?.('Failed to update user', 'error')
    } else {
      onToast?.(newBanned ? 'User banned' : 'User unbanned', 'success')
      fetchUsers()
    }
    setConfirm(null)
  }

  const handleDelete = async (user) => {
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', user.id)

    if (error) {
      onToast?.('Failed to delete user', 'error')
    } else {
      onToast?.('User deleted', 'success')
      fetchUsers()
    }
    setConfirm(null)
  }

  const handleRoleChange = async (user, newRole) => {
    const { error } = await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', user.id)

    if (error) {
      onToast?.('Failed to update user role', 'error')
    } else {
      onToast?.(`Role updated to ${newRole}`, 'success')
      fetchUsers()
    }
  }

  return (
    <>
      <div className="admin-topbar">
        <div>
          <h2 className="admin-page-title">Users</h2>
          <p className="admin-page-desc">Manage registered users, roles and access permissions</p>
        </div>
      </div>

      <div className="admin-table-wrap">
        <div className="admin-table-header">
          <span className="admin-table-title">
            All Users ({filtered.length})
          </span>

          <div className="admin-search">
            <Search size={16} />
            <input
              type="text"
              placeholder="Search by email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="admin-loading">
            <span className="admin-spinner" />
            Loading users...
          </div>
        ) : filtered.length === 0 ? (
          <div className="admin-empty">
            <Users size={40} />
            <p>No users found</p>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((user) => (
                <tr key={user.id}>
                  <td className="email-cell">{user.email || 'No Email'}</td>
                  <td>
                    <select
                      className="admin-status-select"
                      value={user.role || 'user'}
                      onChange={(e) => handleRoleChange(user, e.target.value)}
                    >
                      <option value="user">user</option>
                      <option value="admin">admin</option>
                    </select>
                  </td>
                  <td>
                    <span className={`admin-badge ${user.is_banned ? 'banned' : 'active'}`}>
                      {user.is_banned ? 'Banned' : 'Active'}
                    </span>
                  </td>
                  <td>
                    {user.created_at
                      ? new Date(user.created_at).toLocaleDateString('en-US', {
                          month: 'short', day: 'numeric', year: 'numeric'
                        })
                      : '—'}
                  </td>
                  <td>
                    <div className="admin-actions">
                      <button
                        className="admin-action-btn warning"
                        title={user.is_banned ? 'Unban user' : 'Ban user'}
                        onClick={() => setConfirm({ type: 'ban', user })}
                      >
                        {user.is_banned ? <ShieldCheck size={15} /> : <ShieldBan size={15} />}
                      </button>

                      <button
                        className="admin-action-btn danger"
                        title="Delete user"
                        onClick={() => setConfirm({ type: 'delete', user })}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Confirm Dialog */}
      {confirm && (
        <div className="admin-modal-backdrop" onClick={() => setConfirm(null)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 420 }}>
            <button className="admin-modal-close" onClick={() => setConfirm(null)}>✕</button>

            <h3 className="admin-modal-title">
              {confirm.type === 'ban'
                ? (confirm.user.is_banned ? 'Unban User' : 'Ban User')
                : 'Delete User'}
            </h3>

            <p className="admin-confirm-text">
              {confirm.type === 'ban' ? (
                <>
                  Are you sure you want to{' '}
                  <span className="admin-confirm-highlight">
                    {confirm.user.is_banned ? 'unban' : 'ban'}
                  </span>{' '}
                  <span className="admin-confirm-highlight">{confirm.user.email}</span>?
                </>
              ) : (
                <>
                  Are you sure you want to permanently delete{' '}
                  <span className="admin-confirm-highlight">{confirm.user.email}</span>?
                  This action cannot be undone.
                </>
              )}
            </p>

            <div className="admin-form-actions">
              <button className="admin-btn admin-btn-ghost" onClick={() => setConfirm(null)}>
                Cancel
              </button>
              <button
                className="admin-btn admin-btn-primary"
                onClick={() => {
                  if (confirm.type === 'ban') handleBanToggle(confirm.user)
                  else handleDelete(confirm.user)
                }}
              >
                {confirm.type === 'ban'
                  ? (confirm.user.is_banned ? 'Unban' : 'Ban')
                  : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
