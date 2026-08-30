import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'

/**
 * variant: 'primary' | 'outline' | 'ghost'
 * to: internal route (renders Link) — otherwise renders <button>
 * icon: show trailing arrow icon (default true for primary/outline)
 */
export default function Button({
  children,
  to,
  onClick,
  variant = 'primary',
  icon = true,
  type = 'button',
  className = '',
}) {
  const classes = `btn btn-${variant} ${className}`.trim()
  const content = (
    <>
      <span>{children}</span>
      {icon && variant !== 'ghost' && <ArrowUpRight className="btn-icon" aria-hidden="true" />}
    </>
  )

  if (to) {
    return (
      <Link to={to} className={classes}>
        {content}
      </Link>
    )
  }

  return (
    <button type={type} onClick={onClick} className={classes}>
      {content}
    </button>
  )
}
