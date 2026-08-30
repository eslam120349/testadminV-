import { ArrowUpRight } from 'lucide-react'
export default function ProjectCard({
  title,
  category,
  image,
  image_url,
  delayClass = '',
}) {
  const imgSrc =
    image ||
    image_url ||
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1200&auto=format&fit=crop'
  return (

    <article
      className={`project-card is-visible ${delayClass} w-full h-full flex flex-col`}
      style={{ opacity: 1, visibility: 'visible', transform: 'none' }}
    >
      <div className="project-card-image w-full flex-1 overflow-hidden relative" style={{ minHeight: '200px' }}>
        <img
          src={imgSrc}
          alt={title || 'Project image'}
          loading="lazy"
          className="w-full h-full object-cover"
        />
      </div>

      <div className="project-card-overlay">
        <span className="project-card-category">
          {category || 'Printing'}
        </span>
        <div className="project-card-row">
          <h3 className="project-card-title">
            {title || 'Project'}
          </h3>
          <ArrowUpRight
            className="project-card-arrow"
            aria-hidden="true"
          />
        </div>
      </div>
    </article>
  )
}
