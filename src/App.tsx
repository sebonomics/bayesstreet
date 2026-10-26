import type React from 'react'
import { useEffect, useRef, useState } from 'react'
import './App.css'

type PageId = 'home' | 'strategy' | 'research' | 'company'

// The Monthly Returns / fund-facts sections this once gated no longer exist in this file;
// all that remains behind the flag are the nav and footer links that pointed at them.
const SHOW_FULL_SITE = false

const pillars: Array<[string, string]> = [
  ['For Founders.', 'Dedicated public-market capital management for founders focused on building their companies.'],
  ['For Early-Stage Investors.', 'Public-market investing for early-stage investors focused on finding and supporting emerging companies.'],
]
const strategy: Array<[string, string]> = [
  ['A Dedicated Mandate.', 'Formenos manages public-market capital for the founders and investors in Silicon Valley.'],
  ['A Long-Term Relationship.', 'The firm is focused on investment performance and its responsibilities to the investors who entrust it with capital.'],
]
const trackRecord: Array<[string, string]> = [
  ['Backed by the People Behind the Tools.', 'We raised our last round from the first investors in Cursor, Cognition, Etched, and Aaru, along with angels from DoorDash and Palantir.'],
  ['Serving Founders and Investors.', 'Silicon Valley’s hedge fund: a dedicated public-market investment partner for founders and investors.'],
]

// [name, logo file, optical scale] — logo is optional; cells fall back to the wordmark
// as text. Scale trims wordmark-only logos, which otherwise read far larger than logos
// whose height is mostly icon.
const investors: Array<[string, string | null, number?]> = [
  ['Cursor', '/logos/cursor.png'],
  ['Cognition', '/logos/cognition.png'],
  ['Etched', '/logos/etched.png', 0.78],
  ['DoorDash', '/logos/doordash.png', 0.64],
  ['Palantir', '/logos/palantir.svg', 0.82],
  ['Aaru', '/logos/aaru.png', 0.82],
]

const CONTACT_EMAIL = 'sebastian@formenos.ai'

const navLinks = [
  { label: 'Fund', href: '#overview' },
  { label: 'Approach', href: '#/research' },
  { label: 'Investors', href: '#/strategy' },
  { label: 'Firm', href: '#/company' },
]

const footerColumns = SHOW_FULL_SITE
  ? [
      {
        heading: 'Fund',
        links: [
          ['Overview', '#overview'],
          ['Monthly Returns', '#monthly-returns'],
        ],
      },
    ]
  : []

// no destinations for these yet — rendered as plain text, not links
const footerBottomLinks = ['Terms', 'Privacy', 'Disclosures']

const detailPages = {
  "research": {
    "heroTitle": "A Dedicated Focus on Public Markets.|An Independent Investment Perspective.",
    "heroSubtitle": "An AI-native hedge fund serving founders and early-stage investors.|Focused on managing public-market capital over the long term.",
    "title": "A Clear Investment Mandate.|A Dedicated Public-Market Focus.",
    "image": "03-observatory",
    "rows": [
      [
        "Public Markets.",
        "Formenos manages capital in public equities for founders and investors whose principal commitments lie elsewhere."
      ],
      [
        "Independent Perspective.",
        "The firm brings a distinct investment perspective to the public-market portion of its investors’ capital."
      ]
    ],
    "secondTitle": "A Long-Term Orientation.|A Focus on Investment Outcomes.",
    "secondImage": "12-library",
    "secondRows": [
      [
        "Investment Performance.",
        "The objective is strong investment performance over time, with careful attention to the responsibilities of managing outside capital."
      ],
      [
        "A Long-Term Relationship.",
        "Formenos serves as a public-market investment partner for founders and early-stage investors."
      ]
    ]
  },
  "strategy": {
    "heroTitle": "Public-Market Investing.|For Founders and Early-Stage Investors.",
    "heroSubtitle": "Building companies and backing founders demand sustained attention.|Formenos provides dedicated management of public-market capital.",
    "title": "Building Companies Takes Focus.|Public Markets Require It, Too.",
    "image": "01-confluence",
    "rows": [
      [
        "Founders.",
        "Company building requires sustained attention to teams, products, and customers. Formenos provides a dedicated public-market investment relationship alongside those commitments."
      ],
      [
        "Early-Stage Investors.",
        "Sourcing investments and supporting founders are substantial commitments. Formenos focuses on public equities for investors whose expertise and attention are concentrated in private markets."
      ]
    ],
    "secondTitle": "A Dedicated Investment Firm.|A Distinct Role Within a Portfolio.",
    "secondImage": "20-foundation",
    "secondRows": [
      [
        "Public-Market Capital.",
        "Company ownership and early-stage investments have their own demands. Formenos manages public-market capital as a separate investment responsibility."
      ],
      [
        "Investor Inquiries.",
        "Information about the fund and investor materials is available by contacting the firm."
      ]
    ]
  },
  "company": {
    "heroTitle": "Silicon Valley’s Hedge Fund.|For Founders and Investors.",
    "heroSubtitle": "An investment firm serving Silicon Valley’s founders and investors.|Dedicated to managing capital in public markets.",
    "title": "Built Within Silicon Valley.|Focused on Public Markets.",
    "image": "monument-exterior",
    "rows": [
      [
        "A Specific Community.",
        "Founders and early-stage investors devote their attention to building and backing companies. Formenos was built to serve the public-market investment needs of that community."
      ],
      [
        "A Dedicated Investment Partner.",
        "The firm provides a home for public-market capital alongside the businesses and private investments that occupy its investors’ time."
      ]
    ],
    "secondTitle": "Based in Silicon Valley.|Serving Its Founders and Investors.",
    "secondImage": "13-island",
    "secondRows": [
      [
        "Our Backing.",
        "Formenos is backed by the first investors in Cursor, Cognition, Etched, and Aaru, along with angels from DoorDash and Palantir."
      ],
      [
        "Our Purpose.",
        "A dedicated public-market investment firm for Silicon Valley, with a long-term commitment to its investors."
      ]
    ]
  }
}

