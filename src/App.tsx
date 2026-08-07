import { useEffect, useState } from 'react'
import './App.css'
import { WinRateBarChart } from './components/FundCharts'

type PageId = 'home' | 'strategy' | 'returns' | 'research' | 'risk' | 'company' | 'investors' | 'contact'

const monthlyReturns = [
  ['Jan', '+0.93%'],
  ['Feb', '-5.04%'],
  ['Mar', '-2.86%'],
  ['Apr', '+12.23%'],
  ['May', '+11.46%'],
  ['Jun', '-3.17%'],
]

const overviewColumns = [
  [
    ['Fund Style', 'AI-native long/short'],
    ['Core Playbook', 'Concentrated conviction'],
    ['Position Count', '10-30 core positions'],
    ['Risk Target', 'Asymmetric 3:1 setups'],
  ],
  [
    ['Strategy Focus', 'Macro-driven security selection'],
    ['Capital Allocation', 'Conviction-weighted'],
    ['Primary Themes', 'AI, mega-cap dominance, special situations'],
    ['Liquidity Profile', 'Public liquid equities'],
  ],
]

const navLinks = [
  { label: 'Fund', href: '#overview' },
  { label: 'Returns', href: '#monthly-returns' },
]

const footerColumns = [
  {
    heading: 'Fund',
    links: [
      ['Overview', '#overview'],
      ['Monthly Returns', '#monthly-returns'],
    ],
  },
]

// no destinations for these yet — rendered as plain text, not links
const footerBottomLinks = ['Terms', 'Privacy', 'Disclosures']

const detailPages: Record<
  Exclude<PageId, 'home'>,
  {
    eyebrow: string
    title: string
    subtitle: string
    rows: Array<[string, string]>
    sections: Array<{ title: string; body: string }>
  }
