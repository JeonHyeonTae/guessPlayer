import { useEffect, useId, useRef, useState } from 'react'

declare global {
  interface Window {
    adsbygoogle?: unknown[]
  }
}

const ADSENSE_SCRIPT_ID = 'google-adsense-script'
const adsenseClient = import.meta.env.VITE_GOOGLE_ADSENSE_CLIENT || 'ca-pub-3077425787731419'
const adsenseSlot = import.meta.env.VITE_GOOGLE_ADSENSE_SLOT || '1905550513'
const reportUrl = 'https://report.fortelior.com/ko/r/kboht'

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
      <a
        className="ad-fallback"
        href={reportUrl}
        target="_blank"
        rel="noreferrer"
        aria-label="천신당 맞춤 사주 리포트 보기"
      >
        <span className="ad-fallback-copy">
          <small>CHEONSINDANG REPORT</small>
          <strong>나만의 사주 리포트</strong>
          <em>특별 할인 혜택 확인하기&nbsp; →</em>
        </span>
      </a>
    </aside>
  )
}

export function DesktopSideAds() {
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
      <AdSenseUnit className="side-ad side-ad-left" />
      <AdSenseUnit className="side-ad side-ad-right" />
    </>
  )
}

export function AdSenseBanner({ className = '' }: { className?: string }) {
  return (
    <>
      <AdSenseUnit className={className} />
      <DesktopSideAds />
    </>
  )
}
