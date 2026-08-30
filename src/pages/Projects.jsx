import { useMemo, useState, useEffect } from 'react'
import { X } from 'lucide-react'
import useReveal from '../hooks/useReveal.js'
import ProjectCard from '../components/ProjectCard.jsx'
import CropMarks from '../components/CropMarks.jsx'
import { supabase } from '../lib/supabase.js'

// ==========================================
// FALLBACK PROJECTS (shown instantly on load,
// before Supabase data arrives — replaced once
// the DB responds)
// ==========================================
const FALLBACK_PROJECTS = [
  {
    id: 'nova-retail-branding',
    title: 'Nova Retail Rebrand',
    category: 'brand | design',
    size: 'lg',
    image:
      'https://res.cloudinary.com/accom0gz/image/upload/v1787940188/WhatsApp_Image_2026-08-28_at_9.02.42_PM.jpg',
  },
  {
    id: 'techexpo-booth',
    title: 'TechExpo Exhibition Stand',
    category: 'Exhibitions',
    size: 'lg',
    image:
      'https://res.cloudinary.com/accom0gz/image/upload/v1787831756/ChatGPT_Image_Aug_26_2026_08_39_52_PM.png',
  },
  {
    id: 'summit-conference',
    title: 'Summit Conference Environment',
    category: 'Exhibitions',
    size: 'sm',
    image:
      'https://res.cloudinary.com/accom0gz/image/upload/v1787831767/ChatGPT_Image_Aug_26_2026_08_39_36_PM.png',
  },
  {
    id: 'orbit-identity-suite',
    title: 'Orbit Identity Suite',
    category: 'brand | design',
    size: 'md',
    image:
      'https://res.cloudinary.com/accom0gz/image/upload/v1787940215/WhatsApp_Image_2026-08-28_at_9.02.59_PM.jpg',
  },
  {
    id: 'flags_print',
    title: 'flags print',
    category: 'Printing',
    size: 'sm',
    image:
      'https://res.cloudinary.com/accom0gz/image/upload/v1787936732/WhatsApp_Image_2026-08-28_at_8.04.48_PM.jpg',
  },
  {
    id: 'Direct_to_Garment',
    title: 'Direct to Garment',
    category: 'Printing',
    size: 'sm',
    image:
      'https://res.cloudinary.com/accom0gz/image/upload/v1787929412/WhatsApp_Image_2026-08-28_at_6.00.17_PM.jpg',
  },
  {
    id: 'PuFF_Print',
    title: 'PuFF Print',
    category: 'Printing',
    size: 'sm',
    image:
      'https://res.cloudinary.com/accom0gz/image/upload/v1787831743/ChatGPT_Image_Aug_26_2026_08_44_54_PM.png',
  },
  {
    id: 'Vinyl-Print',
    title: 'Vinyl Print',
    category: 'Printing',
    size: 'sm',
    image:
      'https://res.cloudinary.com/accom0gz/image/upload/v1787931987/WhatsApp_Image_2026-08-28_at_6.41.55_PM.jpg',
  },
  {
    id: 'product_print',
    title: 'product print',
    category: 'Printing',
    size: 'sm',
    image:
      'https://res.cloudinary.com/accom0gz/image/upload/v1787834286/3clinsder.png',
  },
  {
    id: 'package_print',
    title: 'package print',
    category: 'Printing',
    size: 'sm',
    image:
      'https://res.cloudinary.com/accom0gz/image/upload/v1787832328/boxs_eg3.png',
  },
  {
    id: 'UV_stickersprint',
    title: 'UV stickers print',
    category: 'Printing',
    size: 'sm',
    image:
      'https://res.cloudinary.com/accom0gz/image/upload/v1787929190/WhatsApp_Image_2026-08-28_at_5.57.44_PM.jpg',
  },
  {
    id: 'road_banner',
    title: 'road banner',
    category: 'Printing',
    size: 'sm',
    image:
      'https://res.cloudinary.com/accom0gz/image/upload/v1787929293/WhatsApp_Image_2026-08-28_at_5.58.18_PM.jpg',
  },
  {
    id: 'Flex',
    title: 'Flex',
    category: 'Printing',
    size: 'sm',
    image:
      'https://res.cloudinary.com/accom0gz/image/upload/v1787934287/WhatsApp_Image_2026-08-28_at_7.23.39_PM.jpg',
  },
  {
    id: 'Seethrough_glass_print',
    title: 'Seethrough glass print',
    category: 'Printing',
    size: 'sm',
    image:
      'https://res.cloudinary.com/accom0gz/image/upload/v1787934235/WhatsApp_Image_2026-08-28_at_7.19.07_PM.jpg',
  },
  {
    id: 'transparent_vinyl',
    title: 'transparent vinyl',
    category: 'Printing',
    size: 'sm',
    image:
      'https://res.cloudinary.com/accom0gz/image/upload/v1787832437/ChatGPT_Image_Aug_26_2026_08_07_06_PM.png',
  },
  {
    id: 'Print_and_Cut',
    title: 'Print and Cut',
    category: 'Printing',
    size: 'sm',
    image:
      'https://res.cloudinary.com/accom0gz/image/upload/v1787928685/WhatsApp_Image_2026-08-28_at_5.50.56_PM.jpg',
  },
  {
    id: 'Car_Vinyl',
    title: 'Car Vinyl',
    category: 'Printing',
    size: 'sm',
    image:
      'https://res.cloudinary.com/accom0gz/image/upload/v1787832318/ChatGPT_Image_Aug_26_2026_08_06_50_PM.png',
  },
  {
    id: 'Acrylic_Sign',
    title: 'Acrylic Sign',
    category: 'Printing',
    size: 'sm',
    image:
      'https://res.cloudinary.com/accom0gz/image/upload/v1787929339/WhatsApp_Image_2026-08-28_at_5.59.32_PM.jpg',
  },
  {
    id: 'Canvas',
    title: 'Canvas',
    category: 'Printing',
    size: 'sm',
    image:
      'https://res.cloudinary.com/accom0gz/image/upload/v1787848234/WhatsApp_Image_2026-08-27_at_7.29.57_PM.jpg',
  },
  {
    id: 'Mash',
    title: 'Mash',
    category: 'Printing',
    size: 'sm',
    image:
      'https://res.cloudinary.com/accom0gz/image/upload/v1787832352/easy_group_mush_print_holes.png',
  },
  {
    id: 'Wallpaper',
    title: 'Wallpaper',
    category: 'Printing',
    size: 'sm',
    image:
      'https://res.cloudinary.com/accom0gz/image/upload/v1787834433/download_73.jpg',
  },
  {
    id: 'give_away',
    title: 'give away',
    category: 'company service',
    size: 'sm',
    image:
      'https://res.cloudinary.com/accom0gz/image/upload/v1787847484/WhatsApp_Image_2026-08-27_at_7.16.11_PM.jpg',
  },
  {
    id: 'summer_give_away',
    title: 'summer give away',
    category: 'company service',
    size: 'sm',
    image:
      'https://res.cloudinary.com/accom0gz/image/upload/v1787835300/WhatsApp_Image_2026-08-26_at_12.40.30_PM_1.jpg',
  },
  {
    id: 'catalog / magazines',
    title: 'catalog',
    category: 'Printing',
    size: 'sm',
    image:
      'https://res.cloudinary.com/accom0gz/image/upload/v1787847355/23PM.jpg',
  },
  {
    id: 'cards',
    title: 'cards',
    category: 'Printing',
    size: 'sm',
    image:
      'https://res.cloudinary.com/accom0gz/image/upload/v1787835042/cards_eg_2.png',
  },
  {
    id: 'menus',
    title: 'menus',
    category: 'Printing',
    size: 'sm',
    image:
      'https://res.cloudinary.com/accom0gz/image/upload/v1787835832/ChatGPT_Image_Aug_27_2026_05_11_02_PM.png',
  },
]

