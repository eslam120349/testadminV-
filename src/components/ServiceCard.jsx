import { ArrowUpRight } from 'lucide-react'

export default function ServiceCard({ number, title, description, image, delayClass = '' }) {
  return (
    <article className={`service-card reveal ${delayClass}`}>
      <div className="service-card-image">
        <img src={image} alt="" loading="lazy" />
      </div>
      <div className="service-card-body">
        <span className="service-card-number">{number}</span>
        <div>
          <h3 className="service-card-title">{title}</h3>
          <p className="text-mist service-card-desc">{description}</p>
        </div>
        <ArrowUpRight className="service-card-arrow" aria-hidden="true" />
      </div>
    </article>
  )
}
