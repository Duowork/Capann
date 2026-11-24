import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router'
import { List, X } from '@phosphor-icons/react'
import ThemeToggle from './ThemeToggle.jsx'

const BASE = import.meta.env.BASE_URL

const SECTIONS = [
  ['Features', 'features'],
  ['Premium', 'premium'],
  ['Pricing', 'pricing'],
  ['FAQ', 'faq'],
]

const PRIMARY =
  'inline-flex items-center justify-center rounded-full bg-draw text-ink font-medium whitespace-nowrap transition-colors hover:bg-draw-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent'

/** On the landing page a plain in-page link; elsewhere a route back to it. */
function SectionLink({ id, onLanding, onNavigate, className, children }) {
  return onLanding ? (
    <a href={`#${id}`} onClick={onNavigate} className={className}>
      {children}
    </a>
  ) : (
    <Link to={`/#${id}`} onClick={onNavigate} className={className}>
      {children}
    </Link>
  )
}

/**
 * The site's floating, rounded nav (landing, playground, privacy). It's
 * transparent at the top of the page and turns into a frosted pill once the
 * page scrolls. Section links stay on the landing page there and lead back to
 * it from the other pages, where LandingPage scrolls to the section on arrival.
 */
export default function SiteHeader() {
  const { pathname } = useLocation()
  const onLanding = pathname === '/'
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const headerRef = useRef(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!menuOpen) return undefined
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setMenuOpen(false)
    }
    const onPointerDown = (event) => {
      if (headerRef.current && !headerRef.current.contains(event.target)) setMenuOpen(false)
    }
    const desktop = window.matchMedia('(min-width: 768px)')
    const onDesktop = (event) => {
      if (event.matches) setMenuOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    document.addEventListener('pointerdown', onPointerDown)
    desktop.addEventListener('change', onDesktop)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      document.removeEventListener('pointerdown', onPointerDown)
      desktop.removeEventListener('change', onDesktop)
    }
  }, [menuOpen])

  const close = () => setMenuOpen(false)
  const linkProps = { onLanding, onNavigate: close }

  return (
    <header ref={headerRef} className="fixed top-0 inset-x-0 z-50 px-[clamp(12px,3vw,32px)] pt-3">
      <nav
        aria-label="Primary"
        className={`max-w-[1280px] mx-auto flex items-center gap-2 md:gap-7 px-3.5 md:px-7 py-3 rounded-[28px] border transition-all duration-morph ease-morph ${
          scrolled || menuOpen ? 'glass shadow-[var(--shadow-float)]' : 'bg-transparent border-transparent'
        }`}
      >
        <Link
          to="/"
          onClick={(event) => {
            close()
            if (onLanding) {
              event.preventDefault()
              window.scrollTo({ top: 0 })
            }
          }}
          className="flex items-center gap-2 md:gap-3 mr-auto rounded-full focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
        >
          <img src={`${BASE}svg/capann-icon-light.svg`} alt="" className="on-dark w-[26px] h-[26px] md:w-[30px] md:h-[30px]" />
            <img src={`${BASE}svg/capann-icon-dark.svg`} alt="" className="on-light w-[26px] h-[26px] md:w-[30px] md:h-[30px]" />
          <span className="font-display font-bold text-[23px] md:text-[29px] leading-none tracking-[0.03em]">
            CAPA<span className="text-accent">NN</span>
          </span>
          <span className="sr-only">Capann home</span>
        </Link>
        <div className="hidden md:flex items-center gap-7">
          {SECTIONS.map(([label, id]) => (
            <SectionLink key={id} id={id} {...linkProps} className="text-[13.5px] text-muted hover:text-fg transition-colors">
              {label}
            </SectionLink>
          ))}
          <Link
            to="/playground"
            aria-current={pathname === '/playground' ? 'page' : undefined}
            className={`text-[13.5px] transition-colors hover:text-fg ${pathname === '/playground' ? 'text-fg' : 'text-muted'}`}
          >
            Playground
          </Link>
        </div>
        <ThemeToggle className="-mr-1 md:-mr-3" />
        <SectionLink id="pricing" {...linkProps} className={`${PRIMARY} px-4 md:px-5 py-2 md:py-2.5 text-[13.5px]`}>
          Get Capann<span className="hidden sm:inline">&nbsp;free</span>
        </SectionLink>
        <button
          type="button"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          aria-controls="site-mobile-menu"
          onClick={() => setMenuOpen((open) => !open)}
          className="md:hidden inline-flex h-9 w-9 flex-none cursor-pointer items-center justify-center rounded-full bg-transparent text-fg transition-colors hover:bg-fg/[0.08]"
        >
          {menuOpen ? <X size={22} weight="fill" aria-hidden="true" /> : <List size={22} weight="fill" aria-hidden="true" />}
        </button>
      </nav>
      <div
        id="site-mobile-menu"
        aria-hidden={!menuOpen}
        inert={!menuOpen}
        className={`md:hidden max-w-[1280px] mx-auto grid overflow-hidden transition-[grid-template-rows,opacity] duration-morph ease-morph motion-reduce:transition-none ${
          menuOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className="min-h-0">
          <nav aria-label="Mobile" className="mt-2 rounded-[22px] glass p-2 shadow-[var(--shadow-float)]">
            {SECTIONS.map(([label, id]) => (
              <SectionLink
                key={id}
                id={id}
                {...linkProps}
                className="flex items-center rounded-2xl px-4 py-3 text-[14px] text-body transition-colors hover:bg-fg/5 hover:text-fg"
              >
                {label}
              </SectionLink>
            ))}
            <Link
              to="/playground"
              onClick={close}
              className="flex items-center rounded-2xl px-4 py-3 text-[14px] text-fg transition-colors hover:bg-fg/5"
            >
              Playground
            </Link>
          </nav>
        </div>
      </div>
    </header>
  )
}
