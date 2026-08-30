import { ArrowUpRight } from 'lucide-react'

export default function ProjectCard({
  title,
  category,
  image,
  delayClass = '',
}) {
  return (
    <article
      className={`project-card reveal ${delayClass} w-full h-full flex flex-col`}
    >
      <div className="project-card-image w-full flex-1 overflow-hidden">
        <img
          src={image}
          alt=""
          loading="lazy"
          className="w-full h-full object-cover"
        />
      </div>

      <div className="project-card-overlay">
        <span className="project-card-category">
          {category}
        </span>

        <div className="project-card-row">
          <h3 className="project-card-title">
            {title}
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