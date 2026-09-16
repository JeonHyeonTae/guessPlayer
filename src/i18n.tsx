import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { localizedPath, resolveLocale, translate, type Locale, type TranslationKey } from './i18n-core'
export * from './i18n-core'

const STORAGE_KEY = 'nukya-language'
function initialLocale(): Locale {
  let stored: string | null = null
  try { stored = window.localStorage.getItem(STORAGE_KEY) } catch { /* Private browsing can disable storage. */ }
  return resolveLocale({ search: window.location.search, pathname: window.location.pathname, stored, browserLanguage: navigator.language })
}
const defaultLocale = initialLocale()
const LanguageContext = createContext({ locale: defaultLocale, setLocale: (_locale: Locale) => {} })

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>(initialLocale)
  useEffect(() => {
    try { window.localStorage.setItem(STORAGE_KEY, locale) } catch { /* The current session still works. */ }
    document.documentElement.lang = locale
    document.title = locale === 'en' ? 'Nu-Kya! | Baseball Player Guessing Game' : '누크야! | 한국 프로야구 선수 맞추기'
    const description = locale === 'en'
      ? 'Guess the Korean baseball player using clues about their team, position, jersey number, birth year, and throwing and batting hand. Play Nu-Kya!, a free baseball quiz.'
      : '누크야!는 한국 프로야구 선수의 구단, 포지션, 등번호, 출생연도와 투타 정보를 비교해 정답 선수를 맞히는 무료 야구선수 퀴즈 게임입니다.'
    document.querySelector('meta[name="description"]')?.setAttribute('content', description)
    document.querySelector('meta[property="og:title"]')?.setAttribute('content', document.title)
    document.querySelector('meta[property="og:description"]')?.setAttribute('content', description)
    document.querySelector('meta[property="og:site_name"]')?.setAttribute('content', locale === 'en' ? 'Nu-Kya!' : '누크야!')
    document.querySelector('meta[property="og:locale"]')?.setAttribute('content', locale === 'en' ? 'en_US' : 'ko_KR')
    document.querySelector('meta[property="og:locale:alternate"]')?.setAttribute('content', locale === 'en' ? 'ko_KR' : 'en_US')
    const canonical = locale === 'en' ? 'https://nu-kya.com/en/' : 'https://nu-kya.com/'
    document.querySelector('link[rel="canonical"]')?.setAttribute('href', canonical)
    document.querySelector('meta[property="og:url"]')?.setAttribute('content', canonical)
    document.querySelector('meta[name="twitter:url"]')?.setAttribute('content', canonical)
    document.querySelector('meta[name="twitter:title"]')?.setAttribute('content', document.title)
    document.querySelector('meta[name="twitter:description"]')?.setAttribute('content', description)
    const imageUrl = locale === 'en'
      ? 'https://nu-kya.com/thumbnail-en-20260909.jpg'
      : 'https://nu-kya.com/thumbnail.png?v=20260904'
    const imageAlt = locale === 'en' ? 'Nu-Kya! Guess the Baseball Player' : '누크야! 한국 프로야구 선수 맞추기 게임 화면'
    document.querySelector('meta[property="og:image"]')?.setAttribute('content', imageUrl)
    document.querySelector('meta[property="og:image:secure_url"]')?.setAttribute('content', imageUrl)
    document.querySelector('meta[property="og:image:type"]')?.setAttribute('content', locale === 'en' ? 'image/jpeg' : 'image/png')
    document.querySelector('meta[property="og:image:width"]')?.setAttribute('content', locale === 'en' ? '1200' : '1535')
    document.querySelector('meta[property="og:image:height"]')?.setAttribute('content', locale === 'en' ? '675' : '1024')
    document.querySelector('meta[property="og:image:alt"]')?.setAttribute('content', imageAlt)
    document.querySelector('meta[name="twitter:card"]')?.setAttribute('content', 'summary_large_image')
    document.querySelector('meta[name="twitter:image"]')?.setAttribute('content', imageUrl)
    document.querySelector('meta[name="twitter:image:alt"]')?.setAttribute('content', imageAlt)
    document.querySelector('meta[name="keywords"]')?.setAttribute('content', locale === 'en'
      ? 'Nu-Kya, Korean baseball, baseball player guessing game, baseball quiz, baseball trivia'
      : '누크야, 누크야!, 한국 프로야구 선수 맞추기, 야구선수 맞추기, 프로야구 퀴즈, 야구 퀴즈')
    const websiteSchema = document.getElementById('website-schema')
    if (websiteSchema) websiteSchema.textContent = JSON.stringify({
      '@context': 'https://schema.org', '@type': 'WebSite',
      name: locale === 'en' ? 'Nu-Kya!' : '누크야!',
      alternateName: locale === 'en' ? ['Nu-Kya', 'Baseball Player Guessing Game'] : ['누크야', '한국 프로야구 선수 맞추기', '야구선수 맞추기'],
      url: canonical,
      description: locale === 'en' ? 'A free quiz to guess Korean professional baseball players' : '한국 프로야구 선수를 맞히는 무료 야구 퀴즈 게임',
      inLanguage: locale,
    })
    const path = localizedPath(window.location.href, locale)
    if (path !== `${window.location.pathname}${window.location.search}${window.location.hash}`) {
      window.history.replaceState(window.history.state, '', path)
    }
  }, [locale])
  return <LanguageContext.Provider value={{ locale, setLocale }}>{children}</LanguageContext.Provider>
}

export function useI18n() {
  const context = useContext(LanguageContext)
  return { ...context, t: (key: TranslationKey) => translate(key, context.locale) }
}

export function LanguageToggle() {
  const { locale, setLocale } = useI18n()
  const nextLocale = locale === 'ko' ? 'en' : 'ko'
  return <a className="language-toggle" href={localizedPath(window.location.href, nextLocale)} hrefLang={nextLocale} lang={nextLocale}
    onClick={event => {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
      event.preventDefault()
      setLocale(nextLocale)
    }} aria-label={locale === 'ko' ? 'Switch to English' : '한국어로 변경'}>{locale === 'ko' ? 'English' : '한국어'}</a>
}
