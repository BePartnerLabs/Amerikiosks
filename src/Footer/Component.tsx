import { getCachedGlobal } from '@/utilities/getGlobals'
import { FooterContent } from './FooterContent'
import './footer.css'

export async function Footer() {
  const { getLocale } = await import('next-intl/server')
  const locale = await getLocale()
  const [footer, settings] = await Promise.all([
    // Depth 2, not 1, por la misma razon que el Header —y es literalmente el
    // mismo fallo, que alli ya se arreglo y aqui no—: el CTA de contacto puede
    // abrir un formulario en un drawer, y el richText de ese formulario lleva un
    // enlace interno, porque el texto de consentimiento existe justamente para
    // enlazar la politica de privacidad. Depth 1 puebla el formulario pero deja
    // el `doc` de ese enlace como un id pelado, que `makeInternalDocToHref` se
    // niega a renderizar — y como el footer vive en el layout raiz, se lleva por
    // delante todas las paginas del sitio.
    getCachedGlobal('footer', 2, locale)(),
    getCachedGlobal('settings', 0, locale)(),
  ])

  return (
    <FooterContent
      footer={footer ?? {}}
      socialLinks={settings?.socialLinks}
    />
  )
}
