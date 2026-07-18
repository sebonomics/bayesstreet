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
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'

const red = '#c1121f'
const softRed = '#e54b4b'
const darkRed = '#5c0c12'

const returnSeries = [
  { period: 'Start', fund: 100, benchmark: 100 },
  { period: 'Jan', fund: 100.93, benchmark: 101.37 },
  { period: 'Feb', fund: 95.84, benchmark: 100.49 },
  { period: 'Mar', fund: 93.1, benchmark: 95.37 },
  { period: 'Apr', fund: 104.49, benchmark: 105.31 },
  { period: 'May', fund: 116.46, benchmark: 110.73 },
  { period: 'Jun', fund: 112.77, benchmark: 109.55 },
]

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
  return (
    <div className="hero-chart-shell">
      <div className="hero-chart-main">
        <div className="hero-chart-metrics">
          <div>
            <span className="legend-dot fund-dot">BayesStreet AI Fund</span>
            <strong>+12.77%</strong>
          </div>
          <div>
            <span className="legend-dot benchmark-dot">S&amp;P 500</span>
            <strong>+9.55%</strong>
          </div>
        </div>

        <div className="hero-range-tabs" aria-label="Chart range">
          <button className="active" type="button">6M</button>
        </div>

        <div className="hero-chart-frame">
          <ResponsiveContainer height="100%" width="100%">
            <LineChart data={returnSeries} margin={{ bottom: 18, left: 0, right: 16, top: 20 }}>
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
                  `$${Number(value).toFixed(2)}`,
                  name === 'fund' ? 'BayesStreet AI Fund' : 'S&P 500',
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
          <span>December 31, 2025</span>
          <span>June 30, 2026</span>
        </div>
      </div>

      <aside className="hero-return-card">
        <p>
          Across its first six tested months, BayesStreet compounded to{' '}
          <strong>+12.77%</strong> versus <strong>+9.55%</strong> for the S&amp;P 500, an
          outperformance of <strong>3.22 percentage points</strong>.
        </p>
      </aside>
    </div>
  )
}

export function ReturnsLineChart() {
  return (
    <Card className="chart-card-shell">
      <CardHeader>
        <CardTitle>Six-Month Growth Of $100</CardTitle>
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
