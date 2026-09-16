import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const origin = 'https://nu-kya.com'
const pages = [
  { file: 'index.html', locale: 'ko', canonical: `${origin}/`, brand: '누크야!' },
  { file: 'en/index.html', locale: 'en', canonical: `${origin}/en/`, brand: 'Nu-Kya!' },
]
const alternates = { ko: `${origin}/`, en: `${origin}/en/`, 'x-default': `${origin}/` }
const read = path => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')
const attributes = tag => Object.fromEntries([...tag.matchAll(/([\w:-]+)="([^"]*)"/g)].map(([, key, value]) => [key, value]))
const tags = (html, name) => [...html.matchAll(new RegExp(`<${name}\\b[^>]*>`, 'g'))].map(([tag]) => attributes(tag))

test('static entry pages keep their own language, title and canonical for search and share crawlers', () => {
  for (const { file, locale, canonical, brand } of pages) {
    const html = read(file)
    assert.equal(tags(html, 'html')[0].lang, locale, file)
    assert.ok(html.match(/<title>([^<]+)<\/title>/)?.[1].startsWith(brand), file)
    assert.deepEqual(tags(html, 'link').filter(tag => tag.rel === 'canonical').map(tag => tag.href), [canonical], file)

    const metas = tags(html, 'meta')
    assert.equal(metas.find(tag => tag.property === 'og:url')?.content, canonical, file)
    assert.equal(metas.find(tag => tag.property === 'og:locale')?.content, locale === 'ko' ? 'ko_KR' : 'en_US', file)
    const description = metas.find(tag => tag.name === 'description')?.content
    assert.ok(description, file)
    assert.equal(/[가-힣]/.test(description), locale === 'ko', file)
    assert.ok(!metas.find(tag => tag.name === 'robots')?.content.includes('noindex'), file)

    const structuredData = [...html.matchAll(/(<script\b[^>]*>)([\s\S]*?)<\/script>/g)]
      .filter(([, tag]) => attributes(tag).type === 'application/ld+json')
      .map(([, , json]) => JSON.parse(json)).find(data => data['@type'] === 'WebSite')
    assert.equal(structuredData?.url, canonical, file)
    assert.equal(structuredData?.inLanguage, locale, file)
    assert.equal(structuredData?.name, brand, file)
  }
})

test('both search entry pages publish reciprocal language alternatives with Korean as the default', () => {
  for (const { file } of pages) {
    const links = tags(read(file), 'link').filter(tag => tag.rel === 'alternate')
    assert.deepEqual(Object.fromEntries(links.map(tag => [tag.hreflang, tag.href])), alternates, file)
  }
})

test('robots and sitemap expose both canonical entry pages and matching language alternatives', () => {
  const robots = read('public/robots.txt')
  assert.match(robots, /^User-agent:\s*\*\s*$/m)
  assert.match(robots, /^Allow:\s*\/\s*$/m)
  assert.doesNotMatch(robots, /^Disallow:\s*\/\s*$/m)
  assert.ok(robots.includes(`Sitemap: ${origin}/sitemap.xml`))

  const entries = [...read('public/sitemap.xml').matchAll(/<url>([\s\S]*?)<\/url>/g)].map(([, entry]) => entry)
  assert.deepEqual(entries.map(entry => entry.match(/<loc>([^<]+)<\/loc>/)?.[1]), pages.map(page => page.canonical))
  for (const entry of entries) {
    assert.deepEqual(Object.fromEntries(tags(entry, 'xhtml:link').map(tag => [tag.hreflang, tag.href])), alternates)
  }
})
