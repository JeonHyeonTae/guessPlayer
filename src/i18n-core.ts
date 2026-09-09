export type Locale = 'ko' | 'en'

// API values remain unchanged; every team label displays only its company name.
const teams: Array<{ aliases: string[]; ko: string; en: string }> = [
  { aliases: ['KIA', '기아'], ko: 'KIA', en: 'KIA' },
  { aliases: ['LG', '엘지'], ko: 'LG', en: 'LG' },
  { aliases: ['삼성', 'Samsung'], ko: '삼성', en: 'Samsung' },
  { aliases: ['두산', 'Doosan'], ko: '두산', en: 'Doosan' },
  { aliases: ['KT', '케이티'], ko: 'KT', en: 'KT' },
  { aliases: ['SSG'], ko: 'SSG', en: 'SSG' },
  { aliases: ['롯데', 'Lotte'], ko: '롯데', en: 'Lotte' },
  { aliases: ['한화', 'Hanwha'], ko: '한화', en: 'Hanwha' },
  { aliases: ['NC'], ko: 'NC', en: 'NC' },
  { aliases: ['키움', 'Kiwoom'], ko: '키움', en: 'Kiwoom' },
]
const normalizeTeam = (value: string) => value.toLowerCase().replace(/\s/g, '')
export function teamName(team: string, locale: Locale) {
  const normalized = normalizeTeam(team)
  const match = teams.find(entry => entry.aliases.some(alias => normalized.startsWith(normalizeTeam(alias))))
  return match ? match[locale] : team
}
const positions: Record<string, [string, string]> = {
  '감독': ['Manager', 'Mgr'], '코치': ['Coach', 'Coach'], '투수': ['Pitcher', 'P'],
  '포수': ['Catcher', 'C'], '내야수': ['Infielder', 'IF'], '외야수': ['Outfielder', 'OF'],
}
export function positionName(position: string, locale: Locale, short = false) {
  return locale === 'en' ? positions[position]?.[short ? 1 : 0] ?? position : position
}
export function handName(hand: string, locale: Locale) {
  if (locale === 'ko') return hand
  return ({ '좌': 'L', '우': 'R', '양': 'S', '좌투': 'L', '우투': 'R', '좌타': 'L', '우타': 'R', '양타': 'S' } as Record<string, string>)[hand] ?? hand
}
export function playerName(player: { name: string; nameEn?: string | null }, locale: Locale) {
  return locale === 'en' ? player.nameEn?.trim() || player.name : player.name
}
export function playerHashtag(player: { name: string; nameEn?: string | null }, locale: Locale) {
  return `#${playerName(player, locale).replace(/[^\p{L}\p{M}\p{N}_]/gu, '')}`
}

export function resolveLocale({ search = '', pathname = '/', stored, browserLanguage = 'ko' }: {
  search?: string; pathname?: string; stored?: string | null; browserLanguage?: string
}): Locale {
  const requested = new URLSearchParams(search).get('lang')
  if (requested === 'ko' || requested === 'en') return requested
  if (/^\/en\/?$/.test(pathname)) return 'en'
  if (stored === 'ko' || stored === 'en') return stored
  return browserLanguage.toLowerCase().startsWith('ko') ? 'ko' : 'en'
}

export function localizedPath(path: string, locale: Locale) {
  const url = new URL(path, 'https://nu-kya.com')
  if (url.pathname === '/' || /^\/en\/?$/.test(url.pathname)) {
    url.pathname = locale === 'en' ? '/en/' : '/'
  }
  url.searchParams.set('lang', locale)
  return `${url.pathname}${url.search}${url.hash}`
}

export function isDailyUpdateWindow(now = new Date()) {
  const seoul = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Seoul', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(now)
  return seoul.find(part => part.type === 'hour')?.value === '04' && Number(seoul.find(part => part.type === 'minute')?.value) < 5
}

export function formatRosterDate(value: string | null, locale: Locale) {
  if (!value) return locale === 'ko' ? '동기화 전' : 'Not synced yet'
  if (locale === 'ko') return value.replaceAll('-', '.')
  const date = new Date(`${value}T00:00:00Z`)
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' }).format(date)
}

