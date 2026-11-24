import { useEffect, useState } from 'react'
import SiteFooter from '../components/SiteFooter.jsx'
import SiteHeader from '../components/SiteHeader.jsx'

// /privacy: the policy text is the owner's and stays word for word. Layout
// follows the site's design approach (apps/website/AGENTS.md).

const SECTIONS = [
  ['information-we-handle', 'Information we handle'],
  ['how-we-use-information', 'How we use information'],
  ['data-processing-storage-transmission', 'Data processing, storage, and transmission'],
  ['third-party-service-providers-and-analytics', 'Third-party service providers and analytics'],
  ['browser-permissions', 'Browser permissions'],
  ['retention-and-deletion', 'Data retention and deletion'],
  ['security', 'Security'],
  ['childrens-privacy', 'Children’s privacy'],
  ['changes', 'Changes to this policy'],
  ['contact', 'Contact us'],
]
const TITLES = Object.fromEntries(SECTIONS)

function Paragraph({ children }) {
  return <p className="mt-4 mb-0 text-[15.5px] leading-[1.8] text-body max-w-[70ch]">{children}</p>
}

function SubHeading({ children }) {
  return <h3 className="mt-8 mb-0 first:mt-6 text-[16px] font-medium leading-[1.5] text-fg">{children}</h3>
}

function Bullets({ items }) {
  return (
    <ul className="flex flex-col gap-2.5 mt-4 mb-0 p-0 list-none max-w-[70ch]">
      {items.map(([lead, text], index) => (
        <li key={index} className="relative pl-5 text-[15.5px] leading-[1.75] text-body before:content-[''] before:absolute before:left-0 before:top-[0.72em] before:w-1 before:h-1 before:rounded-full before:bg-muted">
          {lead && <strong className="font-medium text-fg">{lead} </strong>}
          {text}
        </li>
      ))}
    </ul>
  )
}

function Section({ id, children }) {
  return (
    <section id={id} aria-labelledby={`${id}-heading`} className="scroll-mt-28 border-t border-line pt-12 mt-12 first:border-t-0 first:pt-0 first:mt-0">
      <h2 id={`${id}-heading`} className="m-0 text-[clamp(24px,2.6vw,30px)] font-medium tracking-[-0.02em] leading-[1.2]">
        {TITLES[id]}
      </h2>
      <div className="mt-2">{children}</div>
    </section>
  )
}

/** The section being read: the last one whose heading has passed under the header. */
function useActiveSection() {
  const [active, setActive] = useState(SECTIONS[0][0])
  useEffect(() => {
    let frame = 0
    const update = () => {
      frame = 0
      let current = SECTIONS[0][0]
      for (const [id] of SECTIONS) {
        const el = document.getElementById(id)
        if (el && el.getBoundingClientRect().top <= 160) current = id
      }
      // At the very bottom, the last section is the one being read.
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) current = SECTIONS.at(-1)[0]
      setActive(current)
    }
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
    }
  }, [])
  return active
}

