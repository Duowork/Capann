import { Fragment, useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router'
import {
  Briefcase,
  Buildings,
  ChalkboardTeacher,
  CheckCircle,
  CursorClick,
  Headset,
  ImageSquare,
  Kanban,
  PencilSimple,
  Play,
  PlusCircle,
  Rocket,
  ShareNetwork,
  Timer,
  VideoCamera,
} from '@phosphor-icons/react'
import SiteFooter from '../components/SiteFooter.jsx'
import SiteHeader from '../components/SiteHeader.jsx'
import heroShot from '../assets/product/hero.webp'
import useFoundersShot from '../assets/product/use-founders.webp'
import useProductShot from '../assets/product/use-feedback.webp'
import useConsultantsShot from '../assets/product/use-consultants.webp'
import useEducatorsShot from '../assets/product/use-teach.webp'
import useSupportShot from '../assets/product/use-support.webp'
import useAgenciesShot from '../assets/product/use-agencies.webp'
import deckAnnotateShot from '../assets/product/deck-annotate.webp'
import deckAttentionShot from '../assets/product/deck-attention.webp'
import deckScreenshotShot from '../assets/product/deck-screenshot.webp'
import deckRecordShot from '../assets/product/deck-record.webp'
import playerShot from '../assets/product/player.webp'
import styledScreenshotShot from '../assets/product/styled-screenshot.webp'

// Design rules for this page live in .agents/skills/ai-slop-design and the
// "Landing page design approach" in apps/website/AGENTS.md: headings without
// labels above them, one colour per heading, real product shots, one set of
// cards (pricing), buttons only in the header, hero, and plans, Phosphor icons
// in the fill weight, and animation only where it explains something. Agreed
// exceptions: the mint halo on the deck's Premium card and the tilted
// illustrations in "Why go Premium?".

/** The page's column. The Premium panel is the one section that breaks out of it. */
const CONTAINER = 'max-w-[1280px] mx-auto px-[clamp(20px,5vw,56px)]'
const PANEL = 'mx-[clamp(8px,1.6vw,24px)] rounded-[clamp(28px,3.2vw,48px)]'
const SECTION_SPACE = 'pb-[clamp(96px,13vw,176px)]'
/** Anchor targets land under the floating header. */
const ANCHOR = 'scroll-mt-28'
const H2 = 'cp-heading'
// Components from @capann/design (packages/design/capann.css).
const BUTTON_PRIMARY = 'cp-button cp-button--primary'
const BUTTON_SECONDARY = 'cp-button cp-button--secondary'
const TEXT_LINK = 'cp-link'

// Premium pricing. Monthly must match the extension (`PREMIUM_PRICE_LABEL` in
// apps/extension/src/shared/features.ts). Pay-per-day is priced above the
// monthly rate (about $0.23 a day) so the subscription stays the discount;
// it is shown on the website only and can't be bought yet.
const MONTHLY_PRICE = 7
const DAY_PRICE = 0.5
const MAX_DAYS = 30
const DEFAULT_DAYS = 7

const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })
/** $3.50 / $15.00; with `{ cents: false }`, whole dollars drop the cents ($7). */
function formatUsd(amount, { cents = true } = {}) {
  return !cents && Number.isInteger(amount) ? `$${amount}` : usd.format(amount)
}
const MONTHLY_LABEL = formatUsd(MONTHLY_PRICE, { cents: false })

// Every image is the real extension on the playground's sample pages.
const USE_CASES = [
  {
    id: 'founders',
    tab: 'Founders',
    icon: Rocket,
    image: useFoundersShot,
    alt: 'Capann’s Record panel over a product dashboard, saying Link copied, with the recording’s link below it.',
    what: 'Record a product walkthrough once, and send the link to investors, early customers, and new hires.',
  },
  {
    id: 'product',
    tab: 'Product teams',
    icon: Kanban,
    image: useProductShot,
    alt: 'A checkout page in review: the payment preview boxed in red, a highlighted subtitle, and a comment asking whether the total can sit next to the Pay button.',
    what: 'Review a build together. Box what needs work and leave the comment right where it applies.',
  },
  {
    id: 'consultants',
    tab: 'Consultants',
    icon: Briefcase,
    image: useConsultantsShot,
    alt: 'A billing form under audit, with comments asking for clearer error copy and pointing out two buttons that both look primary.',
    what: 'Audit a client’s product on the page itself, then hand over marked-up screenshots instead of a slide deck.',
  },
  {
    id: 'educators',
    tab: 'Educators and trainers',
    icon: ChalkboardTeacher,
    image: useEducatorsShot,
    alt: 'A coffee lesson with the first step circled, a comment saying start with step 1, and the temperature highlighted.',
    what: 'Point at the step that matters, keep the room’s eyes on it with the spotlight, and record the lesson as you give it.',
  },
  {
    id: 'support',
    tab: 'Customer support',
    icon: Headset,
    image: useSupportShot,
    alt: 'A payment form with the Pay button circled in green and a comment telling the customer to enter the new card, then press Pay.',
    what: 'Show a customer exactly where to click, or record the fix once and send it to everyone who asks.',
  },
  {
    id: 'agencies',
    tab: 'Agencies',
    icon: Buildings,
    image: useAgenciesShot,
    alt: 'A client’s lesson page with client feedback: a comment on the long title, and the step buttons boxed with a request to make them clickable.',
    what: 'Collect client feedback on the live page, and send back styled screenshots and short recordings.',
  },
]

