import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Instagram, Facebook } from 'lucide-react'
import { FaTiktok } from 'react-icons/fa'

export default function Footer() {
  const [years, setYears] = useState(0)
  const [partners, setPartners] = useState(0)
  const [companies, setCompanies] = useState(0)

  const statsRef = useRef(null)

  useEffect(() => {
    let animationFrame = null
    let isAnimating = false

    const startAnimation = () => {
      if (isAnimating) return

      isAnimating = true

      setYears(0)
      setPartners(0)
      setCompanies(0)

      const duration = 800
      const startTime = performance.now()

      const animate = (currentTime) => {
        const progress = Math.min(
          (currentTime - startTime) / duration,
          1
        )

        const easeOut = 1 - Math.pow(1 - progress, 3)

        setYears(Math.floor(23 * easeOut))
        setPartners(Math.floor(600 * easeOut))
        setCompanies(Math.floor(4 * easeOut))

        if (progress < 1) {
          animationFrame = requestAnimationFrame(animate)
        } else {
          setYears(23)
          setPartners(600)
          setCompanies(4)
          isAnimating = false
        }
      }

      animationFrame = requestAnimationFrame(animate)
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          startAnimation()
        }
      },
      {
        threshold: 0.3,
      }
    )

    if (statsRef.current) {
      observer.observe(statsRef.current)
    }

    return () => {
      observer.disconnect()

      if (animationFrame) {
        cancelAnimationFrame(animationFrame)
      }
    }
  }, [])

  return (
    <>
      {/* Statistics Section */}
      <section
        ref={statsRef}
        className="bg-[var(--ink)] py-14"
      >
        <div className="container">
          <div className="grid grid-cols-1 gap-12 border-b border-[var(--line)] pb-12 md:grid-cols-3">

            <div className="grid grid-cols-[auto_1fr] items-end gap-2">
              <span className="text-[clamp(4rem,7vw,7.5rem)] font-black leading-[0.8] tracking-[-0.08em] text-[var(--paper)]">
                {years}
              </span>

              <span className="mb-1 font-mono text-xs italic text-[var(--mist)] md:text-sm">
                YEARS
              </span>
            </div>

            <div className="grid grid-cols-[auto_1fr] items-end gap-2">
              <span className="text-[clamp(4rem,7vw,7.5rem)] font-black leading-[0.8] tracking-[-0.08em] text-[var(--paper)]">
                {partners}+
              </span>

              <span className="mb-1 font-mono text-xs italic text-[var(--mist)] md:text-sm">
                PARTNERS
              </span>
            </div>

            <div className="grid grid-cols-[auto_1fr] items-end gap-2">
              <span className="text-[clamp(4rem,7vw,7.5rem)] font-black leading-[0.8] tracking-[-0.08em] text-[var(--paper)]">
                {companies}
              </span>

              <span className="mb-1 font-mono text-xs italic text-[var(--mist)] md:text-sm">
                COMPANIES
              </span>
            </div>

          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="container footer-top">

          <div className="footer-brand">
            <Link to="/" draggable="false" className="navbar-logo">
              <img
                src="/images/WhatsApp.png"
                draggable="false"
                alt="Easy Group"
                className="h-[40px] brightness-0 invert"
              />
            </Link>

            <p className="text-mist footer-desc">
              A full-service creative production house — printing, branding,
              advertising and exhibition solutions that turn ideas into visual
              experiences.
            </p>

            <div className="footer-social">
              <a
                href="https://www.instagram.com/easygroupads/"
                aria-label="Instagram"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Instagram size={18} />
              </a>

              <a
                href="https://www.tiktok.com/@easy.group4"
                aria-label="TikTok"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FaTiktok size={18} />
              </a>

              <a
                href="https://www.facebook.com/easygroupads/"
                aria-label="Facebook"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Facebook size={18} />
              </a>
            </div>
          </div>

          <div className="footer-col">
            <span className="footer-col-title">Navigate</span>

            <Link to="/">Home</Link>
            <Link to="/projects">Projects</Link>
            <Link to="/contact">Contact Us</Link>
          </div>

          <div className="footer-col">
            <span className="footer-col-title">Services</span>

            <span>Design</span>
            <span>Print</span>
            <span>Advertise</span>
          </div>

          <div className="footer-col">
            <span className="footer-col-title">Contact</span>

            <a href="tel:+201013287002">
              +201013287002
            </a>

            <a href="tel:+201090311995">
              +201090311995
            </a>

            <a href="mailto:easygroupads@gmail.com">
              easygroupads@gmail.com
            </a>

            <span>
              7964, street 9 beside Ezz El Din Pharmacy,
              El Mokattam, Cairo, Egypt
            </span>
          </div>

        </div>

        <div className="container footer-bottom">
          <span>© 2026 Easy Group. All Rights Reserved.</span>

          <span className="footer-spec">
            we design . we print . we grow
          </span>
        </div>
      </footer>
    </>
  )
}