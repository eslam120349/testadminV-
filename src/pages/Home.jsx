import { Link } from 'react-router-dom'
import { Sparkles, Award, Layers, Boxes } from 'lucide-react'
import { useRef, useCallback, useEffect, useState } from 'react'
import useReveal from '../hooks/useReveal.js'
import CropMarks from '../components/CropMarks.jsx'
import Button from '../components/Button.jsx'
import ServiceCard from '../components/ServiceCard.jsx'
import ProjectCard from '../components/ProjectCard.jsx'
import { supabase } from '../lib/supabase.js'

const whyItems = [
  {
    icon: Sparkles,
    title: 'Creative Solutions',
    desc: 'Concepts developed from strategy first — never a template stretched to fit.',
  },
  {
    icon: Award,
    title: 'High Quality Production',
    desc: 'Color-accurate presses, premium substrates and finishing done in-house.',
  },
  {
    icon: Layers,
    title: 'Professional Execution',
    desc: 'On-time delivery from first proof to final install, every time.',
  },
  {
    icon: Boxes,
    title: 'Complete Visual Experience',
    desc: 'Print, brand, advertise and exhibit — one team across every touchpoint.',
  },
]

// ==========================================
// FALLBACK DATA
// كل الأقسام اللي بتاخد من الداتابيز (Services،
// Client Logos، Selected Projects) بتبدأ بالداتا
// دي فورًا، وبتتستبدل بس لو Supabase رجّع نتيجة
// فعلية. لو حصل error أو تأخير أو النت بطيء، الداتا
// دي بتفضل ظاهرة زي ما هي من غير أي فراغ.
// ==========================================

const FALLBACK_SERVICES = [
  {
    number: '01',
    title: 'printing and design solutions',
    description:
      'Large-format, offset and digital printing engineered for color accuracy and finish — from press check to final delivery.',
    image:
      'https://images.unsplash.com/photo-1626785774573-4b799315345d?q=80&w=1400&auto=format&fit=crop',
  },
  {
    number: '02',
    title: 'Branding & Identity',
    description:
      'Logo systems, guidelines and visual identities built to hold up across every surface a brand touches.',
    image:
      'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?q=80&w=1400&auto=format&fit=crop',
  },
  {
    number: '03',
    title: 'Exhibition & Events',
    description:
      'Custom stands, booths and event environments that turn a floor plan into a full brand experience.',
    image:
      'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=1400&auto=format&fit=crop',
  },
]

const FALLBACK_CLIENT_LOGOS = [
  '/images/clients/egy fooz.png',
  '/images/clients/el tfl.png',
  '/images/clients/m3di gardns2.png',
  '/images/clients/marina logo2.png',
  '/images/clients/el nassr.png',
  '/images/clients/ET_Logo.png',
  '/images/clients/emaar-logo-png_seeklogo-305352.png',
  '/images/clients/Gap-Symbol.png',
]

// أول 3 بروجكتس، دلوقتي معرّفين هنا جوه الكود نفسه
// بدل ما يتجابوا من ../data/projects.js
const FALLBACK_FEATURED = [
  {
    id: 'nova-retail-branding',
    title: 'Nova Retail Rebrand',
    category: 'brand | design',
    image:
      'https://res.cloudinary.com/accom0gz/image/upload/v1787940188/WhatsApp_Image_2026-08-28_at_9.02.42_PM.jpg',
  },
  {
    id: 'techexpo-booth',
    title: 'TechExpo Exhibition Stand',
    category: 'Exhibitions',
    image:
      'https://res.cloudinary.com/accom0gz/image/upload/v1787831756/ChatGPT_Image_Aug_26_2026_08_39_52_PM.png',
  },
  {
    id: 'summit-conference',
    title: 'Summit Conference Environment',
    category: 'Exhibitions',
    image:
      'https://res.cloudinary.com/accom0gz/image/upload/v1787831767/ChatGPT_Image_Aug_26_2026_08_39_36_PM.png',
  },
]

