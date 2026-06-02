import { Banner } from '@payloadcms/ui/elements/Banner'
import Link from 'next/link'
import type React from 'react'

import { SeedButton } from './SeedButton'
import './index.scss'

const baseClass = 'before-dashboard'

const BeforeDashboard: React.FC = () => {
  return (
    <div className={baseClass}>
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
