import { createServer } from 'vite'
import { renderToString } from 'react-dom/server'
import { createElement } from 'react'
import { readFile, writeFile, mkdir } from 'node:fs/promises'

const server = await createServer({ server: { middlewareMode: true }, appType: 'custom' })
try {
  const { default: App } = await server.ssrLoadModule('/src/App.tsx')
  const { pageMetadata, siteUrl } = await server.ssrLoadModule('/src/seo.ts')
  const template = await readFile('dist/index.html', 'utf8')
  const escape = value => value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
  for (const [page, { path, title, description }] of Object.entries(pageMetadata)) {
    let html = template.replace(/<title>.*?<\/title>/, `<title>${escape(title)}</title>`)
    for (const [key, value] of Object.entries({ description, 'og:title': title, 'og:description': description, 'og:url': siteUrl + path, 'twitter:title': title, 'twitter:description': description })) {
      html = html.replace(new RegExp(`(<meta (?:name|property)="${key}"\\s+content=")[^"]*("\\s*/>)`), (_, before, after) => before + escape(value) + after)
    }
    html = html.replace(/(<link rel="canonical" href=")[^"]*/, `$1${siteUrl}${path}`)
    html = html.replace('<div id="root"></div>', () => `<div id="root">${renderToString(createElement(App, { initialPage: page }))}</div>`)
    const schema = { '@context': 'https://schema.org', '@type': 'Organization', name: 'Formenos', url: siteUrl + '/', logo: siteUrl + '/formenos-logo.png', email: 'sebastian@formenos.ai' }
    html = html.replace('</head>', `<script type="application/ld+json">${JSON.stringify(schema)}</script></head>`)
    await mkdir(`dist${path}`, { recursive: true })
    await writeFile(`dist${path}index.html`, html)
  }
  await writeFile('dist/sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${Object.values(pageMetadata).map(({ path }) => `<url><loc>${siteUrl}${path}</loc></url>`).join('')}</urlset>\n`)
  await writeFile('dist/robots.txt', `User-agent: *\nAllow: /\n\nSitemap: ${siteUrl}/sitemap.xml\n`)
} finally {
  await server.close()
}
