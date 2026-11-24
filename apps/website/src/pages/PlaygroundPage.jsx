import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Link } from 'react-router'
import {
  ArrowCounterClockwise,
  ArrowsInSimple,
  ArrowsOutSimple,
  Bug,
  ChalkboardTeacher,
  ChatCircleText,
  Monitor,
} from '@phosphor-icons/react'
import SiteFooter from '../components/SiteFooter.jsx'
import SiteHeader from '../components/SiteHeader.jsx'
import { CHALLENGES, EXPERIENCES } from '../playground/experiences.js'
import FeedbackSample from '../playground/samples/FeedbackSample.jsx'
import TeachSample from '../playground/samples/TeachSample.jsx'
import DiagnoseSample from '../playground/samples/DiagnoseSample.jsx'
import '../playground/playground.css'

// /playground: one page, the same design approach as the landing page
// (apps/website/AGENTS.md). Pick a sample, then use the installed extension on
// it. The samples keep their own palettes, scoped under `.pg-sample`.

const SAMPLES = {
  feedback: FeedbackSample,
  teach: TeachSample,
  diagnose: DiagnoseSample,
}
const ICONS = {
  feedback: ChatCircleText,
  teach: ChalkboardTeacher,
  diagnose: Bug,
}

const CONTAINER = 'max-w-[1280px] mx-auto px-[clamp(20px,5vw,56px)]'
const FLIP_MS = 280
const FLIP_EASE = 'cubic-bezier(0.2, 0.8, 0.2, 1)'
const CONTROL =
  'inline-flex cursor-pointer items-center gap-2 rounded-full bg-transparent px-3 py-2 text-[14px] text-muted transition-colors hover:bg-fg/[0.08] hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent'

function Keys({ children }) {
  return (
    <kbd className="cp-keycap rounded-[7px] px-1.5 py-0.5 text-[0.9em]">
      {children}
    </kbd>
  )
}

