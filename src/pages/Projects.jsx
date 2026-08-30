
import { useMemo, useState, useEffect } from 'react'
import { X } from 'lucide-react'
import useReveal from '../hooks/useReveal.js'
import ProjectCard from '../components/ProjectCard.jsx'
import CropMarks from '../components/CropMarks.jsx'
import { supabase } from '../lib/supabase.js'

export default function Projects() {
  const [active, setActive] = useState('All')
  const [selected, setSelected] = useState(null)

  const [projects, setProjects] = useState([])
  const [categories, setCategories] = useState(['All'])
  const [loading, setLoading] = useState(true)

  /*
   * IMPORTANT:
   * نفس طريقة الـ reveal الموجودة في الريبو.
   * بنعيد تشغيلها فقط بعد ما بيانات Supabase توصل.
   */
  const scopeRef = useReveal([projects, active])

  // ==========================================
  // LOAD PROJECTS FROM SUPABASE
  // ==========================================

  useEffect(() => {
    let mounted = true

    async function loadProjects() {
      setLoading(true)

      const { data, error } = await supabase
        .from('projects')
        .select('id, title, category, image, created_at')
        .order('created_at', { ascending: true })

      if (error) {
        console.error('Error loading projects:', error)

        if (mounted) {
          setProjects([])
          setCategories(['All'])
          setLoading(false)
        }

        return
      }

      if (!mounted) return

      const projectsData = data || []

      setProjects(projectsData)

      // Create categories automatically from database
      const uniqueCategories = [
        ...new Set(
          projectsData
            .map((project) => project.category)
            .filter(Boolean)
        ),
      ]

      setCategories(['All', ...uniqueCategories])

      setLoading(false)
    }

    loadProjects()

    return () => {
      mounted = false
    }
  }, [])

  // ==========================================
  // FILTER PROJECTS
  // ==========================================

  const filtered = useMemo(
    () =>
      active === 'All'
        ? projects
        : projects.filter(
          (p) => p.category === active
        ),
    [active, projects]
  )

  // ==========================================
  // LOCK BODY WHEN MODAL IS OPEN
  // ==========================================

  useEffect(() => {
    document.body.style.overflow = selected
      ? 'hidden'
      : ''

    return () => {
      document.body.style.overflow = ''
    }
  }, [selected])

  // ==========================================
  // RESET FILTER IF CATEGORY NO LONGER EXISTS
  // ==========================================

  useEffect(() => {
    if (
      active !== 'All' &&
      !categories.includes(active)
    ) {
      setActive('All')
    }
  }, [categories, active])

  return (
    <div ref={scopeRef}>

      {/* =====================================================
          PAGE HERO
      ===================================================== */}

      <section className="page-hero">
        <div className="container">

          <span className="eyebrow">
            Our Work
          </span>

          <h1 className="page-hero-heading">
            PROJECTS THAT
            <br />
            MAKE AN IMPACT.
          </h1>

          <p className="page-hero-sub">
            A selection of print, brand, advertising and exhibition work
            produced end-to-end by our studio and press floor.
          </p>

        </div>
      </section>


      {/* =====================================================
          PROJECTS
      ===================================================== */}

      <div className="container px-4 sm:px-0">

        {/* FILTERS */}

        <div className="filters reveal mb-12">

          {categories.map((c) => (
            <button
              key={c}
              className={`filter-btn ${active === c ? 'is-active' : ''
                }`}
              onClick={() => setActive(c)}
            >
              {c}
            </button>
          ))}

        </div>


        {/* =====================================================
            LOADING
        ===================================================== */}

        {loading && (
          <div className="py-20 text-center text-white/50">
            Loading projects...
          </div>
        )}


        {/* =====================================================
            PROJECT GRID
        ===================================================== */}

        {!loading && (
          <div className="projects-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

            {filtered.map((p, i) => (

              <div
                key={p.id}
                onClick={() => setSelected(p)}
                className="w-full aspect-[4/3] flex flex-col overflow-hidden cursor-pointer"
              >

                <ProjectCard
                  {...p}
                  delayClass={`reveal-delay-${(i % 4) + 1}`}
                />

              </div>

            ))}

          </div>
        )}


        {/* =====================================================
            NO PROJECTS
        ===================================================== */}

        {!loading && filtered.length === 0 && (
          <div className="py-20 text-center text-white/50">
            No projects found.
          </div>
        )}

      </div>


      {/* =====================================================
          PROJECT MODAL
      ===================================================== */}

      {selected && (

        <div
          className="modal-backdrop"
          onClick={() => setSelected(null)}
        >

          <div
            className="modal-panel"
            onClick={(e) => e.stopPropagation()}
          >

            {/* Close */}

            <button
              className="modal-close"
              onClick={() => setSelected(null)}
              aria-label="Close project details"
            >
              <X size={20} />
            </button>


            {/* Image */}

            <img
              className="modal-image"
              src={selected.image}
              alt={selected.title}
            />


            {/* Body */}

            <div className="modal-body">

              <span className="eyebrow">
                {selected.category}
              </span>

              <h3
                className="modal-title"
                style={{ marginTop: 14 }}
              >
                {selected.title}
              </h3>

              <p
                className="text-mist"
                style={{
                  lineHeight: 1.7,
                  fontSize: 15.5,
                }}
              >
                A full production run for{' '}
                {selected.title.toLowerCase()},
                covering concept development,
                material selection and on-site
                delivery — handled start to finish
                by the Easy Group team.
              </p>

            </div>

          </div>

        </div>

      )}


      {/* =====================================================
          CLIENTS SECTION
      ===================================================== */}

      <section className="cta-section">

        <div className="container">

          <div className="cta-box reveal">

            <CropMarks />

            <h2 className="cta-heading">
              OUR CLIENTS
            </h2>

            <img
              src="/images/clint1.jpeg"
              alt="Clients"
              draggable={false}
              className="w-full h-full object-cover mx-auto block rounded-xl"
            />

            <br />

            <img
              src="/images/clinte.jpeg"
              alt="Clients"
              draggable={false}
              className="w-full h-full object-cover mx-auto block rounded-xl"
            />

          </div>

        </div>

      </section>

    </div>
  )
}
