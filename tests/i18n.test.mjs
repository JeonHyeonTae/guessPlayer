import test from 'node:test'
import assert from 'node:assert/strict'
import { resolveLocale, localizedPath, playerName, playerHashtag, teamName, positionName, handName, isDailyUpdateWindow, formatRosterDate } from '../src/i18n-core.ts'

test('explicit link language overrides stored/browser language, with a stable English entry', () => {
  assert.equal(resolveLocale({ search: '?lang=en', stored: 'ko', browserLanguage: 'ko-KR' }), 'en')
  assert.equal(resolveLocale({ search: '?lang=ko', pathname: '/en/', stored: 'en', browserLanguage: 'en-US' }), 'ko')
  assert.equal(resolveLocale({ pathname: '/en/', stored: 'ko' }), 'en')
  assert.equal(resolveLocale({ stored: 'ko', browserLanguage: 'en-US' }), 'ko')
  assert.equal(resolveLocale({ search: '?lang=invalid', stored: 'invalid', browserLanguage: 'ko-KR' }), 'ko')
  assert.equal(resolveLocale({ browserLanguage: 'ja-JP' }), 'en')
  assert.equal(localizedPath('/game/123?ref=friend#board', 'en'), '/game/123?ref=friend&lang=en#board')
})

test('presentation translation preserves the Korean identity used in API payloads', () => {
  const player = { name: '양현종', nameEn: ' Yang Hyeon Jong ', team: 'KIA', position: '투수' }
  assert.equal(playerName(player, 'en'), 'Yang Hyeon Jong')
  assert.equal(playerName(player, 'ko'), '양현종')
  assert.equal(teamName(player.team, 'en'), 'KIA Tigers')
  assert.equal(teamName('삼성', 'en', true), 'Samsung')
  assert.equal(teamName('삼성', 'ko'), '삼성')
  assert.equal(teamName('kt 위즈', 'en'), 'KT Wiz')
  assert.equal(positionName(player.position, 'en'), 'Pitcher')
  assert.equal(positionName(player.position, 'en', true), 'P')
  assert.equal(handName('양', 'en'), 'S')
  assert.equal(player.name, '양현종')
  assert.equal(player.team, 'KIA')
  assert.equal(player.position, '투수')
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