export default function PlaygroundPage() {
  const [activeId, setActiveId] = useState(EXPERIENCES[0].id)
  const [resetCount, setResetCount] = useState(0)
  const [announcement, setAnnouncement] = useState('')
  const [maximized, setMaximized] = useState(false)
  const [showMobileNotice, setShowMobileNotice] = useState(() => {
    if (typeof window === 'undefined') return false
    if (!window.matchMedia('(max-width: 767px)').matches) return false
    try {
      return window.sessionStorage.getItem('capann-playground-mobile-notice') !== 'dismissed'
    } catch {
      return true
    }
  })
  const tabRefs = useRef([])
  const maximizeButtonRef = useRef(null)
  const openButtonRef = useRef(null)
  const mobileNoticeButtonRef = useRef(null)
  const panelRef = useRef(null)
  const flipRef = useRef(null)

  useEffect(() => {
    document.title = 'Capann playground'
  }, [])

  useEffect(() => {
    if (!maximized) return undefined
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    maximizeButtonRef.current?.focus()
    const openButton = openButtonRef.current
    return () => {
      document.body.style.overflow = previousOverflow
      // Minimized again: focus goes back to the button that opened it.
      openButton?.focus({ preventScroll: true })
    }
  }, [maximized])

  // FLIP the sample panel between its in-page frame and the fixed overlay.
  useLayoutEffect(() => {
    const panel = panelRef.current
    const first = flipRef.current
    if (!first) return undefined
    flipRef.current = null
    if (!panel) return undefined

    const last = panel.getBoundingClientRect()
    if (!last.width || !last.height) return undefined

    panel.style.transition = 'none'
    panel.style.transformOrigin = 'top left'
    panel.style.transform = `translate(${first.left - last.left}px, ${first.top - last.top}px) scale(${first.width / last.width}, ${first.height / last.height})`
    panel.getBoundingClientRect()

    const frame = requestAnimationFrame(() => {
      panel.style.transition = `transform ${FLIP_MS}ms ${FLIP_EASE}`
      panel.style.transform = 'none'
    })
    const timeout = setTimeout(() => {
      panel.style.transition = ''
      panel.style.transform = ''
      panel.style.transformOrigin = ''
    }, FLIP_MS + 60)

    return () => {
      cancelAnimationFrame(frame)
      clearTimeout(timeout)
      panel.style.transition = ''
      panel.style.transform = ''
      panel.style.transformOrigin = ''
    }
  }, [maximized])

  const active = EXPERIENCES.find((exp) => exp.id === activeId) ?? EXPERIENCES[0]
  const Sample = SAMPLES[active.id]

  const selectTab = (index) => {
    setActiveId(EXPERIENCES[index].id)
    tabRefs.current[index]?.focus()
  }

  const onTabKeyDown = (event) => {
    const index = EXPERIENCES.findIndex((exp) => exp.id === activeId)
    const last = EXPERIENCES.length - 1
    let next = null
    if (event.key === 'ArrowRight') next = index === last ? 0 : index + 1
    else if (event.key === 'ArrowLeft') next = index === 0 ? last : index - 1
    else if (event.key === 'Home') next = 0
    else if (event.key === 'End') next = last
    if (next !== null) {
      event.preventDefault()
      selectTab(next)
    }
  }

  const resetPlayground = () => {
    setResetCount((count) => count + 1)
    setAnnouncement('Playground reset. The sample page is back to its starting state.')
  }

  const toggleMaximized = useCallback(() => {
    const panel = panelRef.current
    if (!panel || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setMaximized((value) => !value)
      return
    }
    panel.style.transition = 'none'
    panel.style.transform = ''
    flipRef.current = panel.getBoundingClientRect()
    setMaximized((value) => !value)
  }, [])

  useEffect(() => {
    if (!maximized) return undefined
    const onKeyDown = (event) => {
      if (event.key === 'Escape') toggleMaximized()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [maximized, toggleMaximized])

  const dismissMobileNotice = useCallback(() => {
    setShowMobileNotice(false)
    try {
      window.sessionStorage.setItem('capann-playground-mobile-notice', 'dismissed')
    } catch {
      /* sessionStorage can be unavailable in private modes */
    }
  }, [])

  useEffect(() => {
    if (!showMobileNotice) return undefined
    const previousOverflow = document.body.style.overflow
    const previousFocus = document.activeElement
    document.body.style.overflow = 'hidden'
    mobileNoticeButtonRef.current?.focus()
    const onKeyDown = (event) => {
      if (event.key === 'Escape') dismissMobileNotice()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKeyDown)
      if (previousFocus instanceof HTMLElement) previousFocus.focus({ preventScroll: true })
    }
  }, [showMobileNotice, dismissMobileNotice])

  return (
    <div className="min-h-screen bg-canvas text-fg font-sans">
      <div inert={showMobileNotice}>
        <SiteHeader />
      </div>

      <main inert={showMobileNotice} className="pt-[96px]">
        <div className={CONTAINER}>
          <section className="pt-[clamp(40px,6vw,80px)]">
            <h1 className="cp-title">
              Try Capann on a sample page
            </h1>
            <p className="mt-5 mb-0 max-w-[56ch] text-[18px] leading-[1.6] text-body">
              Click the Capann icon in your browser’s toolbar, or press <Keys>Alt</Keys> + <Keys>Shift</Keys> + <Keys>S</Keys>. Then mark up the page below. Nothing you do changes it.
            </p>
          </section>

          <section aria-label="Sample pages" className="mt-[clamp(40px,6vw,72px)]">
            <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3 border-b border-line">
              <div role="tablist" aria-label="Sample pages" className="flex gap-x-7 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {EXPERIENCES.map((exp, index) => {
                  const selected = exp.id === activeId
                  const Icon = ICONS[exp.id]
                  return (
                    <button
                      key={exp.id}
                      ref={(el) => {
                        tabRefs.current[index] = el
                      }}
                      type="button"
                      role="tab"
                      id={`pg-tab-${exp.id}`}
                      aria-selected={selected}
                      aria-controls="pg-sample-panel"
                      tabIndex={selected ? 0 : -1}
                      onClick={() => setActiveId(exp.id)}
                      onKeyDown={onTabKeyDown}
                      className={`-mb-px inline-flex cursor-pointer items-center gap-2 whitespace-nowrap border-b-2 bg-transparent py-3.5 text-[15px] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
                        selected ? 'border-accent text-fg' : 'border-transparent text-muted hover:text-fg'
                      }`}
                    >
                      <Icon size={18} weight="fill" aria-hidden="true" className={selected ? 'text-accent' : ''} />
                      {exp.label}
                    </button>
                  )
                })}
              </div>
              <div className="flex items-center gap-1 pb-2">
                <button type="button" onClick={resetPlayground} className={CONTROL}>
                  <ArrowCounterClockwise size={18} weight="fill" aria-hidden="true" />
                  Reset
                </button>
                <button ref={openButtonRef} type="button" onClick={toggleMaximized} aria-pressed={maximized} aria-label="Maximize sample" className={CONTROL}>
                  <ArrowsOutSimple size={18} weight="fill" aria-hidden="true" />
                  <span className="hidden sm:inline">Maximize</span>
                </button>
              </div>
            </div>
            <p className="mt-5 mb-6 text-[15px] text-muted">{active.blurb}</p>
            <p className="sr-only" role="status" aria-live="polite">
              {announcement}
            </p>

            <div className={maximized ? 'fixed inset-0 z-[70] flex flex-col bg-canvas p-2 sm:p-4' : ''}>
              {maximized && (
                <div className="mb-2 flex items-center justify-between gap-3">
                  <p className="m-0 text-[14px] text-muted">{active.label}</p>
                  <button
                    ref={maximizeButtonRef}
                    type="button"
                    aria-pressed={maximized}
                    aria-label="Minimize sample"
                    onClick={toggleMaximized}
                    className={CONTROL}
                  >
                    <ArrowsInSimple size={18} weight="fill" aria-hidden="true" />
                    <span className="hidden sm:inline">Minimize</span>
                  </button>
                </div>
              )}
              <div
                ref={panelRef}
                id="pg-sample-panel"
                role="tabpanel"
                aria-labelledby={`pg-tab-${active.id}`}
                tabIndex={0}
                className={`bg-browser ring-1 ring-line rounded-[24px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
                  maximized ? 'min-h-0 flex-1 overflow-y-auto overscroll-contain' : 'overflow-hidden'
                }`}
              >
                <p className="sr-only">{active.challenge}</p>
                <Sample key={`${active.id}-${resetCount}`} />
              </div>
            </div>
          </section>

          <section aria-labelledby="pg-try-title" className="pt-[clamp(56px,8vw,96px)] pb-[clamp(72px,10vw,128px)]">
            <h2 id="pg-try-title" className="m-0 text-[22px] font-medium tracking-[-0.015em]">
              Things to try
            </h2>
            <ol className="grid mt-8 mb-0 p-0 list-none border-t border-line sm:grid-cols-3">
              {CHALLENGES.map(([title, body], index) => (
                <li key={title} className={`flex gap-4 py-7 sm:pr-8 ${index > 0 ? 'sm:pl-8 sm:border-l sm:border-line' : ''}`}>
                  <span aria-hidden="true" className="text-[16px] font-medium tabular-nums text-muted">
                    {index + 1}
                  </span>
                  <span>
                    <span className="block text-[16px] font-medium">{title}</span>
                    <span className="mt-1 block text-[14.5px] leading-[1.55] text-muted">{body}</span>
                  </span>
                </li>
              ))}
            </ol>
            <p className="mt-2 mb-0 text-[14px] text-muted">
              Reset puts the sample back as it was. It doesn’t clear your marks or recordings. All sample content is made up, and nothing is sent anywhere.
            </p>
          </section>

          <SiteFooter />
        </div>
      </main>

      {showMobileNotice && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 motion-safe:animate-pg-fade-in">
          <div className="absolute inset-0 bg-canvas/80 backdrop-blur-sm" aria-hidden="true" onClick={dismissMobileNotice} />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="pg-mobile-notice-title"
            aria-describedby="pg-mobile-notice-desc"
            className="relative max-h-[calc(100dvh-2rem)] w-full max-w-[430px] overflow-y-auto rounded-[24px] bg-panel p-6 text-fg"
          >
            <Monitor size={28} weight="fill" aria-hidden="true" className="text-accent" />
            <h2 id="pg-mobile-notice-title" className="mt-4 mb-0 text-[26px] font-medium tracking-[-0.02em] leading-[1.15]">
              Best on a desktop
            </h2>
            <p id="pg-mobile-notice-desc" className="mt-3 mb-0 text-[15px] leading-[1.65] text-body">
              The playground is for trying the Capann browser extension. You can browse the samples here, but drawing, pointing, and recording need the extension on a desktop browser.
            </p>
            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:items-center">
              <Link to="/" className="text-center text-[14px] text-muted underline decoration-fg/30 underline-offset-[5px] hover:text-fg sm:mr-auto">
                Back to the site
              </Link>
              <button
                ref={mobileNoticeButtonRef}
                type="button"
                onClick={dismissMobileNotice}
                className="inline-flex cursor-pointer items-center justify-center rounded-full bg-fg/[0.08] px-5 py-2.5 text-[14px] font-medium text-fg transition-colors hover:bg-fg/[0.14] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                Continue anyway
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
