import Link from 'next/link'
import React from 'react'
import { getTranslations } from 'next-intl/server'

import { Button } from '@/components/ui/button'

export default async function NotFound() {
  const t = await getTranslations('notFound')

  return (
    <div className="">
      <div className="">
        <h1 style={{ marginBottom: 0 }}>{t('heading')}</h1>
        <p className="">{t('message')}</p>
      </div>
      <Button asChild variant="default">
        <Link href="/">{t('backHome')}</Link>
      </Button>
    </div>
  )
}