const FEATURE_GROUPS = [
  {
    tier: 'Free',
    title: 'Annotation',
    icon: PencilSimple,
    image: deckAnnotateShot,
    alt: 'Capann’s panel with the Text tool selected and its four fonts, next to a lesson title circled by hand with a note reading Key idea.',
    items: [
      ['Draw and write', 'Pencil, highlighter, arrows with four heads, boxes, circles, and text in four fonts.'],
      ['Comment in place', 'Comment bubbles that point at exactly what you mean.'],
      ['Tidy as you go', 'Select, move, resize, rotate, duplicate, erase, and undo.'],
      ['Marks that stay', 'Your marks survive tab switches and reloads until you clear them.'],
    ],
  },
  {
    tier: 'Free',
    title: 'Pointing',
    icon: CursorClick,
    image: deckAttentionShot,
    alt: 'The Spotlight tool dimming a dashboard except a soft circle around the approval rate.',
    items: [
      ['Laser, spotlight, and zoom lens', 'Guide the eye without blocking the page. Clicks still go through.'],
      ['Timer and screen mask', 'Keep to time, and black out the page when you want the room’s attention.'],
    ],
  },
  {
    tier: 'Free',
    title: 'Screenshots',
    icon: ImageSquare,
    image: deckScreenshotShot,
    alt: 'Capann’s screenshot editor showing a captured dashboard area with a circled metric, and Style, Copy, and Save buttons.',
    items: [
      ['The whole tab', 'Save what’s on screen as a PNG, with your marks on it.'],
      ['Just the part that matters', 'Select an area, mark it up on a frozen copy, then copy or save it.'],
    ],
  },
  {
    tier: 'Free',
    title: 'Recording',
    icon: VideoCamera,
    image: deckRecordShot,
    alt: 'Capann’s Record panel with switches for the camera bubble, microphone, tab audio, and drawing during the recording.',
    items: [
      ['Record the tab', 'With a camera bubble, your microphone, and the tab’s own audio.'],
      ['Draw while you record', 'Turn on Mark screen and your marks appear in the video. It saves to your device.'],
    ],
  },
  {
    tier: 'Premium',
    title: 'Sharing',
    icon: ShareNetwork,
    image: playerShot,
    width: 1520,
    height: 1040,
    alt: 'A shared recording playing in Capann’s player, opened from the Links tab.',
    items: [
      ['Links instead of files', 'Stop recording and the link is copied. Anyone can watch for seven days.'],
      ['Play back in one click', 'Every link you shared plays right from your list.'],
      ['Marks that scroll, styled screenshots', 'Marks follow the page, and screenshots get a background and frame.'],
    ],
  },
]

const FREE_FEATURES = [
  'Draw, highlight, write, and comment on any page',
  'Laser pointer, spotlight, and zoom lens',
  'Select, move, resize, and erase marks',
  'PNG and area screenshots',
  'Record the tab with camera, mic, and tab audio',
  'Recordings saved to your device',
  'Keyboard shortcuts',
]

const PREMIUM_FEATURES = [
  'Everything in Free',
  'Recordings as links, copied when you stop',
  'Anyone can watch, no account needed',
  'Play back any link in one click',
  'Links last seven days',
  'Marks that scroll with the page',
  'Styled screenshots',
]

// Global shortcuts (Chrome commands): one meaning normally, another while recording.
const SHORTCUTS = [
  { keys: ['Alt', 'Shift', 'S'], action: 'Open Capann', recording: 'Stop and save' },
  { keys: ['Alt', 'Shift', 'T'], action: 'Next tool', recording: 'Pause or resume' },
  { keys: ['Alt', 'Shift', 'C'], action: 'Clear the tab’s marks', recording: 'Discard the recording' },
  { keys: ['Esc'], action: 'Stop drawing, keep the marks', note: 'Cancels a comment or text you’re typing' },
]

// Shortcuts inside Capann's panel.
const PANEL_SHORTCUTS = [
  { keys: ['Mod', 'D'], action: 'Duplicate' },
  { keys: ['Delete'], action: 'Delete' },
  { keys: ['Enter'], action: 'Send a comment' },
  { keys: ['Shift', 'Enter'], action: 'New line' },
]

const IS_MAC =
  typeof navigator !== 'undefined' && /Mac|iPhone|iPad|iPod/.test(navigator.userAgentData?.platform || navigator.platform || '')
