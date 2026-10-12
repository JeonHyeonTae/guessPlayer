(() => {
  const aliases = {
    kia: 'kia', '기아': 'kia',
    doosan: 'doosan', '두산': 'doosan',
    lotte: 'lotte', '롯데': 'lotte',
    samsung: 'samsung', '삼성': 'samsung',
    lg: 'lg', '엘지': 'lg',
    kiwoom: 'kiwoom', '키움': 'kiwoom',
    hanwha: 'hanwha', '한화': 'hanwha',
    kt: 'kt', nc: 'nc', ssg: 'ssg',
  }
  const segments = window.location.pathname.split('/').filter(Boolean)
  const segment = segments.at(-1) === 'index.html' ? segments.at(-2) : segments.at(-1)
  const team = segment && aliases[decodeURIComponent(segment).toLowerCase()]
  if (!team) return

  const requestedLanguage = new URLSearchParams(window.location.search).get('lang')
  const defaultLanguage = window.location.pathname.startsWith('/share/en/') ? 'en' : 'ko'
  const lang = requestedLanguage === 'ko' || requestedLanguage === 'en'
    ? requestedLanguage
    : defaultLanguage
  const home = lang === 'en' ? '/en/' : '/'
  window.location.replace(`${home}?${new URLSearchParams({ team, lang })}`)
})()