export default function PrivacyPage() {
  const active = useActiveSection()

  useEffect(() => {
    document.title = 'Capann privacy policy'
  }, [])

  return (
    <div className="min-h-screen bg-canvas text-fg font-sans">
      <SiteHeader />

      <main className="max-w-[1280px] mx-auto px-[clamp(20px,5vw,56px)] pt-[96px]">
        <div className="max-w-[72ch] pt-[clamp(40px,6vw,80px)] pb-[clamp(48px,7vw,88px)]">
          <h1 className="cp-title">Privacy policy</h1>
          <p className="mt-6 mb-0 text-[17px] leading-[1.66] text-body max-w-[62ch]">
            Capann is a browser extension developed by Duowork that helps people communicate visually on webpages through drawing, pointing, highlighting, screenshots, and screen recordings.
          </p>
          <p className="mt-4 mb-0 text-[17px] leading-[1.66] text-body max-w-[62ch]">
            This Privacy Policy explains what information Capann processes, how it is used and stored, when it is shared, and how users can exercise control over their information.
          </p>
          <p className="mt-8 mb-0 text-[14px] text-muted">
            Effective <time dateTime="2026-10-28">October 28, 2026</time> · Updated <time dateTime="2026-10-28">October 28, 2026</time>
          </p>
        </div>

        <div className="grid gap-y-10 pb-[clamp(72px,10vw,128px)] border-t border-line pt-12 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-x-16">
          <aside className="hidden lg:block">
            <nav aria-label="On this page" className="sticky top-28">
              <h2 className="m-0 mb-3 text-[14px] font-medium text-fg">On this page</h2>
              <ol className="flex flex-col m-0 p-0 list-none border-l border-line">
                {SECTIONS.map(([id, label]) => {
                  const current = id === active
                  return (
                    <li key={id}>
                      <a
                        href={`#${id}`}
                        aria-current={current ? 'location' : undefined}
                        className={`-ml-px block border-l-2 py-1.5 pl-4 text-[14px] leading-[1.45] transition-colors ${
                          current ? 'border-accent text-fg' : 'border-transparent text-muted hover:text-fg'
                        }`}
                      >
                        {label}
                      </a>
                    </li>
                  )
                })}
              </ol>
            </nav>
          </aside>

          <div className="max-w-[76ch]">
            <Section id="information-we-handle">
              <SubHeading>Webpage content</SubHeading>
              <Paragraph>
                When you activate Capann on a webpage, the extension accesses the active tab as necessary to provide annotation and capture features you initiate.
              </Paragraph>

              <SubHeading>Annotations and feedback</SubHeading>
              <Paragraph>
                Capann processes drawings, highlights, pointers, and explanatory annotations you create to provide its visual communication features. Your annotations may contain information visible on the webpage you choose to mark up.
              </Paragraph>

              <SubHeading>Screenshots and recordings</SubHeading>
              <Paragraph>
                When you initiate a screenshot or recording, Capann processes the captured content in your browser. Depending on the feature used, recordings may include browser-tab content, camera video, and audio.
              </Paragraph>
              <Paragraph>
                Captured content may contain personal or confidential information visible or audible during the session. You should review sensitive content before sharing it.
              </Paragraph>

              <SubHeading>Shared content</SubHeading>
              <Paragraph>
                If you choose to generate a shareable link, the associated content is transmitted to Capann’s sharing service and stored using Cloudflare R2 so that it can be accessed through the link.
              </Paragraph>
              <Paragraph>
                Capann intends to make shared content available for seven days. Automatic deletion after that period is planned but not yet implemented, so shared content may remain accessible through its link until the retention mechanism is in place.
              </Paragraph>
              <Paragraph>
                Anyone with access to a shareable link may be able to view its associated content. Do not share sensitive information unless you are comfortable with the people who may access it.
              </Paragraph>

              <SubHeading>Extension settings</SubHeading>
              <Paragraph>
                Capann may store settings and other limited information necessary to maintain extension preferences and feature functionality.
              </Paragraph>

              <SubHeading>Account and purchase information</SubHeading>
              <Paragraph>
                As account and paid-feature functionality is introduced, Capann may process information such as your name, email address, purchase reference, transaction status, and subscription or entitlement details, where applicable.
              </Paragraph>
              <Paragraph>
                Payments are handled by Bachs Technologies Limited. Payment information is processed as necessary to complete transactions and verify purchases. Capann does not require payment card details for its annotation features.
              </Paragraph>
            </Section>

            <Section id="how-we-use-information">
              <Paragraph>Capann uses information to:</Paragraph>
              <Bullets
                items={[
                  [null, 'Provide drawing, highlighting, pointing, and annotation tools.'],
                  [null, 'Capture screenshots and recordings when you initiate those actions.'],
                  [null, 'Generate and deliver shareable links when you request them.'],
                  [null, 'Store shared content so it can be accessed through shareable links.'],
                  [null, 'Verify purchases and provide access to paid features.'],
                  [null, 'Maintain extension settings and essential functionality.'],
                  [null, 'Protect the service and investigate technical or security issues where necessary.'],
                ]}
              />
              <Paragraph>
                Capann does not use webpage content, screenshots, recordings, or annotations for unrelated purposes.
              </Paragraph>
            </Section>

            <Section id="data-processing-storage-transmission">
              <Paragraph>
                Capann processes annotations and captures in the browser when users use those features.
              </Paragraph>
              <Paragraph>
                When users choose to create a shareable link, the selected content is uploaded to Capann’s sharing service and stored using Cloudflare R2. The uploaded content may contain webpage information, annotations, screenshots, screen recordings, camera video, or audio, depending on what the user chooses to capture.
              </Paragraph>
              <Paragraph>
                Shared content is accessible to people who obtain the corresponding shareable link. Users should avoid sharing sensitive information unless they are comfortable with the potential recipients accessing it.
              </Paragraph>
              <Paragraph>
                Capann intends to implement automatic deletion of shared content after seven days. Until this functionality is implemented and verified, users should not rely on seven-day deletion as a guaranteed retention limit. The availability of shared content and its deletion will depend on the sharing service’s implemented retention controls.
              </Paragraph>
              <Paragraph>
                Files downloaded to a user’s device are separate from cloud-hosted copies and are not automatically deleted when a shareable link expires.
              </Paragraph>
            </Section>

            <Section id="third-party-service-providers-and-analytics">
              <Paragraph>
                Duowork does not sell users’ personal information.
              </Paragraph>
              <Paragraph>
                Capann does not currently use analytics services to track users’ activity.
              </Paragraph>
              <Paragraph>
                Capann uses Cloudflare R2 to store content users choose to share through generated links. Consequently, selected screenshots and recordings are transmitted to Cloudflare’s storage infrastructure for this purpose.
              </Paragraph>
              <Paragraph>
                Payment processing is handled by Bachs Technologies Limited where applicable. Information necessary to process or verify purchases may be shared with that provider.
              </Paragraph>
              <Paragraph>
                These service providers may process information as necessary to deliver their respective services. Their handling of information is subject to their applicable terms and privacy policies.
              </Paragraph>
              <Paragraph>
                Information may also be disclosed where necessary to comply with applicable legal obligations or respond to valid legal requests.
              </Paragraph>
            </Section>

            <Section id="browser-permissions">
              <Paragraph>
                Capann requests permissions necessary to provide its functionality. Depending on the installed version, these may include:
              </Paragraph>
              <Bullets
                items={[
                  ['Active tab access:', 'to annotate or capture the webpage you choose.'],
                  ['Storage:', 'to maintain necessary settings or extension state.'],
                  ['Downloads:', 'to save screenshots, recordings, or other files you request.'],
                  ['Tab capture:', 'to capture browser-tab content for recording or related features.'],
                  ['Camera and microphone access:', 'where recording functionality uses camera or audio input and the relevant permissions have been granted.'],
                  ['Audio capture:', 'to include audio in a user-initiated recording when audio capture is supported and enabled.'],
                ]}
              />
              <Paragraph>
                Capann uses these capabilities to provide its stated features. Recording and capture actions are initiated by the user.
              </Paragraph>
              <Paragraph>
                Capann captures audio as part of a user-initiated recording when audio capture is supported and enabled. This allows users to explain their walkthroughs verbally and create more useful visual demonstrations. Audio capture is limited to the recording functionality and is not used for unrelated monitoring.
              </Paragraph>
            </Section>

            <Section id="retention-and-deletion">
              <Paragraph>
                Capann intends to implement automatic deletion of shared content after seven days. Until that mechanism is implemented and verified, shared content may remain accessible through its shareable link, and users should not rely on seven-day deletion as a guaranteed retention limit.
              </Paragraph>
              <Paragraph>
                Users may also delete shared content earlier where the extension provides that capability.
              </Paragraph>
              <Paragraph>
                Files downloaded to your device are not automatically deleted when a shareable link expires. Copies saved or downloaded by recipients may also remain outside Capann’s control.
              </Paragraph>
              <Paragraph>
                Account and purchase records, when implemented, may be retained for as long as necessary to provide the service, verify transactions, address disputes, comply with legal obligations, or meet legitimate recordkeeping requirements.
              </Paragraph>
              <Paragraph>
                This policy will be updated when the seven-day retention mechanism is implemented, to describe the retention period and what happens to expired content.
              </Paragraph>
              <Paragraph>
                For privacy questions or requests concerning information handled by Duowork, contact the address provided below.
              </Paragraph>
            </Section>

            <Section id="security">
              <Paragraph>
                Duowork takes reasonable measures to protect information handled by Capann against unauthorized access, disclosure, alteration, or destruction.
              </Paragraph>
              <Paragraph>
                No software, storage system, or transmission method can be guaranteed to be completely secure.
              </Paragraph>
              <Paragraph>
                Users should avoid sharing confidential information through links unless they understand who may access the content.
              </Paragraph>
            </Section>

            <Section id="childrens-privacy">
              <Paragraph>
                Capann is a general-purpose productivity tool and is not specifically designed to collect personal information from children.
              </Paragraph>
              <Paragraph>
                If you believe a child has provided personal information to Duowork through a service associated with Capann, contact us so the matter can be reviewed.
              </Paragraph>
            </Section>

            <Section id="changes">
              <Paragraph>
                This Privacy Policy may be updated when Capann’s features, data practices, or legal obligations change.
              </Paragraph>
              <Paragraph>
                The latest version will be published at this URL, with the effective or updated date shown at the top.
              </Paragraph>
            </Section>

            <Section id="contact">
              <Paragraph>
                For privacy questions, requests, or concerns about Capann, contact:
              </Paragraph>
              <dl className="grid gap-4 sm:grid-cols-[auto_minmax(0,1fr)] sm:gap-x-8 sm:gap-y-4 mt-6 mb-0 p-6 rounded-3xl bg-panel border border-line text-[15px]">
                <dt className="text-muted">Developer</dt>
                <dd className="m-0 text-fg font-medium sm:mt-0">Duowork</dd>
                <dt className="text-muted">Website</dt>
                <dd className="m-0">
                  <a href="https://duowork.tech" className="text-accent hover:text-fg transition-colors">duowork.tech</a>
                </dd>
                <dt className="text-muted">Privacy contact</dt>
                <dd className="m-0">
                  <a href="mailto:reach@duowork.tech" className="text-accent hover:text-fg transition-colors">reach@duowork.tech</a>
                </dd>
              </dl>
            </Section>

            <div className="mt-14 pt-8 border-t border-line">
              <p className="m-0 text-[15px] text-muted">
                Questions about how Capann handles your information?{' '}
                <a href="mailto:reach@duowork.tech" className="text-fg underline decoration-fg/30 underline-offset-[5px] hover:decoration-fg transition-colors">
                  Email reach@duowork.tech
                </a>
              </p>
            </div>
          </div>
        </div>

        <SiteFooter />
      </main>
    </div>
  )
}
