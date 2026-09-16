import test from 'node:test'
import assert from 'node:assert/strict'
import { resolveLocale, localizedPath, playerName, playerHashtag, teamName, positionName, handName, isDailyUpdateWindow, formatRosterDate } from '../src/i18n-core.ts'

const homePaths = [['/', 'ko'], ['/index.html', 'ko'], ['/en', 'en'], ['/en/', 'en'], ['/en/index.html', 'en']]

test('homepage language stays tied to its URL for visitors and crawlers in any language', () => {
  for (const [pathname, expected] of homePaths) {
    for (const stored of [null, 'ko', 'en', 'invalid']) {
      for (const browserLanguage of ['ko-KR', 'en-US', 'ja-JP']) {
        for (const search of ['', '?lang=invalid', '?ref=friend']) {
          assert.equal(resolveLocale({ pathname, search, stored, browserLanguage }), expected,
            JSON.stringify({ pathname, search, stored, browserLanguage }))
        }
      }
    }
  }
})

test('explicit link language overrides homepage language and saved preferences', () => {
  for (const pathname of [...homePaths.map(([path]) => path), '/game/123']) {
    assert.equal(resolveLocale({ pathname, search: '?lang=en', stored: 'ko', browserLanguage: 'ko-KR' }), 'en')
    assert.equal(resolveLocale({ pathname, search: '?lang=ko', stored: 'en', browserLanguage: 'en-US' }), 'ko')
  }
})

test('game URLs retain saved and browser language fallback', () => {
  const pathname = '/game/123'
  assert.equal(resolveLocale({ pathname, stored: 'ko', browserLanguage: 'en-US' }), 'ko')
  assert.equal(resolveLocale({ pathname, stored: 'en', browserLanguage: 'ko-KR' }), 'en')
  assert.equal(resolveLocale({ pathname, search: '?lang=invalid', stored: 'invalid', browserLanguage: 'ko-KR' }), 'ko')
  assert.equal(resolveLocale({ pathname, browserLanguage: 'ja-JP' }), 'en')
  assert.equal(resolveLocale({ pathname, browserLanguage: 'en-US' }), 'en')
})

test('homepage URLs normalize without duplicate language queries and preserve navigation context', () => {
  for (const [pathname] of homePaths) {
    for (const locale of ['ko', 'en']) {
      const expectedHome = locale === 'ko' ? '/' : '/en/'
      assert.equal(localizedPath(pathname, locale), expectedHome)
      const localized = localizedPath(`https://nu-kya.com${pathname}?lang=ko&ref=friend&lang=en#rules`, locale)
      assert.equal(localized, `${expectedHome}?ref=friend#rules`)
      assert.equal(localizedPath(localized, locale), localized)
    }
  }
  assert.equal(localizedPath('/game/123?ref=friend#board', 'en'), '/game/123?ref=friend&lang=en#board')
  assert.equal(localizedPath('/game/123?ref=friend&lang=en#board', 'ko'), '/game/123?ref=friend&lang=ko#board')
})

test('presentation translation preserves the Korean identity used in API payloads', () => {
  const player = { name: '양현종', nameEn: ' Yang Hyeon Jong ', team: 'KIA', position: '투수' }
  assert.equal(playerName(player, 'en'), 'Yang Hyeon Jong')
  assert.equal(playerName(player, 'ko'), '양현종')
  assert.equal(teamName(player.team, 'en'), 'KIA')
  assert.equal(teamName('삼성', 'en'), 'Samsung')
  assert.equal(teamName('삼성', 'ko'), '삼성')
  assert.equal(teamName('kt 위즈', 'en'), 'KT')
  assert.equal(positionName(player.position, 'en'), 'Pitcher')
  assert.equal(positionName(player.position, 'en', true), 'P')
  assert.equal(handName('양', 'en'), 'S')
  assert.equal(player.name, '양현종')
  assert.equal(player.team, 'KIA')
  assert.equal(player.position, '투수')
})

test('full team names from either language display only the company name', () => {
  const teams = [
    ['KIA 타이거즈', 'KIA Tigers', 'KIA', 'KIA'],
    ['LG 트윈스', 'LG Twins', 'LG', 'LG'],
    ['삼성 라이온즈', 'Samsung Lions', '삼성', 'Samsung'],
    ['두산 베어스', 'Doosan Bears', '두산', 'Doosan'],
    ['KT 위즈', 'KT Wiz', 'KT', 'KT'],
    ['SSG 랜더스', 'SSG Landers', 'SSG', 'SSG'],
    ['롯데 자이언츠', 'Lotte Giants', '롯데', 'Lotte'],
    ['한화 이글스', 'Hanwha Eagles', '한화', 'Hanwha'],
    ['NC 다이노스', 'NC Dinos', 'NC', 'NC'],
    ['키움 히어로즈', 'Kiwoom Heroes', '키움', 'Kiwoom'],
  ]
  for (const [fullKo, fullEn, companyKo, companyEn] of teams) {
    for (const input of [fullKo, fullEn, companyKo, companyEn.toLowerCase()]) {
      assert.equal(teamName(input, 'ko'), companyKo)
      assert.equal(teamName(input, 'en'), companyEn)
    }
  }
  assert.equal(teamName(' 기아 ', 'ko'), 'KIA')
  assert.equal(teamName('엘지', 'en'), 'LG')
})

test('Futures-only teams have English labels and keep distinct API identities', () => {
  const extraTeams = [['고양', 'Goyang'], ['상무', 'Sangmu'], ['울산', 'Ulsan']]
  for (const [ko, en] of extraTeams) {
    assert.equal(teamName(ko, 'en'), en)
    assert.equal(teamName(ko, 'ko'), ko)
    assert.equal(teamName(en.toLowerCase(), 'en'), en)
    assert.equal(teamName(en, 'ko'), ko)
  }
  assert.notEqual(teamName('고양', 'en'), teamName('키움', 'en'))
})

test('legacy responses keep a visible player name and result hashtags never contain spaces', () => {
  assert.equal(playerName({ name: '김도영' }, 'en'), '김도영')
  assert.equal(playerName({ name: '김도영', nameEn: '  ' }, 'en'), '김도영')
  assert.equal(playerHashtag({ name: '양현종', nameEn: 'Yang  Hyeon\tJong' }, 'en'), '#YangHyeonJong')
  assert.equal(playerHashtag({ name: '양현종', nameEn: 'Yang Hyeon Jong' }, 'ko'), '#양현종')
  assert.equal(playerHashtag({ name: '오닐', nameEn: "O’Neil-Smith Jr." }, 'en'), '#ONeilSmithJr')
})

test('maintenance applies at 04:00–04:05 in Korea, regardless of client timezone', () => {
  assert.equal(isDailyUpdateWindow(new Date('2026-09-08T18:59:59Z')), false)
  assert.equal(isDailyUpdateWindow(new Date('2026-09-08T19:00:00Z')), true)
  assert.equal(isDailyUpdateWindow(new Date('2026-09-08T19:04:59Z')), true)
  assert.equal(isDailyUpdateWindow(new Date('2026-09-08T19:05:00Z')), false)
  assert.equal(isDailyUpdateWindow(new Date('2026-09-08T04:02:00Z')), false)
  assert.equal(formatRosterDate('2026-09-08', 'en'), 'Sep 8, 2026')
  assert.equal(formatRosterDate('2026-09-08', 'ko'), '2026.09.08')
  assert.equal(formatRosterDate(null, 'en'), 'Not synced yet')
})