export const english = {
  '누크야': 'Nu-Kya',
  '누크야!': 'Nu-Kya!',
  '누크야! 메인으로': 'Nu-Kya! Home',
  '출제 대상': 'Include',
  '선수만': 'Players only',
  '감독·코치 제외': 'No managers or coaches',
  '감독·코치 포함': 'Players & staff',
  '스태프까지 함께 출제': 'Include managers & coaches',
  '구단별 게임 링크 공유하기': 'Share a team game link',
  '복사됐습니다': 'Copied!',
  '게임 링크 공유하기': 'Share game link',
  '복사됨': 'Copied',
  '공유': 'Share',
  '공유할 구단 선택': 'Choose a team to share',
  '공유할 구단을 선택하세요': 'Choose a team to share',
  '구단 목록을 불러오는 중…': 'Loading teams…',
  '선수 명단 기준일': 'Roster as of',
  '선수 명단 기준 설명 보기': 'About the roster date',
  '표시된 기준일의 1군 등록 명단을 기준으로 하며, 매일 전날 명단으로 갱신됩니다.': 'First-team eligibility uses the registered roster for the displayed date. It is refreshed daily using the previous day’s roster.',
  '선수 수': 'Players',
  '시도': 'Guesses',
  '게임 규칙 보기': 'How to play',
  '어떻게 맞히나요?': 'How to play',
  '닫기': 'Close',
  '선수 정보를 비교하며 숨겨진 한국 프로야구 선수를 최대 9번 안에 맞혀보세요.': 'Compare player details to identify the mystery baseball player in 9 guesses or fewer.',
  '게임 범위를 정해요': 'Choose your pool',
  '출제 구단과 1군·퓨처스, 감독·코치 포함 여부를 선택하면 정답 선수가 정해집니다.': 'Choose teams, first-team or Futures rosters, and whether to include managers and coaches.',
  '선수를 추측해요': 'Make a guess',
  '선수명을 두 글자 이상 입력하고 검색 결과에서 선수를 선택하세요. 명단에서 출제 가능한 선수도 확인할 수 있어요.': 'Enter at least two characters of a player’s name in English or Korean, then choose a search result. Open Roster to see eligible players.',
  '단서를 비교해요': 'Compare the clues',
  '구단, 등번호, 포지션, 투구·타석, 출생연도, 키와 몸무게를 보고 다음 선수를 추리하세요.': 'Use the team, jersey number, position, throwing hand, batting side, birth year, height, and weight to narrow down your next guess.',
  '결과 표시 설명': 'Clue color guide',
  '일치': 'Match',
  '다름': 'Different',
  '정답과 같아요': 'Exact match',
  '초록색으로 표시됩니다.': 'Shown in green.',
  '정답과 달라요': 'No match',
  '회색으로 표시됩니다.': 'Shown in gray.',
  '정답 값이 더 커요': 'The answer is higher',
  '더 높은 숫자를 찾아보세요.': 'Look for a larger number.',
  '정답 값이 더 작아요': 'The answer is lower',
  '더 낮은 숫자를 찾아보세요.': 'Look for a smaller number.',
  '↑·↓ 표시는 등번호, 출생연도, 키, 몸무게에서 다음 추측의 방향을 알려줍니다.': 'Arrows guide your next guess for jersey number, birth year, height, and weight. P = pitcher, C = catcher, IF = infielder, OF = outfielder; L/R = left/right, S = switch.',
  '구단 선택': 'Teams',
  '선수': 'Player',
  '구단': 'Team',
  '등번호': 'No.',
  '포지션': 'Pos.',
  '투구': 'Throws',
  '타석': 'Bats',
  '출생연도': 'Born',
  '키': 'cm',
  '몸무게': 'kg',
  '로딩 중…': 'Loading…',
  '게임을 선택해주세요.': 'Choose your game settings.',
  '한 개 이상의 구단을 선택해주세요.': 'Choose at least one team.',
  '새 게임을 시작하지 못했습니다. 백엔드 연결을 확인해주세요.': 'Could not start a game. Please try again shortly.',
  '정답입니다!': 'You got it!',
  '아쉽지만, 이번 문제는 여기까지예요.': 'That’s the end of this round.',
  '추리 요청에 실패했습니다. 잠시 후 다시 시도해주세요.': 'Could not submit your guess. Please try again.',
  '선수 명단을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.': 'Could not load the roster. Please try again.',
  '구단 목록을 불러오지 못했습니다.': 'Could not load the teams. Please try again.',
  '선수단 정보를 업데이트하고 있습니다.': 'Updating player rosters.',
  '매일 새벽 4:00~4:05에는 최신 선수 정보 반영을 위해 잠시 이용할 수 없습니다.': 'The game pauses daily from 4:00–4:05 AM Korea Standard Time (UTC+9) while player information is updated.',
  '라이트 모드': 'Light mode',
  '다크 모드': 'Dark mode',
  '한국 프로야구': 'Know your baseball?',
  '선수를 맞혀보세요.': 'Guess the player.',
  '구단을 선택하면 해당 구단 선수 중 한 명이 정답으로 출제됩니다.': 'Choose your teams and uncover a mystery Korean baseball player.',
  '1군': 'First team',
  '현역 1군 선수': 'Active first-team roster',
  '1군 + 퓨처스': 'First team + Futures',
  '더 넓은 로스터': 'Include the Futures League',
  '출제 구단': 'Teams to include',
  '전체 해제': 'Clear all',
  '전체 선택': 'Select all',
  '게임 시작 중…': 'Starting game…',
  '선택한 구단으로 시작하기': 'Start guessing',
  '선수 맞추기': 'Guess the player',
  '새 게임 시작': 'Start a new game',
  '명단': 'Roster',
  '현재 출제 구단': 'Teams in this game',
  '선수명 2글자 이상 입력': 'Player name (at least 2 characters)',
  '게임 결과': 'Game result',
  '정답 선수': 'The mystery player',
  '결과 복사됨': 'Result copied',
  '결과 복사하기': 'Copy result',
  '시작 중…': 'Starting…',
  '새 게임': 'New game',
  '전체 선수 명단': 'Player roster',
  '현재 게임에서 선택한 구단의 선수 명단입니다.': 'Players from the teams included in your current game.',
  '구단을 고르면 포지션별로 확인할 수 있어요.': 'Choose a team to browse players by position.',
  '1군 선수': 'First team',
  '퓨처스 선수': 'Futures',
  '선수 명단을 불러오는 중…': 'Loading roster…',
  '다음 게임 설정': 'Next game settings',
  '다음 게임 출제 구단': 'Set up your next game',
  '게임을 시작하면 아래 설정으로 새로운 정답 선수가 출제됩니다.': 'Starting a game picks a new mystery player using these settings.',
  '선수 검색 결과': 'Player search results',
  '선수를 찾지 못했습니다. 다른 이름으로 검색해주세요.': 'No players found. Try another name.',
  '선수 검색 중…': 'Searching players…',
  '선수를 검색하지 못했습니다. 잠시 후 다시 시도해주세요.': 'Could not search players. Please try again.',
  '클립보드 복사에 실패했습니다. 다시 시도해주세요.': 'Could not copy to the clipboard. Please try again.',
} as const

export type TranslationKey = keyof typeof english
export function translate(key: TranslationKey, locale: Locale): string {
  return locale === 'en' ? english[key] : key
}
