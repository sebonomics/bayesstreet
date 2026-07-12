import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'

const red = '#c1121f'
const softRed = '#e54b4b'
const darkRed = '#5c0c12'

const returnSeries = [
  { period: '2016', fund: 100, benchmark: 100 },
  { period: '2017', fund: 138, benchmark: 122 },
  { period: '2018', fund: 128, benchmark: 116 },
  { period: '2019', fund: 196, benchmark: 154 },
  { period: '2020', fund: 284, benchmark: 190 },
  { period: '2021', fund: 361, benchmark: 238 },
  { period: '2022', fund: 302, benchmark: 210 },
  { period: '2023', fund: 488, benchmark: 286 },
  { period: '2024', fund: 612, benchmark: 346 },
  { period: '2025', fund: 734, benchmark: 412 },
  { period: '2026', fund: 842, benchmark: 486 },
]

const heroRanges = {
  '1Y': {
    fundReturn: '+33.98%',
    benchmarkReturn: '+20.53%',
    start: 'June 2025',
    end: 'June 2026',
    value: '$13,398',
    data: [
      { period: 'Jun 2025', fund: 100, benchmark: 100 },
      { period: 'Aug 2025', fund: 106, benchmark: 105 },
      { period: 'Oct 2025', fund: 111, benchmark: 112 },
      { period: 'Dec 2025', fund: 118, benchmark: 112 },
      { period: 'Feb 2026', fund: 124, benchmark: 111 },
      { period: 'Apr 2026', fund: 127, benchmark: 116 },
      { period: 'Jun 2026', fund: 134, benchmark: 121 },
    ],
  },
  '3Y': {
    fundReturn: '+102.67%',
    benchmarkReturn: '+69.24%',
    start: 'June 2023',
    end: 'June 2026',
    value: '$20,267',
    data: [
      { period: 'Jun 2023', fund: 100, benchmark: 100 },
      { period: 'Dec 2023', fund: 112, benchmark: 108 },
      { period: 'Jun 2024', fund: 136, benchmark: 124 },
      { period: 'Dec 2024', fund: 153, benchmark: 136 },
      { period: 'Jun 2025', fund: 166, benchmark: 140 },
      { period: 'Dec 2025', fund: 184, benchmark: 157 },
      { period: 'Jun 2026', fund: 203, benchmark: 169 },
    ],
  },
  '5Y': {
    fundReturn: '+114.16%',
    benchmarkReturn: '+73.36%',
    start: 'June 2021',
    end: 'June 2026',
    value: '$21,416',
    data: [
      { period: 'June 2021', fund: 100, benchmark: 100 },
      { period: 'Dec 2021', fund: 106, benchmark: 112 },
      { period: 'June 2022', fund: 92, benchmark: 89 },
      { period: 'Dec 2022', fund: 86, benchmark: 90 },
      { period: 'June 2023', fund: 98, benchmark: 102 },
      { period: 'Dec 2023', fund: 111, benchmark: 111 },
      { period: 'June 2024', fund: 128, benchmark: 127 },
      { period: 'Dec 2024', fund: 139, benchmark: 139 },
      { period: 'June 2025', fund: 158, benchmark: 144 },
      { period: 'Dec 2025', fund: 177, benchmark: 161 },
      { period: 'June 2026', fund: 214, benchmark: 173 },
    ],
  },
  '10Y': {
    fundReturn: '+634.60%',
    benchmarkReturn: '+248.15%',
    start: 'July 2016',
    end: 'June 2026',
    value: '$73,460',
    data: [
      { period: '2016', fund: 100, benchmark: 100 },
      { period: '2017', fund: 138, benchmark: 113 },
      { period: '2018', fund: 128, benchmark: 127 },
      { period: '2019', fund: 196, benchmark: 138 },
      { period: '2020', fund: 284, benchmark: 143 },
      { period: '2021', fund: 361, benchmark: 201 },
      { period: '2022', fund: 302, benchmark: 179 },
      { period: '2023', fund: 488, benchmark: 206 },
      { period: '2024', fund: 612, benchmark: 256 },
      { period: '2025', fund: 734, benchmark: 289 },
      { period: '2026', fund: 842, benchmark: 348 },
    ],
  },
}

type HeroRange = keyof typeof heroRanges

type AllocationDatum = {
  name: string
  value: string
  color: string
}

type BarDatum = {
  label: string
  value: string
  amount: number
}

function percentValue(value: string) {
  return Number(value.replace('%', ''))
}

