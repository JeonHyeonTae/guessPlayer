import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'
import { dirname, join, relative, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import { runInNewContext } from 'node:vm'

const publicDir = fileURLToPath(new URL('../public/', import.meta.url))
const redirectScript = readFileSync(join(publicDir, 'share/team-redirect.js'), 'utf8')
const teamBySegment = {
  '기아': 'kia', '두산': 'doosan', '롯데': 'lotte', '삼성': 'samsung',
  '엘지': 'lg', '키움': 'kiwoom', '한화': 'hanwha',
}

function htmlFiles(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const path = join(dir, entry.name)
    return entry.isDirectory() ? htmlFiles(path) : path.endsWith('/index.html') ? [path] : []
  })
}

function redirectFor(pathname, search = '') {
  let destination
  const window = {
    location: { pathname, search, replace: value => { destination = value } },
  }
  runInNewContext(redirectScript, { window, URLSearchParams, decodeURIComponent })
  return destination
}

test('all existing team share and legacy pages preserve their team and requested language', () => {
  const pages = htmlFiles(publicDir).filter(path =>
    readFileSync(path, 'utf8').includes('<script src="/share/team-redirect.js"></script>'))
  assert.equal(pages.length, 31)

  for (const page of pages) {
    const html = readFileSync(page, 'utf8')
    assert.match(html, /<meta name="robots" content="noindex"/)
    assert.match(html, /<link rel="canonical"/)
    assert.match(html, /<meta property="og:title"/)

    const route = `/${relative(publicDir, dirname(page)).split(sep).join('/')}/`
    const segment = decodeURIComponent(route.split('/').filter(Boolean).pop()).toLowerCase()
    const team = teamBySegment[segment] ?? segment
    const defaultLanguage = route.startsWith('/share/en/') ? 'en' : 'ko'

    for (const requestedLanguage of [null, 'ko', 'en']) {
      const lang = requestedLanguage ?? defaultLanguage
      const search = requestedLanguage ? `?lang=${requestedLanguage}` : ''
      const home = lang === 'en' ? '/en/' : '/'
      assert.equal(
        redirectFor(encodeURI(route), search),
        `${home}?team=${team}&lang=${lang}`,
        `${route}${search}`,
      )
      assert.equal(
        redirectFor(`${encodeURI(route)}index.html`, search),
        `${home}?team=${team}&lang=${lang}`,
        `${route}index.html${search}`,
      )
    }
  }
})