export default function Home() {
  const light1Ref = useRef(null)
  const light2Ref = useRef(null)
  const sectionRef = useRef(null)
  const animationRef = useRef(null)

  // كل الـ state دي بتبدأ بالفولباك المحلي فورًا
  const [services, setServices] = useState(FALLBACK_SERVICES)
  const [clientLogos, setClientLogos] = useState(FALLBACK_CLIENT_LOGOS)
  const [featured, setFeatured] = useState(FALLBACK_FEATURED)

  const handleHeroMouseMove = useCallback((e) => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
    }

    animationRef.current = requestAnimationFrame(() => {
      const rect = sectionRef.current?.getBoundingClientRect()

      if (!rect) return

      const mouseX = e.clientX - rect.left
      const mouseY = e.clientY - rect.top

      if (light1Ref.current) {
        light1Ref.current.style.left = mouseX + 'px'
        light1Ref.current.style.top = mouseY + 'px'
      }

      if (light2Ref.current) {
        light2Ref.current.style.left = mouseX + 'px'
        light2Ref.current.style.top = mouseY + 'px'
      }
    })
  }, [])

  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [])

  // ==========================================
  // LOAD SERVICES FROM SUPABASE
  // ==========================================

  useEffect(() => {
    let mounted = true

    async function loadServices() {
      const { data, error } = await supabase
        .from('services')
        .select('id, number, title, description, image, created_at')
        .order('created_at', { ascending: true })

      if (!mounted) return

      if (error) {
        console.error('Error loading services:', error)
        // سيبي الفولباك ظاهر
        return
      }

      const servicesData = data || []

      if (servicesData.length === 0) return

      setServices(servicesData)
    }

    loadServices()

    return () => {
      mounted = false
    }
  }, [])

  // ==========================================
  // LOAD CLIENT LOGOS FROM SUPABASE
  // ==========================================

  useEffect(() => {
    let mounted = true

    async function loadClientLogos() {
      const { data, error } = await supabase
        .from('client_logos')
        .select('id, image, created_at')
        .order('created_at', { ascending: true })

      if (!mounted) return

      if (error) {
        console.error('Error loading client logos:', error)
        // سيبي الفولباك ظاهر
        return
      }

      const logosData = data || []

      if (logosData.length === 0) return

      setClientLogos(logosData.map((l) => l.image))
    }

    loadClientLogos()

    return () => {
      mounted = false
    }
  }, [])

  // ==========================================
  // LOAD FEATURED PROJECTS FROM SUPABASE
  // ==========================================

  useEffect(() => {
    let mounted = true

    async function loadFeatured() {
      const { data, error } = await supabase
        .from('projects')
        .select('id, title, category, image, created_at')
        .order('created_at', { ascending: true })
        .limit(3)

      if (!mounted) return

      if (error) {
        console.error('Error loading featured projects:', error)
        // سيبي الفولباك ظاهر
        return
      }

      const featuredData = data || []

      if (featuredData.length === 0) return

      setFeatured(featuredData)
    }

    loadFeatured()

    return () => {
      mounted = false
    }
  }, [])

  const scopeRef = useReveal([services, clientLogos, featured])

  return (
    <div ref={scopeRef}>

      {/* =====================================================
          HERO
      ===================================================== */}

      <section
        ref={sectionRef}
        className="hero relative overflow-hidden"
        onMouseMove={handleHeroMouseMove}
      >
        <CropMarks />

        {/* Mouse Lights */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">

          {/* Light 1 */}
          <div
            ref={light1Ref}
            className="
              absolute
              w-[1000px]
              h-[1000px]
              -translate-x-1/2
              -translate-y-1/2
              rounded-full
              bg-red-500/40
              blur-[180px]
              will-change-transform
            "
            style={{
              left: '0px',
              top: '0px',
              transition: 'left 0.08s ease-out, top 0.08s ease-out',
            }}
          />

          {/* Light 2 */}
          <div
            ref={light2Ref}
            className="
              absolute
              w-[800px]
              h-[800px]
              -translate-x-1/2
              -translate-y-1/2
              rounded-full
              bg-red-700/30
              blur-[160px]
              will-change-transform
            "
            style={{
              left: '0px',
              top: '0px',
              transition: 'left 0.08s ease-out, top 0.08s ease-out',
            }}
          />
        </div>

        {/* Hero Content */}
        <div className="container hero-grid relative z-10">

          <div className="hero-copy">

            <h1 className="hero-title font-display">
              WE CREATE
              <br />
              BRANDS THAT
              <br />
              <span className="line-accent font-display">
                STAND OUT.
              </span>
            </h1>

            <p className="hero-sub">
              From printing and branding to advertising and exhibition solutions,
              we turn ideas into powerful visual experiences.
            </p>

            <div className="hero-actions">
              <Button to="/projects">
                Explore Our Projects
              </Button>

              <Button to="/contact" variant="outline">
                Contact Us
              </Button>
            </div>

          </div>

          {/* Hero Image */}
          <div className="hero-visual relative">

            <img
              src="https://res.cloudinary.com/accom0gz/image/upload/v1787937132/WhatsApp_Image_2026-08-28_at_8.10.09_PM.jpg"
              alt="Large-format print production"
              className="w-full h-full object-cover"
            />

            <div
              className="
                hero-visual-tag
                absolute
                bottom-6
                left-6
                flex
                items-center
                gap-4
                bg-black/50
                backdrop-blur-md
                px-5
                py-3
                rounded-xl
              "
            >
              <span>
                PRINT · BRAND · EXHIBIT
              </span>

              <span className="reg-mark" />
            </div>

          </div>

        </div>

        {/* Scroll */}
        <div
          className="
            hero-scroll
            absolute
            bottom-8
            left-1/2
            -translate-x-1/2
            flex
            flex-col
            items-center
            gap-3
            z-10
          "
        >
          <span>Scroll</span>
          <span className="hero-scroll-line" />
        </div>

      </section>


      {/* =====================================================
          INTRO
      ===================================================== */}

      <section className="section">

        <div className="container intro-grid">

          <div className="reveal">

            <span className="eyebrow">
              Who We Are
            </span>

            <h2
              className="intro-heading"
              style={{ marginTop: 14 }}
            >
              WE TURN IDEAS
              <br />
              INTO VISUAL
              <br />
              EXPERIENCES.
            </h2>

          </div>

          <div className="intro-body reveal reveal-delay-1">

            <p>
              Easy Group is a full-service creative production house.
              We design and build the printed, branded and physical
              experiences that put a company in front of its audience —
              from a single business card to a full exhibition floor.
            </p>

            <p>
              Our studio and press work side by side, so every idea moves
              from concept to production without losing the details that
              make a brand recognizable.
            </p>

          </div>

        </div>

      </section>


      {/* =====================================================
          SERVICES
      ===================================================== */}

      <section className="section">

        <div className="container">

          <div className="section-head reveal">

            <div>

              <span className="eyebrow">
                What We Do
              </span>

              <h2 className="section-heading">
                Services
              </h2>

            </div>

          </div>

          <div className="services-grid">

            {services.map((s, i) => (
              <ServiceCard
                key={s.id ?? s.number}
                {...s}
                delayClass={`reveal-delay-${(i % 4) + 1}`}
              />
            ))}

          </div>

        </div>

      </section>


      {/* =====================================================
          SELECTED PROJECTS
      ===================================================== */}

      <section className="section">

        <div className="container">

          <div className="section-head reveal">

            <div>

              <span className="eyebrow">
                Our Work
              </span>

              <h2 className="section-heading">
                Selected Projects
              </h2>

            </div>

          </div>

          <div className="featured-grid">

            {featured.map((p, i) => (
              <Link
                key={p.id}
                to="/projects"
                style={{ display: 'block' }}
              >
                <ProjectCard
                  {...p}
                  delayClass={`reveal-delay-${i + 1}`}
                />
              </Link>
            ))}

          </div>

          <div className="featured-cta reveal">

            <Button
              to="/projects"
              variant="outline"
            >
              View All Projects
            </Button>

          </div>

        </div>

      </section>


      {/* =====================================================
          WHY US
      ===================================================== */}

      <section className="section why-section">

        <div className="container">

          <h2 className="why-heading reveal">

            BUILT TO MAKE{' '}

            <span className="accent">
              YOUR BRAND
            </span>

            <br />

            IMPOSSIBLE TO IGNORE.

          </h2>

          <div className="why-grid">

            {whyItems.map((item, i) => {

              const Icon = item.icon

              return (
                <div
                  key={item.title}
                  className={`why-item reveal reveal-delay-${i + 1}`}
                >

                  <span className="why-item-index">
                    0{i + 1}
                  </span>

                  <Icon
                    size={26}
                    color="#ff3b30"
                    style={{ marginBottom: 18 }}
                  />

                  <h3 className="why-item-title">
                    {item.title}
                  </h3>

                  <p className="why-item-desc">
                    {item.desc}
                  </p>

                </div>
              )

            })}

          </div>

        </div>

      </section>


      {/* =====================================================
          CTA
      ===================================================== */}

      <section className="cta-section">

        <div className="container">

          <div className="cta-box reveal">

            <CropMarks />

            <h2 className="cta-heading">
              HAVE A PROJECT
              <br />
              IN MIND?
            </h2>

            <p className="cta-text">
              Let's create something powerful together.
            </p>

            <div className="cta-actions">

              <Button to="/contact">
                Get in touch
              </Button>

            </div>

          </div>

        </div>

      </section>

      {/* =====================================================
          CLIENT LOGOS MARQUEE
      ===================================================== */}

      <section className="relative overflow-hidden border-y border-white/10 pt-26 pb-36">
        {/* Heading */}
        <div className="container mb-10">

          <div className="text-center">

            <span
              className="
                text-[10px]
                tracking-[0.3em]
                uppercase
                text-white/40
              "
            >
              Trusted By
            </span>

          </div>

        </div>


        {/* Fade Left */}
        <div
          className="
            pointer-events-none
            absolute
            left-0
            top-0
            z-10
            h-full
            w-24
            bg-gradient-to-r
            from-black
            to-transparent
          "
        />


        {/* Fade Right */}
        <div
          className="
            pointer-events-none
            absolute
            right-0
            top-0
            z-10
            h-full
            w-24
            bg-gradient-to-l
            from-black
            to-transparent
          "
        />


        {/* Marquee */}
        <div className="overflow-hidden">

          <div
            className="
              flex
              w-max
              items-center
              animate-[logo-marquee_25s_linear_infinite]
            "
          >

            {/* First Set */}
            {clientLogos.map((logo, index) => (

              <div
                key={`logo-first-${index}`}
                className="
                  flex
                  h-24
                  w-48
                  shrink-0
                  items-center
                  justify-center
                  mx-8
                "
              >

                <img
                  src={logo}
                  alt="Client logo"
                  className="
                    max-h-14
                    max-w-[150px]
                    object-contain
                    opacity-60
                    grayscale
                    transition-all
                    duration-300
                    hover:opacity-100
                    hover:grayscale-0
                  "
                />

              </div>

            ))}


            {/* Duplicate Set */}
            {clientLogos.map((logo, index) => (

              <div
                key={`logo-second-${index}`}
                className="
                  flex
                  h-24
                  w-48
                  shrink-0
                  items-center
                  justify-center
                  mx-8
                "
              >

                <img
                  src={logo}
                  alt="Client logo"
                  className="
                    max-h-14
                    max-w-[150px]
                    object-contain
                    opacity-60
                    grayscale
                    transition-all
                    duration-300
                    hover:opacity-100
                    hover:grayscale-0
                  "
                />

              </div>

            ))}

          </div>

        </div>

      </section>


    </div>
  )
}