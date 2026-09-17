import { useI18n } from './i18n'

export function SiteFooter() {
  const { locale } = useI18n()
  const en = locale === 'en'
  const base = en ? '/en' : ''
  return <footer className="site-footer">
    <nav aria-label={en ? 'Site information' : '사이트 안내'}>
      <a href={`${base}/about/`}>{en ? 'About & contact' : '서비스 소개·문의'}</a>
      <a href={`${base}/privacy/`}>{en ? 'Privacy information' : '개인정보 안내'}</a>
    </nav>
  </footer>
}

export function ClueExample({ en }: { en: boolean }) {
  return <figure className="play-guide-example">
    <figcaption><strong>{en ? 'Reading a guess' : '결과는 이렇게 읽어요'}</strong><span>{en ? 'Example' : '예시'}</span></figcaption>
    <div className="play-guide-cells">
      <div><span>{en ? 'Team' : '구단'}</span><strong className="is-match">LG <small>✓</small></strong><span>{en ? 'Same team' : '같은 구단'}</span></div>
      <div><span>{en ? 'Birth year' : '출생연도'}</span><strong>1995 <small>↑</small></strong><span>{en ? 'Born later' : '더 늦게 태어남'}</span></div>
      <div><span>{en ? 'Height' : '키'}</span><strong>185 <small>↓</small></strong><span>{en ? 'Shorter (cm)' : '더 작은 키 (cm)'}</span></div>
    </div>
    <p>{en ? 'In this example, look for an LG player born after 1995 and shorter than 185 cm.' : '이 경우, LG 소속이면서 1995년 이후에 태어나고 키가 185cm보다 작은 선수를 찾으면 돼요.'}</p>
    <div className="play-guide-legend"><span><i className="is-match" />{en ? 'Match' : '초록 = 일치'}</span><span><i />{en ? 'Different' : '회색 = 다름'}</span><span>{en ? '↑ Higher · ↓ Lower' : '↑ 더 큼 · ↓ 더 작음'}</span></div>
  </figure>
}
