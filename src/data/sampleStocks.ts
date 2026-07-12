import type { PriceBar, StockSetup } from '../lib/strategy'

const startDate = Date.UTC(2026, 0, 5)

function makeBars(closes: number[]): PriceBar[] {
  return closes.map((close, index) => ({
    date: new Date(startDate + index * 86_400_000).toISOString().slice(0, 10),
    close,
  }))
}

function range(length: number, getValue: (index: number) => number) {
  return Array.from({ length }, (_, index) => Number(getValue(index).toFixed(2)))
}

const nflxCloses = [
  ...range(45, (index) => 74 + Math.sin(index / 3) * 0.8),
  73.4,
  73.1,
  72.9,
  73.2,
  73.5,
  76,
]

const nvdaCloses = [
  ...range(46, (index) => 148 + index * 0.08 + Math.sin(index / 4)),
  149.2,
  150,
  152.4,
  154.1,
  156.2,
  157.8,
]

const metaCloses = [
  ...range(46, (index) => 303 + Math.sin(index / 5) * 2),
  301.5,
  300,
  298.2,
  296.1,
  294.3,
  293.8,
]

const amznCloses = [
  ...range(46, (index) => 248 + index * 0.05 + Math.sin(index / 4)),
  249.1,
  250,
  252.2,
  254.6,
  256.7,
  258.1,
]

const msftCloses = [
  ...range(46, (index) => 420 + Math.sin(index / 3) * 1.6),
  421.2,
  420.8,
  420.1,
  419.7,
  420.4,
  421,
]

export const sampleStocks: StockSetup[] = [
  {
    symbol: 'NFLX',
    name: 'Netflix',
    bars: makeBars(nflxCloses),
  },
  {
    symbol: 'NVDA',
    name: 'Nvidia',
    bars: makeBars(nvdaCloses),
    position: {
      entryDate: makeBars(nvdaCloses)[47].date,
      entryPrice: 150,
    },
  },
  {
    symbol: 'META',
    name: 'Meta',
    bars: makeBars(metaCloses),
    position: {
      entryDate: makeBars(metaCloses)[47].date,
      entryPrice: 300,
    },
  },
  {
    symbol: 'AMZN',
    name: 'Amazon',
    bars: makeBars(amznCloses),
    position: {
      entryDate: makeBars(amznCloses)[47].date,
      entryPrice: 250,
    },
  },
  {
    symbol: 'MSFT',
    name: 'Microsoft',
    bars: makeBars(msftCloses),
  },
]
