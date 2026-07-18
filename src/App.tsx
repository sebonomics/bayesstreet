import { useEffect, useState } from 'react'
import './App.css'
import {
  AllocationDonutChart,
  HeroPerformanceChart,
  ReturnsLineChart,
  WinRateBarChart,
} from './components/FundCharts'

type PageId = 'home' | 'strategy' | 'returns' | 'research' | 'risk' | 'company' | 'investors' | 'contact'

const cumulativeTabs = [
  { label: 'NET P&L', value: '+12.77%', active: true },
  { label: 'POSITIVE MONTHS', value: '3 / 6' },
  { label: 'BEST MONTH', value: '+12.23%' },
  { label: 'WORST MONTH', value: '-5.04%' },
]

const monthlyReturns = [
  ['Jan', '+0.93%'],
  ['Feb', '-5.04%'],
  ['Mar', '-2.86%'],
  ['Apr', '+12.23%'],
  ['May', '+11.46%'],
  ['Jun', '-3.17%'],
]

const sectors = [
  { name: 'Concentrated AI Conviction', value: '38.51%', color: 'var(--accent)' },
  { name: 'Mega-cap Dominance', value: '24.43%', color: '#e54b4b' },
  { name: 'Deep Relative Value', value: '13.56%', color: '#5c0c12' },
  { name: 'Special Situations', value: '8.46%', color: '#ff6b6b' },
  { name: 'Secular Trend Leaders', value: '5.13%', color: '#8d1f2d' },
  { name: 'Opportunistic Allocation', value: '4.04%', color: '#d99a9a' },
  { name: 'Macro Hedges', value: '3.28%', color: '#641219' },
  { name: 'Cash & Hedges', value: '1.14%', color: '#f0b7b7' },
  { name: 'Other', value: '1.45%', color: '#a83a42' },
]

const processSteps = [
  ['01', 'Identify Secular Trend', 'Find the big structural shift before it is fully priced.'],
  ['02', 'Underwrite Asymmetry', 'Map upside, downside, liquidity, and thesis breakpoints.'],
  ['03', 'Size By Conviction', 'Put the most capital behind the best risk/reward setups.'],
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
  {
    label: 'Fund',
    href: '#overview',
    items: [
      ['Overview', 'Fund structure and strategy snapshot', '01', '#overview'],
      ['Process', 'Macro view to concentrated expression', '02', '#process'],
    ],
  },
  {
    label: 'Returns',
    href: '#returns',
    items: [
      ['Returns', 'Complete six-month tested performance', '03', '#returns'],
      ['Monthly Returns', 'Recent monthly return cards', '04', '#monthly-returns'],
      ['Return Profile', 'Six-month compounded return context', '05', '#benchmark'],
    ],
  },
  {
    label: 'Portfolio',
    href: '#allocation',
    items: [
      ['Allocation', 'Theme and exposure breakdown', '06', '#allocation'],
      ['Investor Materials', 'Strategy snapshot and positioning', '07', '#overview'],
    ],
  },
]