export function HeroPerformanceChart() {
  const [activeRange, setActiveRange] = useState<HeroRange>('5Y')
  const range = heroRanges[activeRange]

  return (
    <div className="hero-chart-shell">
      <div className="hero-chart-main">
        <div className="hero-chart-metrics">
          <div>
            <span className="legend-dot fund-dot">BayesStreet AI Fund</span>
            <strong>{range.fundReturn}</strong>
          </div>
          <div>
            <span className="legend-dot benchmark-dot">S&P 500 Index</span>
            <strong>{range.benchmarkReturn}</strong>
          </div>
        </div>

        <div className="hero-range-tabs" aria-label="Chart range">
          {(Object.keys(heroRanges) as HeroRange[]).map((rangeKey) => (
            <button
              className={rangeKey === activeRange ? 'active' : ''}
              key={rangeKey}
              onClick={() => setActiveRange(rangeKey)}
              type="button"
            >
              {rangeKey}
            </button>
          ))}
        </div>

        <div className="hero-chart-frame">
          <ResponsiveContainer height="100%" width="100%">
            <LineChart data={range.data} margin={{ bottom: 18, left: 0, right: 16, top: 20 }}>
              <XAxis
                axisLine={false}
                dataKey="period"
                interval="preserveStartEnd"
                tick={false}
                tickLine={false}
                height={4}
              />
              <Tooltip
                formatter={(value, name) => [
                  `${Number(value).toFixed(0)}`,
                  name === 'fund' ? 'BayesStreet AI Fund' : 'S&P 500 Index',
                ]}
                contentStyle={{
                  border: '1px solid #e5e5e5',
                  borderRadius: 12,
                  boxShadow: '0 16px 44px rgba(0,0,0,0.12)',
                }}
              />
              <Line dataKey="fund" dot={false} stroke={red} strokeWidth={3} type="monotone" />
              <Line dataKey="benchmark" dot={false} stroke={softRed} strokeWidth={2} type="monotone" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="hero-chart-dates">
          <span>{range.start}</span>
          <span>{range.end}</span>
        </div>
      </div>

      <aside className="hero-return-card">
        <p>
          The {activeRange.toLowerCase()} cumulative model return for BayesStreet AI Fund is{' '}
          <strong>{range.fundReturn}</strong>, meaning <strong>$10,000</strong> invested would be
          worth <strong>{range.value}</strong> today.
        </p>
        <span>as of 06/29/2026</span>
      </aside>
    </div>
  )
}

export function ReturnsLineChart() {
  return (
    <Card className="chart-card-shell">
      <CardHeader>
        <CardTitle>Strategy growth of $100</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="chart-frame">
          <ResponsiveContainer height="100%" width="100%">
            <LineChart data={returnSeries} margin={{ bottom: 0, left: 0, right: 8, top: 8 }}>
              <CartesianGrid stroke="#eeeeee" vertical={false} />
              <XAxis axisLine={false} dataKey="period" tickLine={false} tickMargin={10} />
              <YAxis axisLine={false} tickLine={false} tickMargin={10} width={44} />
              <Tooltip
                contentStyle={{
                  border: '1px solid #e5e5e5',
                  borderRadius: 0,
                  boxShadow: '0 12px 36px rgba(0,0,0,0.08)',
                }}
              />
              <Line
                dataKey="fund"
                dot={false}
                name="BayesStreet AI Fund"
                stroke={red}
                strokeWidth={3}
                type="monotone"
              />
              <Line
                dataKey="benchmark"
                dot={false}
                name="S&P 500 Index"
                stroke={softRed}
                strokeWidth={2}
                type="monotone"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

export function AllocationDonutChart({ data }: { data: AllocationDatum[] }) {
  const chartData = data.map((item) => ({
    ...item,
    amount: percentValue(item.value),
    color: item.color === 'var(--accent)' ? red : item.color,
  }))

  return (
    <Card className="chart-card-shell">
      <CardHeader>
        <CardTitle>Allocation by theme</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="donut-chart-frame">
          <ResponsiveContainer height="100%" width="100%">
            <PieChart>
              <Pie
                cx="50%"
                cy="50%"
                data={chartData}
                dataKey="amount"
                innerRadius="62%"
                nameKey="name"
                outerRadius="86%"
                paddingAngle={1}
              >
                {chartData.map((entry) => (
                  <Cell fill={entry.color} key={entry.name} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => [`${Number(value).toFixed(2)}%`, 'Allocation']}
                contentStyle={{
                  border: '1px solid #e5e5e5',
                  borderRadius: 0,
                  boxShadow: '0 12px 36px rgba(0,0,0,0.08)',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

export function WinRateBarChart({ data, title }: { data: BarDatum[]; title: string }) {
  return (
    <Card className="chart-card-shell">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="bar-chart-frame">
          <ResponsiveContainer height="100%" width="100%">
            <BarChart data={data} layout="vertical" margin={{ bottom: 0, left: 8, right: 24, top: 4 }}>
              <CartesianGrid horizontal={false} stroke="#eeeeee" />
              <XAxis axisLine={false} tickLine={false} type="number" />
              <YAxis axisLine={false} dataKey="label" tickLine={false} type="category" width={150} />
              <Tooltip
                formatter={(_, __, item) => [item.payload.value, 'Value']}
                contentStyle={{
                  border: '1px solid #e5e5e5',
                  borderRadius: 0,
                  boxShadow: '0 12px 36px rgba(0,0,0,0.08)',
                }}
              />
              <Bar dataKey="amount" radius={0}>
                {data.map((_, index) => (
                  <Cell fill={index % 2 === 0 ? red : softRed} key={index} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

export function EdgeBarChart({ data }: { data: BarDatum[] }) {
  return (
    <Card className="chart-card-shell">
      <CardHeader>
        <CardTitle>Core sources of edge</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="edge-chart-frame">
          <ResponsiveContainer height="100%" width="100%">
            <BarChart data={data} margin={{ bottom: 0, left: 0, right: 8, top: 8 }}>
              <CartesianGrid stroke="#eeeeee" vertical={false} />
              <XAxis axisLine={false} dataKey="label" tickLine={false} tickMargin={10} />
              <YAxis axisLine={false} tickLine={false} width={36} />
              <Tooltip
                formatter={(_, __, item) => [item.payload.value, 'Value']}
                contentStyle={{
                  border: '1px solid #e5e5e5',
                  borderRadius: 0,
                  boxShadow: '0 12px 36px rgba(0,0,0,0.08)',
                }}
              />
              <Bar dataKey="amount" radius={0}>
                {data.map((_, index) => (
                  <Cell fill={[red, softRed, darkRed][index % 3]} key={index} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
