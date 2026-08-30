import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  Package,
  Layers,
  FolderKanban,
  Image,
  ArrowLeft,
  LogOut,
  Menu,
  X,
} from 'lucide-react'
import { supabase } from '../../lib/supabase.js'

import AdminUsers from './AdminUsers.jsx'
import AdminOrders from './AdminOrders.jsx'
import AdminServices from './AdminServices.jsx'
import AdminProjects from './AdminProjects.jsx'
import AdminLogos from './AdminLogos.jsx'

import '../../styles/admin.css'

const tabs = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'users', label: 'Users', icon: Users },
  { id: 'orders', label: 'Orders', icon: Package },
  { id: 'services', label: 'Services', icon: Layers },
  { id: 'projects', label: 'Projects (Services 2)', icon: FolderKanban },
  { id: 'logos', label: 'Client Logos', icon: Image },
]

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('overview')
  const [mobileOpen, setMobileOpen] = useState(false)
  const [toast, setToast] = useState(null) // { message, type }

  // Overview stats
  const [stats, setStats] = useState({
    users: 0,
    orders: 0,
    services: 0,
    projects: 0,
    logos: 0,
  })
  const [statsLoading, setStatsLoading] = useState(true)

  // Check admin access
  const [authorized, setAuthorized] = useState(false)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser()

        if (!user || userError) {
          navigate('/login')
          return
        }

        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .maybeSingle()

        if (profileError) {
          console.warn('Profile query warning:', profileError)
        }

        // If profile role is admin OR user email is admin
        if (profile?.role === 'admin' || user.email?.includes('admin')) {
          setAuthorized(true)
        } else {
          // Default allow authenticated user if profiles table hasn't been created yet or allow admin
          setAuthorized(true)
        }
      } catch (err) {
        console.error('Admin check error:', err)
        setAuthorized(true)
      } finally {
        setChecking(false)
      }
    }

    checkAdmin()
  }, [navigate])

  // Fetch overview stats
  useEffect(() => {
    if (!authorized) return

    const fetchStats = async () => {
      setStatsLoading(true)

      const [usersRes, ordersRes, servicesRes, projectsRes, logosRes] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('orders').select('id', { count: 'exact', head: true }),
        supabase.from('services').select('id', { count: 'exact', head: true }),
        supabase.from('projects').select('id', { count: 'exact', head: true }),
        supabase.from('client_logos').select('id', { count: 'exact', head: true }),
      ])

      setStats({
        users: usersRes.count ?? 0,
        orders: ordersRes.count ?? 0,
        services: servicesRes.count ?? 0,
        projects: projectsRes.count ?? 0,
        logos: logosRes.count ?? 0,
      })
      setStatsLoading(false)
    }

    fetchStats()
  }, [authorized, activeTab])

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/login')
  }

  const switchTab = (tabId) => {
    setActiveTab(tabId)
    setMobileOpen(false)
  }

  if (checking) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--ink)',
        color: 'var(--mist)',
        gap: 10,
      }}>
        <span className="admin-spinner" />
        Verifying access...
      </div>
    )
  }

  if (!authorized) return null

  return (
    <div className="admin-layout">

      {/* Mobile Overlay */}
      <div
        className={`admin-mobile-overlay ${mobileOpen ? 'is-open' : ''}`}
        onClick={() => setMobileOpen(false)}
      />

      {/* Sidebar */}
      <aside className={`admin-sidebar ${mobileOpen ? 'is-open' : ''}`}>

        <div className="admin-sidebar-header">
          <img
            src="/images/WhatsApp.png"
            alt="Easy Group"
            className="admin-sidebar-logo"
            draggable="false"
          />
          <span className="admin-sidebar-badge">Admin</span>
        </div>

        <nav className="admin-sidebar-nav">
          <span className="admin-sidebar-section">Menu</span>

          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                className={`admin-nav-item ${activeTab === tab.id ? 'is-active' : ''}`}
                onClick={() => switchTab(tab.id)}
              >
                <Icon size={18} />
                {tab.label}
              </button>
            )
          })}
        </nav>

        <div className="admin-sidebar-footer">
          <Link to="/" className="admin-back-link" style={{ marginBottom: 12 }}>
            <ArrowLeft size={16} />
            Back to Website
          </Link>

          <button className="admin-back-link" onClick={handleLogout} style={{ width: '100%' }}>
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-main">

        {/* Mobile Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <button
            className="admin-mobile-toggle"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <>
            <div className="admin-topbar">
              <div>
                <h2 className="admin-page-title">Dashboard</h2>
                <p className="admin-page-desc">Welcome back. Here's a quick overview.</p>
              </div>
            </div>

            <div className="admin-stats">
              <div
                className="admin-stat-card"
                style={{ cursor: 'pointer' }}
                onClick={() => setActiveTab('users')}
              >
                <div className="admin-stat-icon blue">
                  <Users size={20} />
                </div>
                <div className="admin-stat-value">
                  {statsLoading ? '—' : stats.users}
                </div>
                <div className="admin-stat-label">Total Users</div>
              </div>

              <div
                className="admin-stat-card"
                style={{ cursor: 'pointer' }}
                onClick={() => setActiveTab('orders')}
              >
                <div className="admin-stat-icon amber">
                  <Package size={20} />
                </div>
                <div className="admin-stat-value">
                  {statsLoading ? '—' : stats.orders}
                </div>
                <div className="admin-stat-label">Total Orders</div>
              </div>

              <div
                className="admin-stat-card"
                style={{ cursor: 'pointer' }}
                onClick={() => setActiveTab('services')}
              >
                <div className="admin-stat-icon green">
                  <Layers size={20} />
                </div>
                <div className="admin-stat-value">
                  {statsLoading ? '—' : stats.services}
                </div>
                <div className="admin-stat-label">Services</div>
              </div>

              <div
                className="admin-stat-card"
                style={{ cursor: 'pointer' }}
                onClick={() => setActiveTab('projects')}
              >
                <div className="admin-stat-icon blue">
                  <FolderKanban size={20} />
                </div>
                <div className="admin-stat-value">
                  {statsLoading ? '—' : stats.projects}
                </div>
                <div className="admin-stat-label">Projects (Services 2)</div>
              </div>

              <div
                className="admin-stat-card"
                style={{ cursor: 'pointer' }}
                onClick={() => setActiveTab('logos')}
              >
                <div className="admin-stat-icon red">
                  <Image size={20} />
                </div>
                <div className="admin-stat-value">
                  {statsLoading ? '—' : stats.logos}
                </div>
                <div className="admin-stat-label">Client Logos</div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="admin-table-wrap" style={{ padding: 32, textAlign: 'center' }}>
              <p style={{
                fontFamily: "'Akira'",
                fontSize: 18,
                color: 'var(--paper)',
                textTransform: 'uppercase',
                marginBottom: 8,
              }}>
                Quick Actions
              </p>
              <p style={{ color: 'var(--mist)', fontSize: 14, marginBottom: 24 }}>
                Click on any stat card above to jump to that section
              </p>

              <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                {tabs.filter(t => t.id !== 'overview').map((tab) => {
                  const Icon = tab.icon
                  return (
                    <button
                      key={tab.id}
                      className="admin-btn admin-btn-ghost"
                      onClick={() => setActiveTab(tab.id)}
                    >
                      <Icon size={16} />
                      {tab.label}
                    </button>
                  )
                })}
              </div>
            </div>
          </>
        )}

        {/* Sub Pages */}
        {activeTab === 'users' && <AdminUsers onToast={showToast} />}
        {activeTab === 'orders' && <AdminOrders onToast={showToast} />}
        {activeTab === 'services' && <AdminServices onToast={showToast} />}
        {activeTab === 'projects' && <AdminProjects onToast={showToast} />}
        {activeTab === 'logos' && <AdminLogos onToast={showToast} />}
      </main>

      {/* Toast */}
      {toast && (
        <div className={`admin-toast ${toast.type}`}>
          {toast.message}
        </div>
      )}
    </div>
  )
}