// Chrome maps the extension's Alt shortcuts to Option on a Mac.
const KEY_LABELS = IS_MAC
  ? { Alt: '⌥ Option', Shift: '⇧ Shift', Mod: '⌘ Cmd', Enter: '↩ Return', Delete: '⌫ Delete' }
  : { Mod: 'Ctrl' }

const FAQS = [
  ['Is Capann free?', 'Yes. Every annotation tool, the laser pointer, spotlight, and zoom lens, PNG and area screenshots, keyboard shortcuts, and recording the tab to your device are free.'],
  ['What does Premium add?', 'Links for your recordings that play back in one click, marks that scroll with the page, and styled screenshots. It costs $7 a month.'],
  ['Is Premium a subscription?', 'Premium monthly is a $7 subscription. Pay-per-day gives you the same Premium for 1 to 30 days at $0.50 a day, with no subscription. Annotating, screenshots, and recording stay free either way.'],
  ['Which is cheaper, monthly or Pay-per-day?', 'Up to 14 days, Pay-per-day costs the same or less. From 15 days, Premium monthly at $7 is cheaper: 30 days by the day is $15.00.'],
  ['How long do shared links last?', 'Seven days. Video files you save to your device never expire.'],
  ['Can other people watch a shared recording?', 'Yes. Anyone with the link can watch, without installing Capann or creating an account.'],
  ['Do my annotations scroll with the page?', 'With Premium they do: each mark stays on what it points at. On the free plan, marks stay fixed on the screen while the page moves underneath.'],
  ['Do my annotations change the web page?', 'No. They float above the page and disappear when you clear them.'],
  ['Will my annotations disappear if I switch tabs or refresh?', 'No. They stay on that tab through switches and reloads until you clear them, or press Alt+Shift+C.'],
  ['Which browsers does Capann work on?', 'Chromium browsers: Chrome, Edge, and Brave.'],
]

/** "Who it's for": one tab per audience, each with Capann on a matching sample page. */
function UseCases() {
  const [active, setActive] = useState(0)
  const tabsRef = useRef([])
  const current = USE_CASES[active]
  const Icon = current.icon

  function onKeyDown(event) {
    const keys = { ArrowRight: 1, ArrowLeft: -1 }
    if (!(event.key in keys) && event.key !== 'Home' && event.key !== 'End') return
    event.preventDefault()
    const next =
      event.key === 'Home'
        ? 0
        : event.key === 'End'
          ? USE_CASES.length - 1
          : (active + keys[event.key] + USE_CASES.length) % USE_CASES.length
    setActive(next)
    tabsRef.current[next]?.focus()
  }

  return (
    <section id="uses" aria-labelledby="uses-title" className={`${CONTAINER} ${SECTION_SPACE} ${ANCHOR}`}>
      <h2 id="uses-title" className={`${H2} max-w-[20ch]`}>
        For anyone who explains things on a screen
      </h2>
      {/* One row that scrolls sideways on small screens, so six tabs never wrap. */}
      <div className="mt-10 -mx-[clamp(20px,5vw,56px)] px-[clamp(20px,5vw,56px)] overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div role="tablist" aria-label="Who it’s for" onKeyDown={onKeyDown} className="flex min-w-max gap-x-7 border-b border-line">
          {USE_CASES.map((useCase, index) => {
            const TabIcon = useCase.icon
            const selected = index === active
            return (
              <button
                key={useCase.id}
                ref={(el) => (tabsRef.current[index] = el)}
                type="button"
                role="tab"
                id={`use-tab-${useCase.id}`}
                aria-selected={selected}
                aria-controls="use-panel"
                tabIndex={selected ? 0 : -1}
                onClick={() => setActive(index)}
                className={`-mb-px inline-flex items-center gap-2 whitespace-nowrap py-3.5 border-b-2 bg-transparent text-[15px] cursor-pointer transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
                  selected ? 'border-accent text-fg' : 'border-transparent text-muted hover:text-fg'
                }`}
              >
                <TabIcon size={18} weight="fill" aria-hidden="true" className={selected ? 'text-accent' : ''} />
                {useCase.tab}
              </button>
            )
          })}
        </div>
      </div>
      <div
        role="tabpanel"
        id="use-panel"
        aria-labelledby={`use-tab-${current.id}`}
        className="grid gap-10 mt-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,340px)] lg:items-center lg:gap-14"
      >
        {/* All of them load up front and cross-fade, so switching never flashes. */}
        <div className="grid">
          {USE_CASES.map((useCase, index) => (
            <img
              key={useCase.id}
              src={useCase.image}
              alt={index === active ? useCase.alt : ''}
              aria-hidden={index !== active}
              width={1600}
              height={885}
              loading="lazy"
              decoding="async"
              className={`col-start-1 row-start-1 w-full h-auto rounded-[18px] transition-opacity duration-200 motion-reduce:transition-none ${
                index === active ? 'opacity-100' : 'opacity-0'
              }`}
            />
          ))}
        </div>
        <div>
          <p className="m-0 flex items-center gap-3 text-[26px] font-medium tracking-[-0.015em]">
            <Icon size={26} weight="fill" aria-hidden="true" className="text-accent" />
            {current.tab}
          </p>
          <p className="mt-4 mb-0 text-[16px] leading-[1.65] text-body">{current.what}</p>
          <Link to="/playground" className={`${TEXT_LINK} inline-block mt-7 text-[15px]`}>
            Try it in the playground
          </Link>
        </div>
      </div>
    </section>
  )
}

