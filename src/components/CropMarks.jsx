/**
 * Signature motif — printer's crop marks. Drop into any `position:
 * relative` container to mark its corners, echoing the print-shop
 * origin of the brand. Use sparingly: hero, section frames, cards.
 */
export default function CropMarks({ corners = ['tl', 'tr', 'bl', 'br'] }) {
  return (
    <>
      {corners.map((c) => (
        <span key={c} className={`crop-mark ${c}`} aria-hidden="true" />
      ))}
    </>
  )
}
