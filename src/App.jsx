import { useState } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'

import Intro from './components/Intro.jsx'
import Navbar from './components/Navbar.jsx'
import Footer from './components/Footer.jsx'
import ScrollToTop from './components/ScrollToTop.jsx'
import PageTransition from './components/PageTransition.jsx'

import Home from './pages/Home.jsx'
import Projects from './pages/Projects.jsx'
import Contact from './pages/Contact.jsx'
import Login from './pages/auth/Login.jsx'
import Register from './pages/auth/Register.jsx'
import AdminDashboard from './pages/admin/AdminDashboard.jsx'

const INTRO_KEY = 'eg_intro_seen'

export default function App() {
  const location = useLocation()
  const isAdmin = location.pathname.startsWith('/admin')

  const [showIntro, setShowIntro] = useState(() => {
    if (typeof window === 'undefined') return true

    return !window.sessionStorage.getItem(INTRO_KEY)
  })

  const handleIntroComplete = () => {
    window.sessionStorage.setItem(INTRO_KEY, '1')
    setShowIntro(false)
  }

  return (
    <>
      {!isAdmin && showIntro && (
        <Intro onComplete={handleIntroComplete} />
      )}

      <ScrollToTop />

      {!isAdmin && <Navbar />}

      <main>
        <AnimatePresence mode="wait">

          <Routes
            location={location}
            key={location.pathname}
          >

            {/* =========================
                HOME
            ========================= */}

            <Route
              path="/"
              element={
                <PageTransition>
                  <Home />
                </PageTransition>
              }
            />

            {/* =========================
                PROJECTS
            ========================= */}

            <Route
              path="/projects"
              element={
                <PageTransition>
                  <Projects />
                </PageTransition>
              }
            />

            {/* =========================
                CONTACT
            ========================= */}

            <Route
              path="/contact"
              element={
                <PageTransition>
                  <Contact />
                </PageTransition>
              }
            />

            {/* =========================
                AUTH
            ========================= */}

            <Route
              path="/login"
              element={
                <PageTransition>
                  <Login />
                </PageTransition>
              }
            />

            <Route
              path="/register"
              element={
                <PageTransition>
                  <Register />
                </PageTransition>
              }
            />

            {/* =========================
                ADMIN
            ========================= */}

            <Route
              path="/admin/*"
              element={<AdminDashboard />}
            />

          </Routes>

        </AnimatePresence>
      </main>

      {!isAdmin && <Footer />}
    </>
  )
}
