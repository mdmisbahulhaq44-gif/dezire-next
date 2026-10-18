'use client'

import { useShop } from './ShopContext'

export default function LangToggle() {
  const { lang, setLang, t } = useShop()
  return (
    <div className="curToggle" role="group" aria-label="Language">
      <span>{t('Language')}</span>
      <button type="button" className={lang === 'en' ? 'on' : ''} onClick={() => setLang('en')}>EN</button>
      <button type="button" className={lang === 'bn' ? 'on' : ''} onClick={() => setLang('bn')}>বাংলা</button>
    </div>
  )
}
