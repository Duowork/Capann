import { CheckCircle, CircleNotch, Info, WarningCircle } from '@phosphor-icons/react'
import SiteFooter from '../components/SiteFooter.jsx'
import SiteHeader from '../components/SiteHeader.jsx'
import { INSTALL_URL } from './config.js'

// Shared layout for the Capann Premium pages (/verify, /view-my-links,
// /upgraded), in the site's design approach (apps/website/AGENTS.md): the slim
// version of the site's nav, a plain Sora heading, the content straight on the
// page (no card), and the site footer. Plus small building blocks for status,
// notices and buttons.

const BASE = import.meta.env.BASE_URL

// Components from @capann/design (packages/design/capann.css).
export const PRIMARY_BUTTON = 'cp-button cp-button--primary'

export const SECONDARY_BUTTON = 'cp-button cp-button--secondary'

const CONTAINER = 'w-full max-w-[1280px] mx-auto px-[clamp(20px,5vw,56px)]'

export function PremiumLayout({ wide = false, children }) {
  return (
    <div className="min-h-screen flex flex-col bg-canvas text-fg font-sans">
      <SiteHeader minimal />
      <main className={`flex-1 ${CONTAINER} pt-[96px]`}>
        <div className={`pt-[clamp(40px,6vw,80px)] pb-[clamp(64px,9vw,120px)] ${wide ? 'max-w-[880px]' : 'max-w-[720px]'}`}>
          {children}
        </div>
      </main>
      <div className={CONTAINER}>
        <SiteFooter />
      </div>
    </div>
  )
}

/** The page's one heading: Sora, sentence case, one colour (like /privacy). */
export function PageHeading({ children }) {
  return (
    <h1 className="cp-title wrap-anywhere text-[clamp(40px,5.4vw,64px)]">
      {children}
    </h1>
  )
}

/** The sentence under the heading. */
export function Lead({ children }) {
  return <p className="cp-lead mt-6">{children}</p>
}

/** A finished state: a mint check above the heading. */
export function DoneMark() {
  return <CheckCircle size={44} weight="fill" aria-hidden="true" className="mb-6 text-rec-text" />
}

export function Spinner({ size = 18, className = '' }) {
  return <CircleNotch size={size} weight="bold" aria-hidden="true" className={`flex-none motion-safe:animate-spin ${className}`} />
}

/**
 * The page's one polite live region. Keep it mounted in the same place across
 * state changes so screen readers announce updates. `quiet` keeps the text for
 * assistive tech but hides it visually.
 */
export function StatusLine({ busy = false, quiet = false, children }) {
  if (quiet) {
    return (
      <p role="status" className="sr-only">
        {children}
      </p>
    )
  }
  return (
    <p role="status" className="flex items-center gap-2.5 min-h-[22px] mt-6 mb-0 text-[14px] leading-[1.5] text-body">
      {children &&
        (busy ? (
          <Spinner className="text-accent" />
        ) : (
          <span aria-hidden="true" className="cp-status-dot" />
        ))}
      {children}
    </p>
  )
}

// `cp-notice`: a soft fill per tone, no border.
const NOTICE_TONES = {
  error: { box: 'cp-notice--error', icon: 'text-error', Icon: WarningCircle },
  success: { box: 'cp-notice--success', icon: 'text-rec-text', Icon: CheckCircle },
  info: { box: '', icon: 'text-accent', Icon: Info },
}

export function Notice({ tone = 'info', role, title, actions, children }) {
  const { box, icon, Icon } = NOTICE_TONES[tone]
  return (
    <div role={role} className={`cp-notice mt-8 ${box}`}>
      <div className="flex gap-3.5">
        <Icon size={22} weight="fill" aria-hidden="true" className={`flex-none mt-px ${icon}`} />
        <div className="min-w-0 text-[15px] leading-[1.65]">
          {title && <p className={`m-0 font-medium ${tone === 'error' ? 'text-error' : 'text-fg'}`}>{title}</p>}
          {children && <div className={title ? 'mt-1' : ''}>{children}</div>}
        </div>
      </div>
      {actions && <div className="flex flex-wrap gap-3 mt-5 sm:pl-[36px]">{actions}</div>}
    </div>
  )
}

/** Opens the install page in a new tab so this tab stays put for "Check again". */
export function InstallLink({ className = PRIMARY_BUTTON }) {
  const href = INSTALL_URL || `${BASE}#pricing`
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
      Install Capann Premium
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  )
}