/**
 * "What you get" as a deck: each card sticks a little lower than the last, so
 * scrolling slides the next one over it (styles: `.feature-card` in
 * index.css). This sets `--cover` on each card from the scroll position, which
 * shrinks and dims it as the next card covers it. `--deck-height` (the tallest
 * card) makes every card as tall as the tallest, so a card on top hides the
 * one under it completely.
 */
function FeatureStack({ groups }) {
  const listRef = useRef(null)

  useEffect(() => {
    const list = listRef.current
    if (!list) return undefined
    const cards = [...list.querySelectorAll(':scope > .feature-card')]
    let disposed = false
    let frame = 0
    const update = () => {
      frame = 0
      for (let i = 0; i < cards.length - 1; i += 1) {
        // The card's own (untransformed) height: scaling it must not feed back.
        const top = cards[i].getBoundingClientRect().top
        const covered = (top + cards[i].offsetHeight - cards[i + 1].getBoundingClientRect().top) / cards[i].offsetHeight
        cards[i].style.setProperty('--cover', Math.min(1, Math.max(0, covered)).toFixed(3))
      }
    }
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    let measureFrame = 0
    const measure = () => {
      measureFrame = 0
      list.style.removeProperty('--deck-height')
      const tallest = Math.max(...cards.map((card) => card.offsetHeight))
      list.style.setProperty('--deck-height', `${tallest}px`)
      update()
    }
    const remeasure = () => {
      if (!disposed && !measureFrame) measureFrame = requestAnimationFrame(measure)
    }
    measure()
    // Web fonts and lazy images change the heights once they load.
    document.fonts?.ready.then(remeasure)
    list.addEventListener('load', remeasure, true)
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', remeasure)
    return () => {
      disposed = true
      cancelAnimationFrame(frame)
      cancelAnimationFrame(measureFrame)
      list.removeEventListener('load', remeasure, true)
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', remeasure)
    }
  }, [])

  return (
    <div ref={listRef} className="flex flex-col gap-4">
      {groups.map((group, index) => {
        const premium = group.tier === 'Premium'
        const Icon = group.icon
        return (
        <article
          key={group.title}
          aria-labelledby={`feature-${index}`}
          style={{ '--stack-index': index }}
          className={`feature-card relative overflow-clip rounded-[28px] bg-panel p-[clamp(24px,3.4vw,48px)] ${premium ? 'premium-halo' : ''}`}
        >
          {premium && <div aria-hidden="true" className="premium-halo__ring" />}
          <div className="relative grid gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:items-center lg:gap-12">
            <div>
              <div className="flex items-center gap-3">
                <span aria-hidden="true" className="w-6 text-[24px] font-medium tabular-nums text-muted">
                  {index + 1}
                </span>
                <h3 id={`feature-${index}`} className="m-0 text-[24px] font-medium tracking-[-0.015em]">
                  {group.title}
                </h3>
                <Icon size={24} weight="fill" aria-hidden="true" className={premium ? 'text-rec-text' : 'text-accent'} />
                <span className={`ml-auto text-[13px] ${premium ? 'text-rec-text' : 'text-muted'}`}>{group.tier}</span>
              </div>
              <dl className="grid gap-5 mt-7 mb-0">
                {group.items.map(([term, detail]) => (
                  <div key={term}>
                    <dt className="text-[15px] font-medium">{term}</dt>
                    <dd className="m-0 mt-1 text-[14.5px] leading-[1.6] text-muted">{detail}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <img src={group.image} alt={group.alt} width={group.width ?? 1600} height={group.height ?? 885} loading="lazy" decoding="async" className="w-full h-auto rounded-[16px]" />
          </div>
          <div aria-hidden="true" className="feature-card__shade absolute inset-0 rounded-[28px] bg-canvas pointer-events-none" />
        </article>
        )
      })}
      {/* Room for the last card to stick too, so the whole deck rests for a moment. */}
      <div aria-hidden="true" className="feature-stack-end" />
    </div>
  )
}

/**
 * "Why go Premium?": a full-screen light panel (brand paper) with a plain
 * headline in the middle and Premium's benefits as tilted illustrations around
 * it from 1280px up (a grid under the headline below that). Three are drawn in
 * HTML; the styled screenshot is real (made with Capann's Screenshot tool).
 * The only motion is the scrolling vignette, because it shows the feature.
 */
function PremiumPanel() {
  return (
    <section
      id="premium"
      aria-labelledby="premium-title"
      className={`${PANEL} relative overflow-clip bg-inverse text-on-inverse ${ANCHOR} mb-[clamp(96px,13vw,176px)] xl:min-h-[max(100svh,880px)]`}
    >
      <div className="relative z-[1] flex flex-col items-center px-6 pt-[clamp(72px,10vw,112px)] pb-14 text-center xl:absolute xl:inset-0 xl:justify-center xl:p-0 xl:pointer-events-none">
        <div className="flex flex-col items-center max-w-[520px] xl:pointer-events-auto">
          <h2 id="premium-title" className="m-0 font-medium tracking-[-0.03em] leading-[1.02] text-balance text-[clamp(44px,5.6vw,80px)]">
            Why go Premium?
          </h2>
          <p className="mt-6 mb-0 text-[18px] leading-[1.6] text-on-inverse/70 text-balance">
            Annotating, screenshots, and recording are free. Premium is for when your work leaves your screen.
          </p>
          <p className="mt-6 mb-0 text-[16px]">
            {MONTHLY_LABEL} a month, or {formatUsd(DAY_PRICE)} a day.{' '}
            <a href="#pricing" className="underline decoration-on-inverse/30 underline-offset-[5px] hover:decoration-on-inverse transition-colors">
              See pricing
            </a>
          </p>
        </div>
      </div>

      <ul className="relative grid gap-7 m-0 px-5 pb-8 list-none sm:grid-cols-2 sm:gap-6 sm:px-8 sm:pb-10 lg:grid-cols-3 xl:static xl:p-0">
        <li
          className="float-card rounded-[28px] bg-ink text-paper p-5 shadow-[0_30px_60px_rgba(20,20,23,0.28)] xl:absolute xl:left-[4.5%] xl:top-[8%] xl:w-[clamp(236px,18vw,320px)]"
          style={{ '--tilt': '-7deg' }}
        >
          <div aria-hidden="true" className="relative aspect-video overflow-hidden rounded-[18px] bg-white/[0.08]">
            <div className="absolute left-4 top-4 h-2 w-1/2 rounded-full bg-white/15" />
            <div className="absolute left-4 top-8 h-2 w-1/3 rounded-full bg-white/10" />
            <div className="absolute right-4 bottom-4 h-10 w-16 rounded-xl border-2 border-hl" />
            <span className="absolute inset-0 m-auto grid h-14 w-14 place-items-center rounded-full bg-draw text-ink shadow-[0_10px_30px_rgba(167,139,250,0.5)]">
              <Play size={22} weight="fill" />
            </span>
          </div>
          <div aria-hidden="true" className="flex items-center gap-3 mt-4 text-[12px] text-white/55 tabular-nums">
            <span>0:42</span>
            <span className="flex-1 h-1 rounded-full bg-white/10">
              <span className="block h-full w-[32%] rounded-full bg-draw" />
            </span>
            <span>2:15</span>
          </div>
          <h3 className="mt-4 mb-1 text-[15.5px] font-medium">Play it back in one click</h3>
          <p className="m-0 text-[13.5px] leading-[1.55] text-white/55">Watch any shared recording right from your list of links.</p>
        </li>

        <li
          className="float-card rounded-[28px] bg-draw text-ink p-6 shadow-[0_30px_60px_rgba(167,139,250,0.4)] xl:absolute xl:right-[5%] xl:top-[10%] xl:w-[clamp(230px,17vw,300px)]"
          style={{ '--tilt': '6deg' }}
        >
          <div aria-hidden="true" className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-ink text-paper text-[13px] font-medium">
            <CheckCircle size={18} weight="fill" className="text-rec" />
            Link copied
          </div>
          <div aria-hidden="true" className="mt-4 px-3.5 py-2.5 rounded-xl bg-white/50 text-[12.5px] font-medium truncate">
            api.capann.duowork.tech/r/8f3c2a…
          </div>
          <div aria-hidden="true" className="inline-flex items-center gap-1.5 mt-3 px-2.5 py-1 rounded-full bg-ink/10 text-[12px] tabular-nums">
            <Timer size={13} weight="fill" />
            6d 23h left
          </div>
          <h3 className="mt-5 mb-1 text-[15.5px] font-medium">Share a link, not a file</h3>
          <p className="m-0 text-[13.5px] leading-[1.55] text-ink/70">Stop recording and the link is copied. Anyone can watch, no Capann or account needed.</p>
        </li>

        <li
          className="float-card rounded-[28px] bg-white p-3 pb-4 shadow-[0_30px_60px_rgba(20,20,23,0.18)] sm:col-span-2 lg:order-last lg:col-span-3 lg:w-full lg:max-w-[760px] lg:justify-self-center xl:absolute xl:left-[3%] xl:bottom-[6%] xl:max-w-none xl:w-[clamp(288px,24vw,460px)]"
          style={{ '--tilt': '4deg' }}
        >
          <img
            src={styledScreenshotShot}
            width={1600}
            height={897}
            loading="lazy"
            decoding="async"
            alt="A dashboard screenshot styled with Capann: a soft lilac background, padding, rounded corners, and a shadow, with a circled approval rate, an arrow, and a comment asking to make the Pay button stand out."
            className="block w-full h-auto rounded-[18px]"
          />
          <p className="flex items-center gap-2 mt-3 mb-0 px-2 text-[13px] text-ink/70">
            <ImageSquare size={16} weight="fill" aria-hidden="true" className="flex-none text-draw" />
            <span>
              <strong className="font-medium text-ink">Styled screenshots.</strong> Made with Capann’s own Screenshot tool.
            </span>
          </p>
        </li>

        <li
          className="float-card rounded-[28px] bg-white text-ink p-5 shadow-[0_30px_60px_rgba(20,20,23,0.18)] sm:col-span-2 lg:col-span-1 xl:absolute xl:right-[4%] xl:bottom-[8%] xl:w-[clamp(230px,17vw,300px)]"
          style={{ '--tilt': '-5deg' }}
        >
          <div aria-hidden="true" className="relative h-[150px] overflow-hidden rounded-[18px] border border-ink/10 bg-brand-paper">
            <div className="scroll-demo absolute inset-x-0 top-0 flex flex-col gap-2.5 p-4">
              <span className="h-2.5 w-3/4 rounded-full bg-ink/15" />
              <span className="h-2.5 w-1/2 rounded-full bg-ink/10" />
              <span className="relative mt-1 h-9 w-[70%] rounded-xl bg-ink/10">
                <span className="absolute -inset-x-3 -inset-y-2 rounded-[50%] border-[2.5px] border-draw" />
              </span>
              <span className="h-2.5 w-2/3 rounded-full bg-ink/10" />
              <span className="h-2.5 w-3/5 rounded-full bg-ink/10" />
              <span className="h-2.5 w-1/2 rounded-full bg-ink/10" />
              <span className="h-2.5 w-3/4 rounded-full bg-ink/10" />
              <span className="h-2.5 w-2/5 rounded-full bg-ink/10" />
            </div>
          </div>
          <h3 className="mt-4 mb-1 text-[15.5px] font-medium">Marks that scroll with the page</h3>
          <p className="m-0 text-[13.5px] leading-[1.55] text-ink/70">They stay on what they point at. On the free plan they stay put on screen.</p>
        </li>
      </ul>
    </section>
  )
}

const PLAN_CARD = 'cp-plan'

function CheckItem({ children }) {
  return (
    <li className="flex items-start gap-3 text-[15px] leading-[1.55] text-body">
      <CheckCircle size={18} weight="fill" aria-hidden="true" className="flex-none mt-[2px] text-accent" />
      <span>{children}</span>
    </li>
  )
}

function PlanHeading({ name, price, per }) {
  return (
    <>
      <h3 className="m-0 text-[18px] font-medium">{name}</h3>
      <p className="mt-5 mb-0 flex items-baseline gap-2">
        <span className="text-[44px] leading-none font-medium tracking-[-0.03em] tabular-nums">{price}</span>
        {per && <span className="text-[15px] text-muted">{per}</span>}
      </p>
    </>
  )
}

/**
 * Pay-per-day: Premium for 1–30 days at DAY_PRICE a day, priced so the
 * monthly subscription stays the discount. At 30 days the card asks whether
 * to subscribe instead. Website only for now: its buttons are placeholders,
 * like the rest of the pricing section's.
 */
function PayPerDayCard() {
  const [days, setDays] = useState(DEFAULT_DAYS)
  const total = days * DAY_PRICE
  const full = days === MAX_DAYS
  const monthlySaves = MAX_DAYS * DAY_PRICE - MONTHLY_PRICE
  const dayLabel = `${days} ${days === 1 ? 'day' : 'days'}`

  return (
    <div className={PLAN_CARD}>
      <PlanHeading name="Pay-per-day" price={formatUsd(total)} per={`for ${dayLabel}`} />
      <div className="flex items-baseline justify-between mt-8 mb-2">
        <label htmlFor="pay-per-day-days" className="text-[14px] font-medium">
          Days
        </label>
        <span aria-hidden="true" className="text-[14px] text-accent tabular-nums">{dayLabel}</span>
      </div>
      <input
        id="pay-per-day-days"
        type="range"
        min={1}
        max={MAX_DAYS}
        step={1}
        value={days}
        onChange={(event) => setDays(Number(event.target.value))}
        aria-valuetext={`${dayLabel}, ${formatUsd(total)}`}
        className="w-full h-6 accent-accent cursor-pointer rounded-full focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
      />
      <div aria-hidden="true" className="flex justify-between mt-1 text-[12px] text-muted tabular-nums">
        <span>1 day</span>
        <span>{MAX_DAYS} days</span>
      </div>
      <ul className="flex flex-col gap-3 mt-8 mb-0 p-0 list-none">
        <CheckItem>Everything in Premium, for the days you pay for</CheckItem>
        <CheckItem>{formatUsd(DAY_PRICE)} a day, 1 to {MAX_DAYS} days</CheckItem>
        <CheckItem>Pay once, no subscription</CheckItem>
      </ul>
      <div className="mt-auto pt-10">
        {full ? (
          <div role="group" aria-labelledby="pay-per-day-choice">
            <p id="pay-per-day-choice" className="m-0 text-[15px] leading-[1.6] text-body">
              <strong className="font-medium text-fg">{MAX_DAYS} days is {formatUsd(total)}.</strong> Premium monthly is {MONTHLY_LABEL}, {formatUsd(monthlySaves, { cents: false })} less for the same month. Subscribe instead?
            </p>
            <div className="flex flex-col gap-2.5 mt-5">
              <a href="#premium-plan" className={BUTTON_PRIMARY}>
                Subscribe for {MONTHLY_LABEL} a month
              </a>
              <a href="#pricing" className={BUTTON_SECONDARY}>
                Pay {formatUsd(total)} for {MAX_DAYS} days
              </a>
            </div>
          </div>
        ) : (
          <>
            <a href="#pricing" className={`${BUTTON_SECONDARY} w-full`}>
              Pay {formatUsd(total)} for {dayLabel}
            </a>
            <p className="mt-3 mb-0 text-center text-[13px] text-muted">
              {total > MONTHLY_PRICE ? `Premium monthly is cheaper: ${MONTHLY_LABEL} for the whole month.` : `Premium ends after ${dayLabel}.`}
            </p>
          </>
        )}
      </div>
      <p aria-live="polite" className="sr-only">
        {full ? `${MAX_DAYS} days is ${formatUsd(total)}. Premium monthly is ${MONTHLY_LABEL}. Subscribe, or pay for ${MAX_DAYS} days.` : ''}
      </p>
    </div>
  )
}

/** The page's one set of cards. */
function PricingSection() {
  return (
    <section id="pricing" aria-labelledby="pricing-title" className={`${CONTAINER} ${SECTION_SPACE} ${ANCHOR}`}>
      <h2 id="pricing-title" className={`${H2} text-center`}>
        Start free. Upgrade to share.
      </h2>
      <div className="grid gap-4 mt-14 md:grid-cols-2 xl:grid-cols-3">
        <div className={PLAN_CARD}>
          <PlanHeading name="Free" price="$0" />
          <ul className="flex flex-col gap-3 mt-8 mb-0 p-0 list-none">
            {FREE_FEATURES.map((feature) => (
              <CheckItem key={feature}>{feature}</CheckItem>
            ))}
          </ul>
          <div className="mt-auto pt-10">
            <a href="#pricing" className={`${BUTTON_SECONDARY} w-full`}>
              Get Capann free
            </a>
          </div>
        </div>
        <PayPerDayCard />
        <div id="premium-plan" tabIndex={-1} className={`${PLAN_CARD} cp-plan--featured outline-none scroll-mt-32 md:col-span-2 xl:col-span-1`}>
          <PlanHeading name="Premium" price={MONTHLY_LABEL} per="a month" />
          <ul className="flex flex-col gap-3 mt-8 mb-0 p-0 list-none">
            {PREMIUM_FEATURES.map((feature) => (
              <CheckItem key={feature}>{feature}</CheckItem>
            ))}
          </ul>
          <div className="mt-auto pt-10">
            <a href="#pricing" className={`${BUTTON_PRIMARY} w-full`}>
              Get Premium
            </a>
            <p className="mt-3 mb-0 text-center text-[13px] text-muted">Billed monthly.</p>
          </div>
        </div>
      </div>
    </section>
  )
}

/** One key combination as keycaps, labelled for this computer (Option on a Mac). */
function KeyCombo({ keys, small = false }) {
  return (
    <span className="inline-flex flex-wrap items-center gap-1.5">
      {keys.map((key, index) => (
        <Fragment key={key}>
          {index > 0 && (
            <span aria-hidden="true" className="text-[13px] text-muted">
              +
            </span>
          )}
          <kbd
            className={`cp-keycap ${
              small ? 'min-w-[28px] h-[28px] px-2 text-[12px]' : 'min-w-[40px] h-[40px] px-3 text-[14px]'
            }`}
          >
            {KEY_LABELS[key] ?? key}
          </kbd>
        </Fragment>
      ))}
    </span>
  )
}

function ShortcutsSection() {
  return (
    <section id="shortcuts" aria-labelledby="shortcuts-title" className={`${CONTAINER} ${SECTION_SPACE} ${ANCHOR}`}>
      <h2 id="shortcuts-title" className={H2}>
        Keyboard shortcuts
      </h2>
      <ul className="grid mt-12 mb-0 p-0 list-none border-t border-line sm:grid-cols-2 lg:grid-cols-4">
        {SHORTCUTS.map((shortcut, index) => (
          <li key={shortcut.action} className={`py-8 sm:pr-8 ${index > 0 ? 'lg:pl-8 lg:border-l lg:border-line' : ''}`}>
            <KeyCombo keys={shortcut.keys} />
            <h3 className="mt-6 mb-0 text-[16px] font-medium">{shortcut.action}</h3>
            <p className="mt-2 mb-0 text-[14px] leading-[1.55] text-muted">
              {shortcut.recording ? `While recording: ${shortcut.recording}` : shortcut.note}
            </p>
          </li>
        ))}
      </ul>
      <div className="flex flex-wrap items-center gap-x-10 gap-y-4 pt-8 border-t border-line">
        <h3 className="m-0 text-[14px] font-medium">In the panel</h3>
        {PANEL_SHORTCUTS.map((shortcut) => (
          <span key={shortcut.action} className="inline-flex items-center gap-3 text-[14px] text-muted">
            <KeyCombo keys={shortcut.keys} small />
            {shortcut.action}
          </span>
        ))}
      </div>
    </section>
  )
}

function FaqSection() {
  return (
    <section id="faq" aria-labelledby="faq-title" className={`${CONTAINER} ${SECTION_SPACE} ${ANCHOR}`}>
      <div className="grid gap-x-[clamp(24px,5vw,80px)] gap-y-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
        <div className="self-start lg:sticky lg:top-32">
          <h2 id="faq-title" className={H2}>
            Questions
          </h2>
          <Link to="/playground" className={`${TEXT_LINK} inline-block mt-6 text-[15px]`}>
            Or try every tool in the playground
          </Link>
        </div>
        <div className="border-b border-line">
          {FAQS.map(([question, answer]) => (
            <details key={question} className="group border-t border-line">
              <summary className="flex cursor-pointer list-none items-center gap-6 py-5 text-[16px] font-medium leading-[1.45] [&::-webkit-details-marker]:hidden focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent">
                <span className="mr-auto">{question}</span>
                <PlusCircle size={22} weight="fill" aria-hidden="true" className="flex-none text-muted transition-[transform,color] duration-morph ease-morph group-open:rotate-45 group-open:text-accent motion-reduce:transition-none" />
              </summary>
              <p className="mt-0 mb-6 text-[15px] leading-[1.65] text-muted max-w-[62ch]">{answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}

export default function LandingPage() {
  const { hash } = useLocation()
  // The hash this page mounted with (arriving from another page at /#section).
  const arrivalHash = useRef(hash)

  useEffect(() => {
    document.title = 'Capann: show, don’t tell'
  }, [])

  // The section only exists once this page has rendered, so scroll to it
  // here, once. In-page links after that are the browser's to handle.
  useEffect(() => {
    const target = arrivalHash.current
    if (!target) return undefined
    const frame = requestAnimationFrame(() => document.getElementById(target.slice(1))?.scrollIntoView())
    return () => cancelAnimationFrame(frame)
  }, [])

  return (
    <div className="min-h-screen bg-canvas text-fg font-sans">
      <SiteHeader />

      <main id="top" className="pt-[96px]">
        <section className={`${CONTAINER} pt-[clamp(56px,9vw,128px)]`}>
          <h1 className="cp-display">
            Show, don’t tell.
          </h1>
          <div className="flex flex-col gap-8 mt-8 lg:flex-row lg:items-end lg:justify-between">
            <p className="m-0 max-w-[46ch] text-[19px] leading-[1.55] text-body">
              Capann is a browser extension for drawing, pointing, and recording on the web page you’re showing. Free to use. Premium is {MONTHLY_LABEL} a month.
            </p>
            <div className="flex flex-wrap items-center gap-x-7 gap-y-4">
              <a href="#pricing" className={BUTTON_PRIMARY}>
                Get Capann free
              </a>
              <Link to="/playground" className={`${TEXT_LINK} text-[15px]`}>
                Try it in the playground
              </Link>
            </div>
          </div>
          <img
            src={heroShot}
            alt="Capann on a checkout page under review: its panel open on the Comment tool, the approval rate circled, an arrow to the Pay button, and a comment reading Up from 74%, ship it?"
            width={1600}
            height={885}
            fetchPriority="high"
            className="block w-full h-auto mt-[clamp(48px,7vw,88px)] rounded-[24px]"
          />
        </section>

        <section className={`${CONTAINER} py-[clamp(96px,13vw,176px)]`}>
          <p className="m-0 max-w-[30ch] text-[clamp(26px,3.2vw,40px)] leading-[1.28] font-medium tracking-[-0.02em] text-balance">
            A screenshot can’t point, and a paragraph can’t show. With Capann you circle the problem, point at the detail, and record the walkthrough on the page itself.
          </p>
        </section>

        <UseCases />

        <section id="features" aria-labelledby="features-title" className={`${CONTAINER} ${SECTION_SPACE} ${ANCHOR}`}>
          <h2 id="features-title" className={`${H2} max-w-[20ch] mb-12`}>
            Free to annotate and record. Premium to share.
          </h2>
          <FeatureStack groups={FEATURE_GROUPS} />
        </section>

        <PremiumPanel />
        <PricingSection />
        <ShortcutsSection />
        <FaqSection />

        <div className={CONTAINER}>
          <SiteFooter />
        </div>
      </main>
    </div>
  )
}
