import { useEffect, useState } from 'react'
import { NavLink, Link, useLocation, useNavigate } from 'react-router-dom'
import { Menu, X, User, LogOut, Shield } from 'lucide-react'
import { supabase } from '../lib/supabase.js'

const links = [
  { to: '/', label: 'Home' },
  { to: '/projects', label: 'service' },
  { to: '/contact', label: 'Contact Us' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const [user, setUser] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    const onScroll = () => {
      if (window.innerWidth >= 768) {
        setScrolled(window.scrollY > 24)
      }
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setOpen(false)
  }, [location.pathname])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
  }, [open])

  // Auth State Listener
  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()
        setIsAdmin(profile?.role === 'admin')
      } else {
        setIsAdmin(false)
      }
    }

    checkUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      const currentUser = session?.user ?? null
      setUser(currentUser)
      if (currentUser) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', currentUser.id)
          .single()
        setIsAdmin(profile?.role === 'admin')
      } else {
        setIsAdmin(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setIsAdmin(false)
    navigate('/')
  }

  return (
    <header className={`navbar ${scrolled ? 'is-scrolled' : ''}`}>
      <div className="container navbar-inner">
        <Link to="/" className="navbar-logo" draggable="false" aria-label="Easy Group — home">
          <span className="navbar-logo-mark" aria-hidden="true">
            <span className="reg-mark" />
          </span>
          <span className="navbar-logo-text">
            <div className="flex items-center gap-2.5 font-display font-extrabold text-lg">
              <img src="/images/WhatsApp.png" draggable="false" alt="Easy Group" className="h-[40px] brightness-0 invert" />
            </div>
          </span>
        </Link>

        <nav className="navbar-links" aria-label="Primary">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === '/'}
              draggable="false"
              className={({ isActive }) => `navbar-link ${isActive ? 'is-active' : ''}`}
            >
              {l.label}
            </NavLink>
          ))}
          {isAdmin && (
            <NavLink
              to="/admin"
              draggable="false"
              className={({ isActive }) => `navbar-link text-red-500 font-semibold ${isActive ? 'is-active' : ''}`}
            >
              Admin Dashboard
            </NavLink>
          )}
        </nav>

        {/* AUTH BUTTONS / PROFILE */}
        <div className="navbar-cta flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              <div
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-sm font-medium text-white/90"
                title={user.email}
              >
                <User size={15} className="text-red-500" />
                <span className="max-w-[130px] truncate">{user.email?.split('@')[0] || 'Profile'}</span>
              </div>

              <button
                onClick={handleLogout}
                className="btn btn-ghost btn-sm text-xs text-white/60 hover:text-red-400"
                title="Sign Out"
              >
                <LogOut size={15} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login" className="btn btn-outline btn-sm">
                Login
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Register
              </Link>
            </div>
          )}
        </div>

        <button
          className="navbar-toggle"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* MOBILE MENU */}
      <div className={`navbar-mobile ${open ? 'is-open' : ''}`}>
        <nav className="navbar-mobile-links" aria-label="Mobile">
          {links.map((l, i) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === '/'}
              className={({ isActive }) => `navbar-mobile-link ${isActive ? 'is-active' : ''}`}
              style={{ transitionDelay: `${i * 0.05}s` }}
            >
              {l.label}
            </NavLink>
          ))}
          {isAdmin && (
            <NavLink
              to="/admin"
              className={({ isActive }) => `navbar-mobile-link text-red-400 ${isActive ? 'is-active' : ''}`}
            >
              Admin Dashboard
            </NavLink>
          )}
        </nav>

        <div className="flex flex-col gap-3 mt-6">
          {user ? (
            <div className="flex flex-col gap-3">
              <div className="text-sm font-mono text-white/80 px-1 flex items-center gap-2">
                <User size={16} className="text-red-400" />
                <span>{user.email}</span>
              </div>
              <button
                onClick={handleLogout}
                className="btn btn-outline flex items-center justify-center gap-2"
              >
                <LogOut size={16} />
                Sign Out
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <Link to="/login" className="btn btn-outline w-full text-center">
                Login
              </Link>
              <Link to="/register" className="btn btn-primary w-full text-center">
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}