import config from '@payload-config'
import { Banner } from '@payloadcms/ui/elements/Banner'
import Link from 'next/link'
import { getPayload } from 'payload'
import type React from 'react'

import { SeedButton } from './SeedButton'
import './index.scss'

const baseClass = 'before-dashboard'

const BeforeDashboard: React.FC = async () => {
  const payload = await getPayload({ config })
  const settings = await payload.findGlobal({ slug: 'settings' })
  const isNoIndex = settings?.noIndex !== false

  return (
    <div className={baseClass}>
      {isNoIndex && (
        <Banner
          className={`${baseClass}__banner`}
          type="error"
        >
          <strong>⚠ This site is not indexable.</strong> Search engines and AI crawlers are blocked
          via <code>robots.txt</code>. Go to{' '}
          <Link href="/admin/globals/settings">Site Settings</Link> and disable &ldquo;Block search
          engine indexing&rdquo; when the site is ready to go public.
        </Banner>
      )}
      <Banner
        className={`${baseClass}__banner`}
        type="success"
      >
        <h4>Welcome to Amerikiosks CMS</h4>
      </Banner>
      <ul className={`${baseClass}__instructions`}>
        <li>
          <SeedButton />
          {
            ' — loads the header navigation, pages, and base content. Run this whenever you need to reset the site structure.'
          }
        </li>
        <li>
          {'Then '}
          <Link
            href="/"
            target="_blank"
            rel="noopener"
          >
            visit the website
          </Link>
          {' to preview the results.'}
        </li>
      </ul>
    </div>
  )
}

export default BeforeDashboard
