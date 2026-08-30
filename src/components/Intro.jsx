import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/**
 * EASY GROUP — Intro / preloader.
 * Print-shop register sequence: crop marks lock in, the registration
 * crosshair spins into alignment, the wordmark rises out of a mask
 * (like paper feeding through a press), then the whole overlay wipes
 * up off the page — echoing the crop-mark / registration motif used
 * across the rest of the site.
 *
 * Shows once per browser session (see App.jsx).
 */

const WORDMARK = ['EASY', 'GROUP']
const TAGLINE = 'WE CREATE BRANDS THAT STAND OUT.'
const EASE = [0.16, 1, 0.3, 1]
const HOLD_MS = 2200 // time before the exit wipe begins
const EXIT_MS = 850 // exit wipe duration — keep in sync with the exit transition below

export default function Intro({ onComplete }) {
    const [visible, setVisible] = useState(true)
    const [progress, setProgress] = useState(0)
    const rafRef = useRef(null)
    const startRef = useRef(null)

    useEffect(() => {
        const prevOverflow = document.body.style.overflow
        document.body.style.overflow = 'hidden'

        const tick = (t) => {
            if (!startRef.current) startRef.current = t
            const elapsed = t - startRef.current
            setProgress(Math.min(100, Math.round((elapsed / HOLD_MS) * 100)))
            if (elapsed < HOLD_MS) {
                rafRef.current = requestAnimationFrame(tick)
            }
        }
        rafRef.current = requestAnimationFrame(tick)

        const exitTimer = setTimeout(() => setVisible(false), HOLD_MS)
        const doneTimer = setTimeout(() => {
            document.body.style.overflow = prevOverflow
            onComplete?.()
        }, HOLD_MS + EXIT_MS)

        return () => {
            cancelAnimationFrame(rafRef.current)
            clearTimeout(exitTimer)
            clearTimeout(doneTimer)
            document.body.style.overflow = prevOverflow
        }
    }, [onComplete])

    return (
        <AnimatePresence>
            {visible && (
                <motion.div
                    className="intro-overlay"
                    initial={{ opacity: 1 }}
                    exit={{
                        clipPath: 'inset(0% 0% 100% 0%)',
                        transition: { duration: EXIT_MS / 1000, ease: EASE },
                    }}
                >
                    <span className="crop-mark tl" aria-hidden="true" />
                    <span className="crop-mark tr" aria-hidden="true" />
                    <span className="crop-mark bl" aria-hidden="true" />
                    <span className="crop-mark br" aria-hidden="true" />

                    <div className="intro-center">
                        <motion.img
                            src="/images/logo.jpeg.png"
                            alt="Easy Group"
                            className="intro-logo"
                            initial={{ opacity: 0, scale: 0.3, rotate: -90 }}
                            animate={{ opacity: 1, scale: 1, rotate: 0 }}
                            transition={{
                                duration: 0.6,
                                ease: EASE,
                                delay: 0.1,
                            }}
                        />
                        <h1 className="intro-wordmark" aria-label="Easy Group">
                            {WORDMARK.map((word, wi) => (
                                <span className="intro-word" key={word}>
                                    {word.split('').map((ch, ci) => (
                                        <span className="intro-char-mask" key={ci}>
                                            <motion.span
                                                className="intro-char"
                                                initial={{ y: '110%' }}
                                                animate={{ y: '0%' }}
                                                transition={{
                                                    duration: 0.7,
                                                    ease: EASE,
                                                    delay: 0.5 + (wi * 4 + ci) * 0.035,
                                                }}
                                            >
                                                {ch}
                                            </motion.span>
                                        </span>
                                    ))}
                                </span>
                            ))}
                        </h1>

                        <motion.span
                            className="intro-underline"
                            initial={{ scaleX: 0 }}
                            animate={{ scaleX: 1 }}
                            transition={{ duration: 0.5, ease: EASE, delay: 1.05 }}
                        />

                        <p className="intro-tagline">
                            {TAGLINE.split(' ').map((word, i) => (
                                <motion.span
                                    className="intro-tagline-word"
                                    key={i}
                                    initial={{ opacity: 0, y: 14 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, ease: EASE, delay: 1.25 + i * 0.06 }}
                                >
                                    {word}
                                </motion.span>
                            ))}
                        </p>
                    </div>

                    <motion.div
                        className="intro-footer"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.35 }}
                    >
                        <span className="intro-footer-label">CREATIVE PRODUCTION HOUSE</span>
                        <span className="intro-counter">{String(progress).padStart(3, '0')}%</span>
                    </motion.div>

                    <div className="intro-progress-track" aria-hidden="true">
                        <motion.div
                            className="intro-progress-bar"
                            style={{ transform: `scaleX(${progress / 100})` }}
                        />
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}