import { Link } from 'react-router'

const YEAR = new Date().getFullYear()
const BASE = import.meta.env.BASE_URL

// Shared by the landing and privacy pages, inside their 1280px column.
const COLUMNS = [
  {
    title: 'Product',
    links: [
      ['Features', `${BASE}#features`],
      ['Premium', `${BASE}#premium`],
      ['Pricing', `${BASE}#pricing`],
      ['Playground', '/playground', 'route'],
    ],
  },
  {
    title: 'Help',
    links: [
      ['FAQ', `${BASE}#faq`],
      ['Privacy', '/privacy', 'route'],
    ],
  },
  {
    title: 'Duowork',
    links: [['duowork.tech', 'https://duowork.tech', 'external']],
  },
]

const LINK = 'text-[14px] text-muted hover:text-fg transition-colors'

export default function SiteFooter() {
  return (
    <footer className="border-t border-line text-[14px]">
      <div className="grid gap-12 py-16 md:grid-cols-[1fr_auto]">
        <Link to="/" aria-label="Capann home" className="flex items-center gap-2.5 self-start w-fit">
          <img src={`${BASE}svg/capann-icon-light.svg`} alt="" className="on-dark w-[26px] h-[26px]" />
          <img src={`${BASE}svg/capann-icon-dark.svg`} alt="" className="on-light w-[26px] h-[26px]" />
          <span className="font-display font-bold text-[25px] leading-none tracking-[0.03em]">
            CAPA<span className="text-accent">NN</span>
          </span>
        </Link>
        <nav aria-label="Footer" className="grid grid-cols-2 gap-x-16 gap-y-10 sm:grid-cols-3">
          {COLUMNS.map((column) => (
            <div key={column.title}>
              <h2 className="m-0 text-[13px] font-medium text-fg">{column.title}</h2>
              <ul className="flex flex-col gap-3 mt-4 mb-0 p-0 list-none">
                {column.links.map(([label, href, kind]) => (
                  <li key={label}>
                    {kind === 'route' ? (
                      <Link to={href} className={LINK}>
                        {label}
                      </Link>
                    ) : (
                      <a href={href} className={LINK} {...(kind === 'external' ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
                        {label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </div>
      <div className="flex flex-wrap justify-between gap-x-8 gap-y-2 pb-12 text-[13px] text-muted">
        <span>© {YEAR} Capann</span>
        <span>Built by Duowork</span>
      </div>
    </footer>
  )
}
