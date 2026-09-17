import { useEffect, useId, useRef, useState } from 'react'
import { CheonsindangBanner } from './CheonsindangBanner'
import { campaignsForTeams, cheonsindangCampaigns, type CheonsindangCampaign } from './cheonsindangCampaigns'
import { useI18n } from './i18n'

declare global {
  interface Window {
    adsbygoogle?: unknown[]
  }
}

const ADSENSE_SCRIPT_ID = 'google-adsense-script'
const adsenseClient = import.meta.env.VITE_GOOGLE_ADSENSE_CLIENT || 'ca-pub-3077425787731419'
const adsenseSlot = import.meta.env.VITE_GOOGLE_ADSENSE_SLOT || '1905550513'
const CAMPAIGN_ROTATION_MS = 5000

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
  const { locale } = useI18n()
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
    <aside className={`ad-banner ${className}`.trim()} aria-label={locale === 'en' ? 'Advertisement' : '광고'}>
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
  const { locale } = useI18n()
  return (
    <aside className={`ad-banner fortune-ad ${className}`.trim()} aria-label={locale === 'en' ? 'Fortelior advertisement' : '포텔리어 광고'}>
      <CheonsindangBanner campaign={campaign} />
    </aside>
  )
}

export function DesktopSideAds({ campaign }: { campaign: CheonsindangCampaign }) {
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
      <FortuneAdUnit className="side-ad side-ad-left" campaign={campaign} />
      <FortuneAdUnit className="side-ad side-ad-right" campaign={campaign} />
    </>
  )
}

function RotatingFortuneAds({ className, campaigns }: { className: string; campaigns: CheonsindangCampaign[] }) {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (campaigns.length < 2) return

    const timer = window.setInterval(() => {
      setIndex(current => (current + 1) % campaigns.length)
    }, CAMPAIGN_ROTATION_MS)
    return () => window.clearInterval(timer)
  }, [campaigns.length])

  const campaign = campaigns[index]
  return (
    <>
      <FortuneAdUnit className={className} campaign={campaign} />
      <DesktopSideAds campaign={campaign} />
    </>
  )
}

export function AdSenseBanner({ className = '', teams = [], allowGoogleAds = false }: { className?: string; teams?: readonly string[]; allowGoogleAds?: boolean }) {
  // Temporary campaign takeover. Opt in explicitly to restore the previous ad mix.
  if (allowGoogleAds && import.meta.env.VITE_ENABLE_EXTERNAL_ADS === 'true') return <AdSenseUnit className={className} />

  const campaigns = campaignsForTeams(teams)
  // A changed selection restarts at its first campaign and clears the old timer.
  return <RotatingFortuneAds key={campaigns.map(campaign => campaign.id).join(',')} className={className} campaigns={campaigns} />
}
