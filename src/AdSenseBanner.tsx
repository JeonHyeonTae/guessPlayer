import { useEffect, useId, useRef, useState } from 'react'
import { CheonsindangBanner } from './CheonsindangBanner'
import { campaignForTeams, cheonsindangCampaigns, type CheonsindangCampaign } from './cheonsindangCampaigns'

declare global {
  interface Window {
    adsbygoogle?: unknown[]
  }
}

const ADSENSE_SCRIPT_ID = 'google-adsense-script'
const adsenseClient = import.meta.env.VITE_GOOGLE_ADSENSE_CLIENT || 'ca-pub-3077425787731419'
const adsenseSlot = import.meta.env.VITE_GOOGLE_ADSENSE_SLOT || '1905550513'
const mobileQuery = '(max-width: 600px)'

function CoupangBanner({ className = '', isMobile }: { className?: string; isMobile: boolean }) {
  // The Partners script writes its markup as it runs. Keeping it in an iframe
  // makes that write deterministic and confines the third-party markup.
  const config = isMobile
    ? '{"id":1025951,"template":"carousel","trackingCode":"AF0893994","width":"341","height":"86","tsource":""}'
    : '{"id":1025952,"template":"carousel","trackingCode":"AF0893994","width":"1070","height":"88","tsource":""}'
  const width = isMobile ? 341 : 1070
  const height = isMobile ? 86 : 88
  const markup = `<!doctype html><html lang="ko"><head><meta name="viewport" content="width=device-width, initial-scale=1"></head><body style="margin:0;overflow:hidden"><script src="https://ads-partners.coupang.com/g.js"></script><script>new PartnersCoupang.G(${config});</script></body></html>`

  return (
    <aside className={`ad-banner coupang-banner ${className}`.trim()} aria-label="쿠팡 파트너스 광고">
      <iframe
        title="쿠팡 파트너스 광고"
        srcDoc={markup}
        width={width}
        height={height}
        scrolling="no"
      />
    </aside>
  )
}

function loadAdSenseScript(client: string) {
  if (document.getElementById(ADSENSE_SCRIPT_ID)) return

  const script = document.createElement('script')
  script.id = ADSENSE_SCRIPT_ID
  script.async = true
  script.crossOrigin = 'anonymous'
  script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(client)}`
  document.head.append(script)
}

function AdSenseUnit({ className = '' }: { className?: string }) {
  const id = useId()
  const [campaign] = useState(() => cheonsindangCampaigns[Math.floor(Math.random() * cheonsindangCampaigns.length)])
  const pushedRef = useRef(false)
  const adFormat = className.includes('side-ad') ? 'auto' : 'horizontal'

  useEffect(() => {
    if (!adsenseClient || pushedRef.current) return

    loadAdSenseScript(adsenseClient)
    if (adsenseSlot) {
      window.adsbygoogle = window.adsbygoogle ?? []
      window.adsbygoogle.push({})
    }
    pushedRef.current = true
  }, [])

  if (!adsenseClient || !adsenseSlot) return null

  return (
    <aside className={`ad-banner ${className}`.trim()} aria-label="Advertisement">
      <ins
        key={id}
        className="adsbygoogle"
        style={{ display: 'block'}}
        data-ad-client={adsenseClient}
        data-ad-slot={adsenseSlot}
        data-ad-format={adFormat}
        data-full-width-responsive="true"
      />
      <CheonsindangBanner campaign={campaign} />
    </aside>
  )
}

function FortuneAdUnit({ className = '', campaign }: { className?: string; campaign: CheonsindangCampaign }) {
  return (
    <aside className={`ad-banner fortune-ad ${className}`.trim()} aria-label="포텔리어 광고">
      <CheonsindangBanner campaign={campaign} />
    </aside>
  )
}

export function DesktopSideAds({ campaign }: { campaign?: CheonsindangCampaign } = {}) {
  const [isDesktop, setIsDesktop] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(min-width: 1520px)')
    const update = () => setIsDesktop(mediaQuery.matches)

    update()
    mediaQuery.addEventListener('change', update)
    return () => mediaQuery.removeEventListener('change', update)
  }, [])

  if (!isDesktop) return null

  return (
    <>
      {campaign ? <FortuneAdUnit className="side-ad side-ad-left" campaign={campaign} /> : <AdSenseUnit className="side-ad side-ad-left" />}
      {campaign ? <FortuneAdUnit className="side-ad side-ad-right" campaign={campaign} /> : <AdSenseUnit className="side-ad side-ad-right" />}
    </>
  )
}

function LegacyAdSenseBanner({ className = '' }: { className?: string }) {
  const [isMobile, setIsMobile] = useState(() => window.matchMedia(mobileQuery).matches)
  const [showCoupang] = useState(() => Math.random() < 0.5)

  useEffect(() => {
    const mediaQuery = window.matchMedia(mobileQuery)
    const update = () => setIsMobile(mediaQuery.matches)

    mediaQuery.addEventListener('change', update)
    return () => mediaQuery.removeEventListener('change', update)
  }, [])

  return (
    <>
      {showCoupang ? <CoupangBanner className={className} isMobile={isMobile} /> : <AdSenseUnit className={className} />}
      <DesktopSideAds />
    </>
  )
}

export function AdSenseBanner({ className = '', teams = [] }: { className?: string; teams?: readonly string[] }) {
  // Temporary campaign takeover. Opt in explicitly to restore the previous ad mix.
  if (import.meta.env.VITE_ENABLE_EXTERNAL_ADS === 'true') return <LegacyAdSenseBanner className={className} />

  const campaign = campaignForTeams(teams)
  return (
    <>
      <FortuneAdUnit className={className} campaign={campaign} />
      <DesktopSideAds campaign={campaign} />
    </>
  )
}
