import type { CSSProperties } from 'react'
import { cheonsindangCampaigns, type CheonsindangCampaign } from './cheonsindangCampaigns'
import { useI18n } from './i18n'

const englishCompanies: Record<string, string> = {
  kia: 'KIA', samsung: 'Samsung', lotte: 'Lotte', lg: 'LG', doosan: 'Doosan',
  hanwha: 'Hanwha', kt: 'KT', nc: 'NC', ssg: 'SSG', kiwoom: 'Kiwoom',
}

export function CheonsindangBanner({ campaign }: { campaign: CheonsindangCampaign }) {
  const { locale } = useI18n()
  const english = locale === 'en'
  const headline = english ? (campaign.id === 'general' ? "Today's baseball energy" : `${englishCompanies[campaign.id] ?? campaign.name}'s energy today`) : campaign.headline
  const question = english ? 'How high will it rise?' : campaign.question
  return (
    <a
      className="ad-fallback temperature-banner"
      href={campaign.href}
      target="_blank"
      rel="noopener noreferrer sponsored"
      aria-label={english ? `${headline}. ${question} Explore on Fortelior (opens in a new tab, Korean website)` : `${headline} ${question} 포텔리어에서 확인하기 (새 창)`}
      style={{ '--campaign-accent': campaign.accent, backgroundImage: `url("${campaign.image}")` } as CSSProperties}
      data-campaign={campaign.id}
    >
      <span className="ad-fallback-copy">
        <small>{english ? 'Fortelior' : '포텔리어'} <span>{english ? 'Baseball energy' : '오늘의 야구 기운'}</span></small>
        <strong>{headline}{question && <><br />{question}</>}</strong>
        <em>{english ? 'Explore today (Korean)' : '오늘의 기운 확인하기'} <span aria-hidden="true">↗</span></em>
      </span>
      <span className="temperature-ad-label">{english ? 'Ad' : '광고'}</span>
    </a>
  )
}

// Local-only gallery: /?banner-preview=1. Uses the real banner and link configuration.
export function CheonsindangBannerPreview() {
  const { locale } = useI18n()
  const english = locale === 'en'
  return (
    <main className="banner-preview">
      <p>{english ? 'Fortelior' : '포텔리어'} × BASEBALL</p>
      <h1>{english ? "How high is today's energy?" : '오늘의 기운, 몇 도까지?'}</h1>
      <p>{english ? `${cheonsindangCampaigns.length} company banners · Wide / Mobile / Sidebar` : `기업명만 담은 ${cheonsindangCampaigns.length}가지 배너 · 가로형 / 모바일 / 사이드`}</p>
      {cheonsindangCampaigns.map(campaign => (
        <section key={campaign.id}>
          <h2>{english ? englishCompanies[campaign.id] : campaign.name} <small>{english ? (campaign.hasCustomDestination ? 'Custom destination' : 'Baseball page + campaign tracking') : (campaign.hasCustomDestination ? '개별 목적지 연결됨' : '오늘의 야구 + 기업별 UTM')}</small></h2>
          <div className="ad-banner preview-wide"><CheonsindangBanner campaign={campaign} /></div>
          <div className="preview-formats">
            <div className="ad-banner preview-mobile"><CheonsindangBanner campaign={campaign} /></div>
            <div className="ad-banner side-ad preview-side"><CheonsindangBanner campaign={campaign} /></div>
          </div>
        </section>
      ))}
    </main>
  )
}