> = {
  strategy: {
    eyebrow: 'Strategy',
    title: 'Concentrated Conviction Plays',
    subtitle:
      'Formenos starts with a macro view, identifies secular shifts, then expresses the view through a small number of high-conviction liquid securities.',
    rows: [
      ['Core Style', 'Macro-driven security selection'],
      ['Positioning', 'Conviction-weighted, 10-30 core names'],
      ['Primary Edge', 'Asymmetric risk/reward and deep relative value'],
      ['Themes', 'AI infrastructure, mega-cap dominance, special situations'],
    ],
    sections: [
      {
        title: 'Macro View First',
        body:
          'We begin with the regime: rates, liquidity, earnings revisions, capital expenditure cycles, and investor positioning.',
      },
      {
        title: 'Security Selection Second',
        body:
          'Once the theme is clear, agents and analysts search for the best equity expression instead of diversifying across weak proxies.',
      },
      {
        title: 'Sizing Follows Conviction',
        body:
          'The best ideas get meaningful capital. Low-conviction ideas do not stay in the book just for diversification.',
      },
    ],
  },
  returns: {
    eyebrow: 'Returns',
    title: 'Six-Month Return History',
    subtitle:
      'The complete tested history consists of six monthly returns, shown as a compounded growth series.',
    rows: [
      ['Net P&L', '+12.77%'],
      ['Tested History', '6 months'],
      ['Best Month', '+12.23%'],
      ['Worst Month', '-5.04%'],
    ],
    sections: [
      {
        title: 'Measured On Compounded Results',
        body:
          'Monthly gains and losses are compounded to show the actual change in portfolio value over the tested period.',
      },
      {
        title: 'Return Quality Matters',
        body:
          'We care about the path of returns: drawdown, exposure, liquidity, and whether gains came from the thesis we underwrote.',
      },
    ],
  },
  research: {
    eyebrow: 'Research',
    title: 'AI-Native Research Engine',
    subtitle:
      'Autonomous agents read filings, transcripts, news, macro data, price action, and alternative datasets to surface mispricings faster.',
    rows: [
      ['Coverage', 'Public liquid equities'],
      ['Inputs', 'Filings, transcripts, pricing, macro, sentiment'],
      ['Output', 'Ranked theses and risk/reward maps'],
      ['Human Role', 'Judgment, sizing, and risk review'],
    ],
    sections: [
      {
        title: 'Secular Trend Identification',
        body:
          'Agents monitor structural shifts like AI capex, compute demand, software consolidation, and margin expansion.',
      },
      {
        title: 'Special Situations',
        body:
          'The system flags catalysts where consensus may be slow: spin-offs, revisions, regulatory changes, and capital returns.',
      },
      {
        title: 'Deep Relative Value',
        body:
          'We compare quality, growth, balance sheet, and multiple dispersion to find mispricings inside mega-cap universes.',
      },
    ],
  },
  risk: {
    eyebrow: 'Risk',
    title: 'Asymmetric Positioning With Hard Limits',
    subtitle:
      'The fund is built to take concentrated risk only when upside/downside, liquidity, and thesis durability are clear.',
    rows: [
      ['Target Setup', '3:1 upside/downside'],
      ['Position Sizing', 'Conviction-weighted'],
      ['Risk Controls', 'Exposure, liquidity, drawdown, thesis breakpoints'],
      ['Hedges', 'Macro hedges and cash when risk/reward weakens'],
    ],
    sections: [
      {
        title: 'Know What Breaks The Thesis',
        body:
          'Every major position carries explicit invalidation points before capital is deployed.',
      },
      {
        title: 'Opportunistic Allocation',
        body:
          'Capital can move between sectors, themes, cash, and hedges when the opportunity set changes.',
      },
    ],
  },
  company: {
    eyebrow: 'Company',
    title: 'We Are An AI-Native Hedge Fund',
    subtitle:
      'Formenos combines investing judgment with software, agents, and systematic risk controls to build a modern concentrated hedge fund.',
    rows: [
      ['Built For', 'Public market alpha'],
      ['Approach', 'Macro view to concentrated stock picks'],
      ['Team Shape', 'Investing, engineering, data, risk'],
      ['Principle', 'Fewer, better ideas'],
    ],
    sections: [
      {
        title: 'AI-Native From The Ground Up',
        body:
          'The research process is not a spreadsheet with AI bolted on. Agents are part of sourcing, monitoring, and thesis review.',
      },
      {
        title: 'Human Judgment Stays Central',
        body:
          'AI expands coverage and speed. Humans own portfolio construction, risk, and final capital allocation.',
      },
    ],
  },
  investors: {
    eyebrow: 'Investors',
    title: 'Materials For Qualified Investors',
    subtitle:
      'Investor materials are available for qualified investors seeking concentrated AI-native public-market exposure.',
    rows: [
      ['Available Materials', 'Strategy overview, risk framework, exposure summary'],
      ['Investor Type', 'Qualified investors and institutions'],
      ['Reporting', 'Positioning, themes, risk, and attribution'],
      ['Contact', 'Request access to materials'],
    ],
    sections: [
      {
        title: 'Designed For Capital Partners',
        body:
          'The strategy is built for investors who understand concentration, volatility, and opportunistic allocation.',
      },
      {
        title: 'Clear Reporting',
        body:
          'We explain what we own, why we own it, what can go wrong, and what changed in the thesis.',
      },
    ],
  },
  contact: {
    eyebrow: 'Contact',
    title: 'Talk to Formenos',
    subtitle:
      'Request investor materials, ask about the strategy, or discuss whether the fund fits your mandate.',
    rows: [
      ['Email', 'investors@formenos.ai'],
      ['Focus', 'AI-native concentrated hedge fund'],
      ['Investor Type', 'Qualified investors'],
      ['Materials', 'Available by request'],
    ],
    sections: [
      {
        title: 'What To Include',
        body:
          'Share your investor type, mandate, time horizon, and what materials you want to review.',
      },
    ],
  },
}

function getPageFromHash(): PageId {
  return 'home'
}