// Categories derived from the fallback list, used until Supabase responds
const FALLBACK_CATEGORIES = [
  'All',
  ...new Set(FALLBACK_PROJECTS.map((p) => p.category).filter(Boolean)),
]

export default function Projects() {
  const [active, setActive] = useState('All')
  const [selected, setSelected] = useState(null)

  // ابدأ بعرض الداتا الثابتة فورًا، وهتتستبدل لما داتا Supabase توصل
  const [projects, setProjects] = useState(FALLBACK_PROJECTS)
  const [categories, setCategories] = useState(FALLBACK_CATEGORIES)
  const [loading, setLoading] = useState(false)

  /*
   * IMPORTANT:
   * نفس طريقة الـ reveal الموجودة في الريبو.
   * بنعيد تشغيلها كل ما الداتا (fallback أو Supabase) أو الفلتر يتغيروا.
   */
  const scopeRef = useReveal([projects, active])

  // ==========================================
  // LOAD PROJECTS FROM SUPABASE
  // (fallback data فوق دي بتفضل ظاهرة لحد ما الطلب يخلص)
  // ==========================================

  useEffect(() => {
    let mounted = true

    async function loadProjects() {
      const { data, error } = await supabase
        .from('projects')
        .select('id, title, category, image, created_at')
        .order('created_at', { ascending: true })

      if (!mounted) return

      if (error) {
        console.error('Error loading projects:', error)
        // في حالة الخطأ سيبي الـ fallback ظاهر بدل ما تفضغ الصفحة
        return
      }

      const projectsData = data || []

      // لو الداتابيز رجعت فاضية، سيبي الـ fallback ظاهر برضو
      if (projectsData.length === 0) return

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
            (مش هتتفعّل غالبًا لأن الـ fallback بيظهر فورًا،
            سايبها لو حبيت تستخدمها في حالة تانية)
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