import type React from 'react'
import { Icon } from '@/components/Icon'
import './styles.css'

// simple-icons WhatsApp glyph (MIT) — Material Symbols has no brand logos,
// so this brand mark is rendered standalone with its own 24x24 viewBox
// instead of going through the 960-grid Icon component.
const WhatsAppIcon: React.FC = () => (
  <svg
    viewBox="0 0 24 24"
    width={24}
    height={24}
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.868-2.031-.967-.273-.099-.472-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347zM12.001 22.006c-1.812 0-3.545-.487-5.055-1.407l-.363-.216-3.755.985.998-3.66-.238-.375a9.86 9.86 0 01-1.516-5.303c.002-5.462 4.454-9.911 9.933-9.911 2.654 0 5.146 1.033 7.021 2.909a9.864 9.864 0 012.909 7.023c-.002 5.462-4.453 9.955-9.934 9.955zm8.413-18.297A11.815 11.815 0 0012.001.194C5.462.194.14 5.512.137 12.05a11.86 11.86 0 001.591 5.945L0 24l6.135-1.611a11.998 11.998 0 005.865 1.494h.005c6.538 0 11.86-5.319 11.863-11.858a11.788 11.788 0 00-3.454-8.316z" />
  </svg>
)

export type SupportHubBlockType = {
  blockName?: string
  blockType?: 'supportHub'
  phoneNumber: string
  whatsappNumber: string
  refundFormUrl: string
}

const digitsOnly = (value: string) => value.replace(/[^0-9]/g, '')

const OPTIONS = (phoneNumber: string, whatsappNumber: string, refundFormUrl: string) => [
  {
    href: refundFormUrl,
    label: 'Request a refund',
    icon: 'currency_exchange',
    event: 'support_refund_link',
    appearance: 'primary' as const,
  },
  {
    href: `tel:${phoneNumber}`,
    label: 'Call Us',
    icon: 'call',
    event: 'support_call',
    appearance: 'outline' as const,
  },
  {
    href: `sms:${phoneNumber}`,
    label: 'Text Us',
    icon: 'sms',
    event: 'support_text',
    appearance: 'outline' as const,
  },
  {
    href: `https://wa.me/${digitsOnly(whatsappNumber)}`,
    label: 'Chat with a live agent on WhatsApp',
    icon: 'chat',
    event: 'support_whatsapp',
    appearance: 'outline' as const,
  },
]

export const SupportHubBlock: React.FC<SupportHubBlockType> = ({
  phoneNumber,
  whatsappNumber,
  refundFormUrl,
  blockName,
}) => {
  const options = OPTIONS(phoneNumber, whatsappNumber, refundFormUrl)

  return (
    <section
      className="ak-support-hub"
      aria-label={blockName ?? 'Customer service'}
      data-ga-block="support_hub"
    >
      <div className="ak-support-hub__inner">
        <ul className="ak-support-hub__list">
          {options.map((option) => (
            <li key={option.event}>
              <a
                href={option.href}
                data-ga-event={option.event}
                className={`bp-btn ${
                  option.appearance === 'primary' ? 'bp-btn--primary' : 'bp-btn--outline'
                } ak-support-hub__link`}
              >
                {option.event === 'support_whatsapp' ? (
                  <WhatsAppIcon />
                ) : (
                  <Icon name={option.icon} />
                )}
                {option.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
