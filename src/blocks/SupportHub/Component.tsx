import type React from 'react'
import './styles.css'

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
    event: 'support_refund_link',
    appearance: 'primary' as const,
  },
  {
    href: `tel:${phoneNumber}`,
    label: 'Call Us',
    event: 'support_call',
    appearance: 'outline' as const,
  },
  {
    href: `sms:${phoneNumber}`,
    label: 'Text Us',
    event: 'support_text',
    appearance: 'outline' as const,
  },
  {
    href: `https://wa.me/${digitsOnly(whatsappNumber)}`,
    label: 'Chat with a live agent on WhatsApp',
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
                {option.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
