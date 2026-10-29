export type PageId = 'home' | 'research' | 'strategy' | 'company'
export const siteUrl = 'https://formenos.ai'
export const pageMetadata: Record<PageId, { path: string; title: string; description: string }> = {
  home: {
    path: '/',
    title: 'Formenos Technologies',
    description: 'Formenos is an AI-native hedge fund managing public-market capital for Silicon Valley founders and early-stage investors. Discover our firm and approach.',
  },
  research: {
    path: '/approach/',
    title: 'Investment Approach | Formenos',
    description: 'Explore Formenos’s approach to public-market investing: an independent investment perspective, technology at the foundation, and a long-term focus.',
  },
  strategy: {
    path: '/investors/',
    title: 'For Founders & Early-Stage Investors | Formenos',
    description: 'Dedicated public-market capital management for founders and early-stage investors. Learn how Formenos serves investors focused on building and backing companies.',
  },
  company: {
    path: '/firm/',
    title: 'Our Firm | Formenos',
    description: 'Meet Formenos, an AI-native hedge fund built within Silicon Valley to serve its founders and investors with dedicated public-market capital management.',
  },
}
export function getPageFromPath(path: string): PageId {
  return (Object.keys(pageMetadata) as PageId[]).find(page => pageMetadata[page].path === `${path.replace(/\/$/, '')}/`) ?? 'home'
}
export function updateMetadata(page: PageId) {
  const { title, description, path } = pageMetadata[page]
  document.title = title
  for (const [selector, value] of [
    ['meta[name="description"]', description],
    ['meta[property="og:title"]', title],
    ['meta[property="og:description"]', description],
    ['meta[property="og:url"]', siteUrl + path],
    ['meta[name="twitter:title"]', title],
    ['meta[name="twitter:description"]', description],
  ]) document.querySelector(selector)?.setAttribute('content', value)
  document.querySelector('link[rel="canonical"]')?.setAttribute('href', siteUrl + path)
}