function DetailPage({ page }: { page: Exclude<PageId, 'home'> }) {
  const content = detailPages[page]
  const visualBars =
    page === 'returns'
      ? [
          ['January', '+0.93%', 0.93],
          ['February', '-5.04%', 5.04],
          ['March', '-2.86%', 2.86],
          ['April', '+12.23%', 12.23],
          ['May', '+11.46%', 11.46],
          ['June', '-3.17%', 3.17],
        ]
      : [
          ['Macro Signal', '72%', 72],
          ['Security Selection', '84%', 84],
          ['Risk Discipline', '64%', 64],
          ['Execution Edge', '58%', 58],
        ]

  return (
    <>
      <section className="section detail-hero">
        <div className="detail-hero-copy">
          <span className="page-eyebrow">{content.eyebrow}</span>
          <h1>{content.title}</h1>
          <p>{content.subtitle}</p>
        </div>
        <div className="detail-facts-table">
          {content.rows.map(([label, value]) => (
            <div className="overview-row" key={label}>
              <span>{label}</span>
              <strong>{value}</strong>
            </div>
          ))}
        </div>
      </section>

      <section className="section detail-split">
        <div>
          <h2>{page === 'company' ? 'Who We Are' : 'What We Do'}</h2>
          <p>
            We are an AI-native hedge fund built to turn macro views into concentrated,
            conviction-weighted public-market positions. The process combines autonomous research
            coverage with human judgment around sizing, risk, and thesis quality.
          </p>
        </div>
        <div className="detail-card-grid">
          {content.sections.map((section) => (
            <article className="detail-card" key={section.title}>
              <h3>{section.title}</h3>
              <p>{section.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section detail-visual-section">
        <WinRateBarChart
          data={visualBars.map(([label, value, amount]) => ({
            label: String(label),
            value: String(value),
            amount: Number(amount),
          }))}
          title={page === 'returns' ? 'Win-Rates Across Investment Periods' : 'Operating Edge'}
        />
        <div className="detail-visual-copy">
          <h2>{page === 'returns' ? 'Outperformance Over Time As A Result' : 'Built For Fewer, Better Ideas'}</h2>
          <p>
            The goal is not to own everything. It is to identify the small number of situations
            where macro setup, security selection, and asymmetric risk/reward line up.
          </p>
          <p>
            AI expands the research surface area, but capital allocation remains concentrated,
            explainable, and risk-aware.
          </p>
        </div>
      </section>
    </>
  )
}

function App() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [showAnnouncement, setShowAnnouncement] = useState(true)
  const [page, setPage] = useState<PageId>(() => getPageFromHash())

  useEffect(() => {
    function syncPage() {
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
          <span>Formenos is building an AI-native concentrated hedge fund.</span>
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
        <header className="nav">
          <a className="brand" href="#overview" aria-label="Formenos home">
            <img className="brand-wordmark" src="/formenos-logo.png" alt="Formenos" />
          </a>

          <button
            aria-expanded={mobileMenuOpen}
            aria-label="Toggle navigation"
            className="mobile-menu-toggle"
            onClick={() => setMobileMenuOpen((open) => !open)}
            type="button"
          >
            <span />
            <span />
          </button>

          <nav className="nav-links" aria-label="Primary navigation">
            {navLinks.map((menu) => (
              <div className="nav-item" key={menu.label}>
                <a className="nav-trigger" href={menu.href}>
                  {menu.label}
                </a>
              </div>
            ))}
          </nav>

          <div className="nav-actions">
            <a className="button button-secondary" href="#overview">
              Contact
            </a>
          </div>

          {mobileMenuOpen ? (
            <nav className="mobile-menu" aria-label="Mobile navigation">
              {navLinks.map((menu) => (
                <a href={menu.href} key={menu.label} onClick={() => setMobileMenuOpen(false)}>
                  {menu.label}
                </a>
              ))}
            </nav>
          ) : null}
        </header>

        <main className="app-shell">
          {page === 'home' ? (
            <>
      <section className="section overview-section home-panel-section" id="overview">
        <div className="section-heading">
          <h1>Fund Overview</h1>
          <p>
            Formenos is an AI-native hedge fund pursuing concentrated conviction plays through
            macro-driven security selection, secular trend identification, and asymmetric
            positioning.
          </p>
          <div className="overview-links">
            <a href="#overview">Full Strategy Details ↗</a>
            <a href="#monthly-returns">Investor Materials ↗</a>
          </div>
        </div>
        <div className="overview-grid content-panel">
          {overviewColumns.map((column) => (
            <div className="overview-table" key={column[0][0]}>
              {column.map(([label, value]) => (
                <div className="overview-row" key={label}>
                  <span>{label}</span>
                  <strong>{value}</strong>
                </div>
              ))}
            </div>
          ))}
        </div>
      </section>

      <section className="section monthly-returns-section home-panel-section" id="monthly-returns">
        <div className="section-heading">
          <h2>Monthly Returns</h2>
          <p>
            The complete six-month tested return history for the Formenos strategy.
          </p>
        </div>
        <div className="monthly-return-grid">
          {monthlyReturns.map(([month, value]) => (
            <article className="monthly-return-card" key={month}>
              <span>{month}</span>
              <strong>{value}</strong>
            </article>
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
              <img className="brand-wordmark" src="/formenos-logo-light.png" alt="Formenos" />
            </a>
            <p>
              AI-native concentrated hedge fund built around macro-driven security selection,
              asymmetric positioning, and conviction-weighted capital allocation.
            </p>
          </div>

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
