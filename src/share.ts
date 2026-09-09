import { playerHashtag, type Locale } from './i18n-core'

const GAME_URL = 'https://nu-kya.com/'
const shareTeamPaths = [
  { path: 'kt', aliases: ['kt', '케이티'] },
  { path: 'nc', aliases: ['nc'] },
  { path: 'ssg', aliases: ['ssg'] },
  { path: 'kia', aliases: ['기아', 'kia'] },
  { path: 'doosan', aliases: ['두산', 'doosan'] },
  { path: 'lotte', aliases: ['롯데', 'lotte'] },
  { path: 'samsung', aliases: ['삼성', 'samsung'] },
  { path: 'lg', aliases: ['엘지', 'lg'] },
  { path: 'kiwoom', aliases: ['키움', 'kiwoom'] },
  { path: 'hanwha', aliases: ['한화', 'hanwha'] },
]

export function sharePathForTeam(team: string) {
  const normalized = team.toLowerCase().replace(/\s/g, '')
  return shareTeamPaths.find(({ aliases }) => aliases.some(alias => normalized.includes(alias)))?.path ?? team.trim()
}

export function shareUrlForTeam(team: string, locale: Locale) {
  const teamPath = sharePathForTeam(team)
  if (locale === 'en') return new URL(`share/en/${encodeURIComponent(teamPath)}/`, GAME_URL).toString()
  const version = teamPath === 'lg' ? '20260907-v2' : '20260907'
  const url = new URL(`share/${version}/${encodeURIComponent(teamPath)}/`, GAME_URL)
  url.searchParams.set('lang', 'ko')
  return url.toString()
}

export function resultShareText(resultGrid: string, answer: { name: string; nameEn?: string | null; team: string }, locale: Locale) {
  const brandHashtag = locale === 'en' ? '#NuKya' : '#누크야'
  return `${resultGrid}\n\n${playerHashtag(answer, locale)}\n${brandHashtag}\n\n${shareUrlForTeam(answer.team, locale)}`
}
