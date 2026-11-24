import T from '../../components/T'
import YouTubeLite from '../../components/YouTubeLite'
import { ABOUT_VIDEOS, ABOUT_PRESS, ABOUT_LEGAL } from '../../lib/aboutContent'

export const metadata = {
  title: 'About Us — HEAVEN',
  description: 'HEAVEN is a Bangladesh-based fashion brand: clean silhouettes, honest fabric quality and everyday wearability.',
  alternates: { canonical: '/about' }
}

export default function AboutPage() {
  return (
    <div className="aboutPg">
      <h1><T>About Us</T></h1>

      <div className="abText">
        <p><b>HEAVEN</b> <T>{"is a Bangladesh-based fashion brand built around clean silhouettes, honest fabric quality and everyday wearability. What started as a small local shop in Mirpur, Dhaka has grown into an online destination for people who want premium clothing without unnecessary noise."}</T></p>
        <p><T>{"Every piece we sell is chosen or made with the same question in mind: would we wear this ourselves? That's the standard we hold our shirts, pants and accessories to — considered fits, durable fabric, and prices that make sense for Bangladesh."}</T></p>
        <p><T>{"We ship cash-on-delivery to all 64 districts, and our Mirpur store is open for anyone who'd rather see and try before they buy."}</T></p>
      </div>

      {ABOUT_VIDEOS.length > 0 && (
        <>
          <h2><T>Podcasts and Features</T></h2>
          <div className="abVideos">
            {ABOUT_VIDEOS.map(v => <YouTubeLite key={v.id} id={v.id} title={v.title} />)}
          </div>
        </>
      )}

      {ABOUT_PRESS.length > 0 && (
        <>
          <h2><T>Featured On</T></h2>
          <div className="abPress">
            {ABOUT_PRESS.map(p => {
              const img = <img src={p.logo} alt={p.name} loading="lazy" />
              return p.url
                ? <a key={p.name} href={p.url} target="_blank" rel="noopener noreferrer">{img}</a>
                : <span key={p.name}>{img}</span>
            })}
          </div>
        </>
      )}

      <div className="abContact">
        <h3><T>Contact us at</T></h3>
        <p><T>Helpline</T>: <a href="tel:+8801877270165">+880 1877-270165</a></p>
        <p><T>Email</T>: <a href="mailto:mdmisbahulhaq44@gmail.com">mdmisbahulhaq44@gmail.com</a></p>
        <p><T>Store</T>: <T>Mirpur, Dhaka, Bangladesh</T></p>
      </div>

      {ABOUT_LEGAL.length > 0 && (
        <div className="abLegal">
          <p><T>Legal Info</T>:</p>
          {ABOUT_LEGAL.map(l => <p key={l}>{l}</p>)}
        </div>
      )}
    </div>
  )
}
