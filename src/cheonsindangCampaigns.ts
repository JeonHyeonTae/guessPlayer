const baseballUrl = import.meta.env.VITE_BASEBALL_FORTUNE_URL?.trim() || 'https://www.fortelior.com/ko/baseball?from=guessPlayer'

const definitions = [
  { id: 'kia', name: 'KIA', accent: '#ff6b62' },
  { id: 'samsung', name: '삼성', accent: '#68b8ff' },
  { id: 'lotte', name: '롯데', accent: '#62ded2' },
  { id: 'lg', name: 'LG', accent: '#ff79b2' },
  { id: 'doosan', name: '두산', accent: '#a7caff' },
  { id: 'hanwha', name: '한화', accent: '#ffac59' },
  { id: 'kt', name: 'KT', accent: '#ff777b' },
  { id: 'nc', name: 'NC', accent: '#eccb87' },
] as const

export const cheonsindangCampaigns = definitions.map(campaign => {
  const configuredUrl = import.meta.env[`VITE_CHEONSINDANG_${campaign.id.toUpperCase()}_URL`]?.trim()
  const fallbackUrl = new URL(baseballUrl)
  fallbackUrl.searchParams.set('from', 'guessPlayer')
  fallbackUrl.searchParams.set('utm_source', 'guessPlayer')
  fallbackUrl.searchParams.set('utm_medium', 'banner')
  fallbackUrl.searchParams.set('utm_campaign', 'baseball_temperature')
  fallbackUrl.searchParams.set('utm_content', campaign.id)

  let href = fallbackUrl.toString()
  if (configuredUrl) {
    try {
      const url = new URL(configuredUrl)
      if (url.protocol === 'https:' || url.protocol === 'http:') href = url.toString()
    } catch {
      // Keep the baseball category destination if a campaign URL is malformed.
    }
  }

  return {
    ...campaign,
    image: `/ads/cheonsindang/${campaign.id}.png`,
    headline: `오늘 ${campaign.name}의${campaign.id === 'hanwha' ? '' : ' 기운,'}`,
    question: campaign.id === 'hanwha' ? '스트라이크 온도는?!' : '몇 도까지 달아오를까?',
    href,
    hasCustomDestination: href !== fallbackUrl.toString(),
  }
})

export type CheonsindangCampaign = Omit<typeof cheonsindangCampaigns[number], 'id' | 'name'> & { id: string; name: string }

const generalUrl = new URL(baseballUrl)
generalUrl.searchParams.set('from', 'guessPlayer')
generalUrl.searchParams.set('utm_source', 'guessPlayer')
generalUrl.searchParams.set('utm_medium', 'banner')
generalUrl.searchParams.set('utm_campaign', 'baseball_temperature')
generalUrl.searchParams.set('utm_content', 'general')

const generalCampaign: CheonsindangCampaign = {
  ...cheonsindangCampaigns[0],
  id: 'general',
  name: '포텔리어',
  headline: '오늘 우리의 기운,',
  href: generalUrl.toString(),
  hasCustomDestination: false,
}

export function campaignForTeams(teams: readonly string[]): CheonsindangCampaign {
  for (const team of teams) {
    const normalized = team.toLowerCase().replace(/\s/g, '')
    const campaign = cheonsindangCampaigns.find(({ id, name }) =>
      [id, name.toLowerCase(), ...(id === 'kia' ? ['기아'] : id === 'lg' ? ['엘지'] : [])]
        .some(alias => normalized.startsWith(alias)),
    )
    if (campaign) return campaign
  }
  // No selection, or only teams without artwork: don't advertise an unrelated team.
  return generalCampaign
}
