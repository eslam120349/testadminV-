import { useState, useEffect } from 'react'
import { Search, ChevronDown, ChevronUp, Package, Phone, Mail, Building2, FileText } from 'lucide-react'
import { supabase } from '../../lib/supabase.js'

export default function AdminOrders({ onToast }) {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [expanded, setExpanded] = useState(null) // order id

  const fetchOrders = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching orders:', error)
      onToast?.('Failed to load orders', 'error')
    } else {
      setOrders(data || [])
    }
    setLoading(false)
  }

  useEffect(() => { fetchOrders() }, [])

  const filtered = orders.filter(o =>
    o.name?.toLowerCase().includes(search.toLowerCase()) ||
    o.email?.toLowerCase().includes(search.toLowerCase()) ||
    o.service?.toLowerCase().includes(search.toLowerCase())
  )

  const handleStatusChange = async (orderId, newStatus) => {
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId)

    if (error) {
      onToast?.('Failed to update status', 'error')
    } else {
      onToast?.('Status updated', 'success')
      fetchOrders()
    }
  }

  const statusCounts = {
    pending: orders.filter(o => o.status === 'pending').length,
    'in-progress': orders.filter(o => o.status === 'in-progress').length,
    completed: orders.filter(o => o.status === 'completed').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length,
  }

  return (
    <>
      <div className="admin-topbar">
        <div>
          <h2 className="admin-page-title">Orders</h2>
          <p className="admin-page-desc">Track and manage all contact form submissions</p>
        </div>
      </div>

      {/* Status Counters */}
      <div className="admin-stats">
        <div className="admin-stat-card">
          <div className="admin-stat-icon amber">
            <Package size={20} />
          </div>
          <div className="admin-stat-value">{statusCounts.pending}</div>
          <div className="admin-stat-label">Pending</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-icon blue">
            <Package size={20} />
          </div>
          <div className="admin-stat-value">{statusCounts['in-progress']}</div>
          <div className="admin-stat-label">In Progress</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-icon green">
            <Package size={20} />
          </div>
          <div className="admin-stat-value">{statusCounts.completed}</div>
          <div className="admin-stat-label">Completed</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-icon red">
            <Package size={20} />
          </div>
          <div className="admin-stat-value">{statusCounts.cancelled}</div>
          <div className="admin-stat-label">Cancelled</div>
        </div>
      </div>

      <div className="admin-table-wrap">
        <div className="admin-table-header">
          <span className="admin-table-title">
            All Orders ({filtered.length})
          </span>

          <div className="admin-search">
            <Search size={16} />
            <input
              type="text"
              placeholder="Search orders..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="admin-loading">
            <span className="admin-spinner" />
            Loading orders...
          </div>
        ) : filtered.length === 0 ? (
          <div className="admin-empty">
            <Package size={40} />
            <p>No orders found</p>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th></th>
                <th>Name</th>
                <th>Email</th>
                <th>Service</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((order) => (
                <>
                  <tr
                    key={order.id}
                    style={{ cursor: 'pointer' }}
                    onClick={() => setExpanded(expanded === order.id ? null : order.id)}
                  >
                    <td style={{ width: 40, padding: '16px 12px 16px 24px' }}>
                      {expanded === order.id
                        ? <ChevronUp size={16} color="var(--mist)" />
                        : <ChevronDown size={16} color="var(--mist)" />
                      }
                    </td>
                    <td className="email-cell">{order.name}</td>
                    <td>{order.email}</td>
                    <td>{order.service || '—'}</td>
                    <td>
                      <select
                        className="admin-status-select"
                        value={order.status}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      >
                        <option value="pending">Pending</option>
                        <option value="in-progress">In Progress</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td>
                      {new Date(order.created_at).toLocaleDateString('en-US', {
                        month: 'short', day: 'numeric', year: 'numeric'
                      })}
                    </td>
                  </tr>

                  {/* Expanded Detail */}
                  {expanded === order.id && (
                    <tr key={`${order.id}-detail`}>
                      <td colSpan={6} style={{ padding: 0 }}>
                        <div className="admin-order-detail">
                          <div className="admin-order-detail-grid">
                            <div className="admin-order-detail-item">
                              <span className="admin-order-detail-label">
                                <Phone size={12} style={{ display: 'inline', marginRight: 4 }} />
                                Phone
                              </span>
                              <span className="admin-order-detail-value">
                                {order.phone || 'Not provided'}
                              </span>
                            </div>

                            <div className="admin-order-detail-item">
                              <span className="admin-order-detail-label">
                                <Mail size={12} style={{ display: 'inline', marginRight: 4 }} />
                                Email
                              </span>
                              <span className="admin-order-detail-value">
                                <a href={`mailto:${order.email}`} style={{ color: 'var(--red-bright)' }}>
                                  {order.email}
                                </a>
                              </span>
                            </div>

                            <div className="admin-order-detail-item">
                              <span className="admin-order-detail-label">
                                <Building2 size={12} style={{ display: 'inline', marginRight: 4 }} />
                                Company
                              </span>
                              <span className="admin-order-detail-value">
                                {order.company || 'Not provided'}
                              </span>
                            </div>

                            <div className="admin-order-detail-item">
                              <span className="admin-order-detail-label">
                                <FileText size={12} style={{ display: 'inline', marginRight: 4 }} />
                                Project Details
                              </span>
                              <span className="admin-order-detail-value">
                                {order.details || 'No details provided'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  )
}
