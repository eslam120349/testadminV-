import { useEffect, useRef } from 'react'

/**
 * Attaches an IntersectionObserver to every element with the `.reveal`
 * class inside the given ref and toggles `.is-visible` as it scrolls
 * into view. Call once per page/route.
 */
export default function useReveal(deps = []) {
  const scopeRef = useRef(null)

  useEffect(() => {
    const scope = scopeRef.current || document
    const els = scope.querySelectorAll('.reveal')

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.15, rootMargin: '0px 0px -60px 0px' }
    )

    els.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return scopeRef
}
