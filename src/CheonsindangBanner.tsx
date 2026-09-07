import type { CSSProperties } from 'react'
import { cheonsindangCampaigns, type CheonsindangCampaign } from './cheonsindangCampaigns'

export function CheonsindangBanner({ campaign }: { campaign: CheonsindangCampaign }) {
  return (
    <a
      className="ad-fallback temperature-banner"
      href={campaign.href}
      target="_blank"
      rel="noopener noreferrer sponsored"
      aria-label={`${campaign.headline} ${campaign.question} 포텔리어에서 확인하기 (새 창)`}
      style={{ '--campaign-accent': campaign.accent, backgroundImage: `url("${campaign.image}")` } as CSSProperties}
      data-campaign={campaign.id}
    >
      <span className="ad-fallback-copy">
        <small>포텔리어 <span>오늘의 야구 기운</span></small>
        <strong>{campaign.headline}{campaign.question && <><br />{campaign.question}</>}</strong>
        <em>오늘의 기운 확인하기 <span aria-hidden="true">↗</span></em>
      </span>
      <span className="temperature-ad-label">광고</span>
    </a>
  )
}

// Local-only gallery: /?banner-preview=1. Uses the real banner and link configuration.
export function CheonsindangBannerPreview() {
  return (
    <main className="banner-preview">
      <p>포텔리어 × BASEBALL</p>
      <h1>오늘의 기운, 몇 도까지?</h1>
      <p>기업명만 담은 {cheonsindangCampaigns.length}가지 배너 · 가로형 / 모바일 / 사이드</p>
      {cheonsindangCampaigns.map(campaign => (
        <section key={campaign.id}>
          <h2>{campaign.name} <small>{campaign.hasCustomDestination ? '개별 목적지 연결됨' : '오늘의 야구 + 기업별 UTM'}</small></h2>
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