const footerColumns = [
  {
    heading: 'Fund',
    links: [
      ['Overview', '#overview'],
      ['Returns', '#returns'],
      ['Allocation', '#allocation'],
    ],
  },
  {
    heading: 'Research',
    links: [
      ['Process', '#process'],
      ['Monthly Returns', '#monthly-returns'],
      ['Return Profile', '#benchmark'],
    ],
  },
  {
    heading: 'Investors',
    links: [
      ['Materials', '#overview'],
      ['Return Profile', '#benchmark'],
      ['Allocation', '#allocation'],
    ],
  },
  {
    heading: 'Company',
    links: [
      ['About', '#overview'],
      ['Process', '#process'],
      ['Returns', '#returns'],
    ],
  },
]

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
      'BayesStreet starts with a macro view, identifies secular shifts, then expresses the view through a small number of high-conviction liquid securities.',
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
      'BayesStreet combines investing judgment with software, agents, and systematic risk controls to build a modern concentrated hedge fund.',
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
    title: 'Talk to BayesStreet',
    subtitle:
      'Request investor materials, ask about the strategy, or discuss whether the fund fits your mandate.',
    rows: [
      ['Email', 'investors@bayesstreet.ai'],
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
  const [openNavMenu, setOpenNavMenu] = useState<string | null>(null)
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
          <span>
            BayesStreet is building an AI-native concentrated hedge fund.{' '}
            <a href="#overview">Explore the strategy →</a>
          </span>
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
          <a className="brand" href="#top" aria-label="BayesStreet home">
            <img className="brand-logo" src="/bayesstreet-logo.png" alt="" />
            <span className="brand-word">BayesStreet</span>
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
              <div
                className={openNavMenu === menu.label ? 'nav-item nav-item--open' : 'nav-item'}
                key={menu.label}
                onMouseEnter={() => setOpenNavMenu(menu.label)}
                onMouseLeave={() => setOpenNavMenu(null)}
              >
                <a className="nav-trigger" href={menu.href}>
                  {menu.label}
                </a>
                <div className="dropdown">
                  {menu.items.map(([title, description, icon, href], index) => (
                    <a
                      className={index === 0 ? 'active' : undefined}
                      href={href}
                      key={title}
                      onClick={() => setOpenNavMenu(null)}
                    >
                      <span className="dropdown-icon">{icon}</span>
                      <span className="dropdown-copy">
                        <span className="dropdown-title">{title}</span>
                        <span>{description}</span>
                      </span>
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </nav>

          <div className="nav-actions">
            <a className="button button-secondary" href="#allocation">
              Contact
            </a>
            <a className="button button-dark" href="#overview">
              Investor materials
            </a>
          </div>

          {mobileMenuOpen ? (
            <nav className="mobile-menu" aria-label="Mobile navigation">
              {navLinks.map((menu) => (
                <a href={menu.href} key={menu.label} onClick={() => setMobileMenuOpen(false)}>
                  {menu.label}
                </a>
              ))}
              <a
                className="mobile-menu-cta"
                href="#overview"
                onClick={() => setMobileMenuOpen(false)}
              >
                Investor Materials
              </a>
            </nav>
          ) : null}
        </header>

        <main className="app-shell">
          {page === 'home' ? (
            <>
      <section className="section home-hero" id="top">
        <div className="hero-intro">
          <h1>
            <span>Plan to Play,</span> <span>Play to Win</span>
          </h1>
          <p>
            BayesStreet combines autonomous research agents, macro-driven security selection, and
            conviction-weighted capital allocation in liquid public markets.
          </p>
        </div>
        <HeroPerformanceChart />
        <div className="hero-links">
          <a href="#overview">Explore Strategy ↗</a>
          <a href="#benchmark">Investor Materials ↗</a>
        </div>
      </section>

      <section className="section performance-section home-panel-section" id="returns">
        <div className="section-heading">
          <h1>Returns</h1>
          <p>
            The fund's first six monthly returns, shown as a compounded growth series.
          </p>
        </div>
        <div className="section-component content-panel">
          <div className="return-tabs">
            {cumulativeTabs.map((tab) => (
              <div className={tab.active ? 'return-tab active' : 'return-tab'} key={tab.label}>
                <span>{tab.label}</span>
                <strong>{tab.value}</strong>
              </div>
            ))}
          </div>
          <ReturnsLineChart />
        </div>
      </section>

      <section className="section monthly-returns-section home-panel-section" id="monthly-returns">
        <div className="section-heading">
          <h2>Monthly Returns</h2>
          <p>
            The complete six-month tested return history for the BayesStreet strategy.
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

      <section className="section overview-section home-panel-section" id="overview">
        <div className="section-heading">
          <h1>Overview</h1>
          <p>
            BayesStreet is an AI-native hedge fund pursuing concentrated conviction plays through
            macro-driven security selection, secular trend identification, and asymmetric
            positioning.
          </p>
          <div className="overview-links">
            <a href="#process">Full Strategy Details ↗</a>
            <a href="#benchmark">Investor Materials ↗</a>
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

      <section className="section sector-section home-panel-section" id="allocation">
        <div className="section-heading">
          <h2>Portfolio Allocation</h2>
          <p>
            The portfolio is built around concentrated conviction plays, secular trend
            identification, special situations, and deep relative value in mega-cap names.
          </p>
        </div>
        <div className="allocation-panel">
          <div className="sector-table">
            <div className="sector-row sector-head">
              <strong>Holdings</strong>
              <strong>Allocation</strong>
            </div>
            {sectors.map((sector) => (
              <div className="sector-row" key={sector.name}>
                <span>
                  <i style={{ background: sector.color }} />
                  {sector.name}
                </span>
                <strong>{sector.value}</strong>
              </div>
            ))}
          </div>
          <div className="donut-wrap" aria-label="Portfolio allocation chart">
            <AllocationDonutChart data={sectors} />
          </div>
        </div>
      </section>

      <section className="section process-section home-panel-section" id="process">
        <div className="section-heading">
          <h2>Process</h2>
          <p>Macro view, AI research coverage, concentrated expression, and explicit risk limits.</p>
        </div>
        <div className="process-list content-panel">
          {processSteps.map(([number, title, body]) => (
            <article className="process-row" key={number}>
              <span>{number}</span>
              <h3>{title}</h3>
              <p>{body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section comparison-section home-panel-section" id="benchmark">
        <div className="section-heading">
          <h2>Six-Month Return Profile</h2>
          <p>
            Compounded performance across the fund's complete tested history.
          </p>
        </div>
        <ReturnsLineChart />
        <aside className="summary-card">
          <p>
            The six reported monthly returns compound to a net P&amp;L of{' '}
            <strong>+12.77%</strong>. A starting value of $100 finished at $112.77.
          </p>
        </aside>
      </section>

            </>
          ) : (
            <DetailPage page={page} />
          )}
        </main>

      <footer className="site-footer">
        <div className="footer-grid">
          <div className="footer-primary">
            <a className="brand footer-brand" href="#top">
              <img className="brand-logo" src="/bayesstreet-logo.png" alt="" />
              <span className="brand-word">BayesStreet</span>
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
          <span>© 2026 BayesStreet Management LP</span>
          <div>
            {footerBottomLinks.map((link) => (
              <a href="#benchmark" key={link}>
                {link}
              </a>
            ))}
          </div>
        </div>
      </footer>
      </div>
    </>
  )
}

export default App