function getPageFromHash(): PageId {
  const route = window.location.hash.replace('#/', '').replace(/^#/, '').replace(/-approach$/, '')
  return route === 'research' || route === 'strategy' || route === 'company' ? route : 'home'
}

function TitleLines({text}: {text:string}) {
  return <>{text.split('|').map(line=><span key={line}>{line}{' '}</span>)}</>
}

const mobileSectionTitles: Record<string, string> = {
  'Built for Silicon Valley.|Focused on Public Markets.': 'Built for Silicon Valley.|Focused on Public Markets.',
  'Backed by the First Investors in|Cursor, Cognition, Etched, and Aaru.': 'Our Investors.|Our Backing.',
  'A Dedicated Investment Firm.|A Long-Term Commitment.': 'A Dedicated Firm.|A Long-Term Commitment.',
  'A Clear Investment Mandate.|A Dedicated Public-Market Focus.': 'A Clear Mandate.|A Public-Market Focus.',
  'Technology at the Foundation.|Responsibility at the Center.': 'Built on Technology.|Grounded in Responsibility.',
  'A Long-Term Orientation.|A Focus on Investment Outcomes.': 'A Long-Term Perspective.|A Focus on Performance.',
  'Building Companies Takes Focus.|Public Markets Require It, Too.': 'Building Companies.|Managing Public Capital.',
  'A Separate Investment Focus.|A Complementary Relationship.': 'A Separate Focus.|A Complementary Role.',
  'A Dedicated Investment Firm.|A Distinct Role Within a Portfolio.': 'A Dedicated Firm.|A Distinct Portfolio Role.',
  'Built Within Silicon Valley.|Focused on Public Markets.': 'Built in Silicon Valley.|Focused on Public Markets.',
  'Founders and Early-Stage Investors.|A Dedicated Investment Firm.': 'Founders and Investors.|A Dedicated Firm.',
  'Based in Silicon Valley.|Serving Its Founders and Investors.': 'Based in Silicon Valley.|Serving Founders and Investors.',
}

function SectionTitle({ text }: { text: string }) {
  return <h2 className="two-line-title">
    <span className="section-title-desktop"><TitleLines text={text} /></span>
    <span className="section-title-mobile"><TitleLines text={mobileSectionTitles[text] ?? text} /></span>
  </h2>
}

function PageArtwork({name}: {name:string}) {
  return <div className="panel-visual page-artwork"><img src={`/images/riften/${name}.jpg`} alt={`${name.replace(/^\d+-/, '').replace(/-/g, ' ')} architectural artwork`} width="1672" height="941" loading="lazy" /></div>
}

const processCopy = {
  "research": {
    "title": "Technology at the Foundation.|Responsibility at the Center.",
    "rows": [
      [
        "An AI-Native Firm.",
        "Technology is part of the firm’s foundation. Formenos combines that orientation with the responsibilities of managing investor capital."
      ],
      [
        "Investment Judgment.",
        "The firm remains accountable for its investment decisions and the capital entrusted to it."
      ]
    ]
  },
  "strategy": {
    "title": "A Separate Investment Focus.|A Complementary Relationship.",
    "rows": [
      [
        "Dedicated Attention.",
        "Public-market investing requires ongoing attention. Formenos takes on that work for the capital invested with the fund."
      ],
      [
        "Clear Responsibilities.",
        "Founders and investors remain focused on their businesses and private investments. Formenos is responsible for managing the capital entrusted to the firm."
      ]
    ]
  },
  "company": {
    "title": "Founders and Early-Stage Investors.|A Dedicated Investment Firm.",
    "rows": [
      [
        "Founders and Operators.",
        "Company leadership involves hiring, product development, and serving customers. Formenos provides a public-market investment partner alongside those responsibilities."
      ],
      [
        "Investors and Backers.",
        "Early-stage investors spend their time identifying and supporting emerging companies. The firm serves their public-market investment needs."
      ]
    ]
  }
}

const mobileHeroTitles = {
  research: 'An Independent Approach|to Public Markets.',
  strategy: 'Public-Market Investing|for Founders and Investors.',
  company: 'Silicon Valley’s|Hedge Fund.',
}

const mobileHeroSubtitles = {
  research: 'An AI-native hedge fund focused on public markets.',
  strategy: 'Public-market investing for founders and early-stage investors.',
  company: 'A public-market investment firm serving Silicon Valley.',
}

function DetailPage({ page }: { page: Exclude<PageId, 'home'> }) {
  const content = detailPages[page]
  const process = processCopy[page]
  return <>
    <section className="section hero page-hero">
      <h1><span className="hero-title-desktop"><TitleLines text={content.heroTitle} /></span><span className="hero-title-mobile"><TitleLines text={mobileHeroTitles[page]} /></span></h1>
      <p className="hero-sub">
        <span className="hero-subtitle-desktop"><TitleLines text={content.heroSubtitle} /></span>
        <span className="hero-subtitle-mobile">{mobileHeroSubtitles[page]}</span>
      </p>
      <div className="hero-actions"><a className="button button-dark" href={`mailto:${CONTACT_EMAIL}`}>Get in touch</a><a className="button button-secondary" href={`#${page}-approach`}>Learn more</a></div>
    </section>
    <section className="section split-panel" id={`${page}-approach`}>
      <PageArtwork name={content.image} />
      <div className="panel-rows">
        <div className="panel-head"><SectionTitle text={content.title} /></div>
        {content.rows.map(([title,body])=><div className="panel-row" key={title}><h3>{title}</h3><p>{body}</p></div>)}
      </div>
    </section>
    <section className="section split-panel split-panel--mirror">
      <div className="panel-rows"><div className="panel-head"><SectionTitle text={process.title} /></div>{process.rows.map(([title,body])=><div className="panel-row" key={title}><h3>{title}</h3><p>{body}</p></div>)}</div>
      <PageArtwork name={page === 'research' ? '10-vault' : page === 'strategy' ? '17-pass' : '16-garden'} />
    </section>
    <section className="section split-panel">
      <PageArtwork name={content.secondImage} />
      <div className="panel-rows"><div className="panel-head"><SectionTitle text={content.secondTitle} /></div>{content.secondRows.map(([title,body])=><div className="panel-row" key={title}><h3>{title}</h3><p>{body}</p></div>)}</div>
    </section>
  </>
}

function App() {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuButton = useRef<HTMLButtonElement>(null)
  const [showAnnouncement, setShowAnnouncement] = useState(true)
  const [page, setPage] = useState<PageId>(() => getPageFromHash())

  useEffect(() => {
    function syncPage() {
      setMenuOpen(false)
      setPage(getPageFromHash())
      const targetId = window.location.hash.replace(/^#/, '')
      const target = targetId && !targetId.startsWith('/') ? document.getElementById(targetId) : null

      if (target) {
        requestAnimationFrame(() => target.scrollIntoView({ behavior: 'smooth', block: 'start' }))
        return
      }

      window.scrollTo({ top: 0, behavior: 'auto' })
    }

    window.addEventListener('hashchange', syncPage)
    return () => window.removeEventListener('hashchange', syncPage)
  }, [])

  return (
    <>
      {showAnnouncement ? (
        <div className="announcement">
          <span>Formenos is building the AI-Native Hedge Fund</span>
          <button
            aria-label="Dismiss announcement"
            onClick={() => setShowAnnouncement(false)}
            type="button"
          >
            ×
          </button>
        </div>
      ) : null}

      <div className="site-shell">
        <header className={`nav ${menuOpen ? 'nav--expanded' : ''}`} onKeyDown={event => {if(event.key === 'Escape' && menuOpen){setMenuOpen(false);menuButton.current?.focus()}}}>
          <a className="brand" href="#overview" aria-label="Formenos home">
            <img className="brand-wordmark" src="/formenos-logo.png" alt="Formenos" />
          </a>

          {navLinks.length > 0 ? (
            <nav id="primary-navigation" className="nav-links" aria-label="Primary navigation" onClick={()=>setMenuOpen(false)}>
              {navLinks.map((menu) => (
                <div className="nav-item" key={menu.label}>
                  <a className="nav-trigger" href={menu.href} aria-current={(page === 'home' ? menu.href === '#overview' : menu.href === `#/${page}`) ? 'page' : undefined}>
                    {menu.label}
                  </a>
                </div>
              ))}
              <a className="mobile-contact" href={`mailto:${CONTACT_EMAIL}`}>Contact <span aria-hidden="true">↗</span></a>
            </nav>
          ) : null}

          <button ref={menuButton} className="mobile-nav-button" type="button" aria-label={menuOpen ? 'Close menu' : 'Open menu'} aria-expanded={menuOpen} aria-controls="primary-navigation" onClick={()=>setMenuOpen(!menuOpen)}><span className="menu-icon" aria-hidden="true"><i /><i /></span></button>
          <div className="nav-actions">
            <a className="button button-secondary" href={`mailto:${CONTACT_EMAIL}`}>
              Contact
            </a>
          </div>

        </header>

        <main className="app-shell">
          {page === 'home' ? (
            <>
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="section hero" id="overview">
          <h1>
            Formenos Is the Hedge Fund{' '}
            <br className="hero-break" />
            Run Like a{' '}
            <span className="hide-mobile">Technology</span>
            <span className="only-mobile">Tech</span> Company.
          </h1>
          <p className="hero-sub">
            <span className="home-subtitle-desktop">Built for the founders and investors in Silicon Valley.{' '}
              <br className="hero-break" />
              Dedicated to managing capital in public markets.</span>
            <span className="home-subtitle-mobile">
              <span>Built for Silicon Valley’s founders and investors.</span>
              <span>Dedicated to public markets.</span>
            </span>
          </p>
          <div className="hero-actions">
            <a className="button button-dark" href={`mailto:${CONTACT_EMAIL}`}>
              Get in touch
            </a>
            <a className="button button-secondary" href="#how">
              How we work
            </a>
          </div>

      </section>

      {/* ── Pipeline: diagram + pillars ───────────────────────────────────── */}
      <section className="section split-panel" id="how">
        <PageArtwork name="monument-interior" />

        <div className="panel-rows">
          <div className="panel-head">
            <SectionTitle text="Built for Silicon Valley.|Focused on Public Markets." />
          </div>
          {pillars.map(([title, body]) => (
            <div className="panel-row" key={title}>
              <h3>{title}</h3>
              <p>{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Backing: mark left, rows right ──────────────────────────────── */}
      <section className="section split-panel split-panel--aligned split-panel--mirror" id="backing">
        <div className="panel-rows">
          <div className="panel-head">
            <SectionTitle text="Backed by the First Investors in|Cursor, Cognition, Etched, and Aaru." />
          </div>
          {trackRecord.map(([title, body]) => (
            <div className="panel-row" key={title}>
              <h3>{title}</h3>
              <p>{body}</p>
            </div>
          ))}
        </div>

        <div className="panel-visual logo-wall">
          <div className="logo-grid">
            {investors.map(([name, logo, scale]) => (
              <div className="logo-cell" key={name}>
                {logo ? (
                  <img
                    alt={name}
                    src={logo}
                    style={scale ? ({ '--logo-scale': scale } as React.CSSProperties) : undefined}
                  />
                ) : (
                  <span>{name}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Strategy: artwork left, rows right ───────────────── */}
      <section className="section split-panel" id="strategy">
        <PageArtwork name="monument-bridge" />
        <div className="panel-rows">
          <div className="panel-head">
            <SectionTitle text="A Dedicated Investment Firm.|A Long-Term Commitment." />
          </div>
          {strategy.map(([title, body]) => (
            <div className="panel-row" key={title}>
              <h3>{title}</h3>
              <p>{body}</p>
            </div>
          ))}
        </div>

      </section>


            </>
          ) : (
            <DetailPage page={page} />
          )}
        </main>

      <footer className="site-footer">
        <div className="footer-grid">
          <div className="footer-primary">
            <a className="brand footer-brand" href="#overview">
              <img className="brand-wordmark" src="/formenos-logo.png" alt="Formenos" />
            </a>
            <p>
              The AI-Native Hedge Fund
            </p>
          </div>

          {footerColumns.length > 0 ? (
            <div className="footer-columns">
              {footerColumns.map((column) => (
                <nav key={column.heading}>
                  <h3>{column.heading}</h3>
                  {column.links.map(([label, href]) => (
                    <a href={href} key={label}>
                      {label}
                    </a>
                  ))}
                </nav>
              ))}
            </div>
          ) : null}
        </div>

        <div className="footer-bottom">
          <span>© 2026 Formenos Management LP</span>
          <div>
            {footerBottomLinks.map((link) => (
              <span key={link}>{link}</span>
            ))}
          </div>
        </div>
      </footer>
      </div>
    </>
  )
}

export default App
