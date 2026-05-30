import Image from 'next/image'
import React from 'react'

interface Props {
  className?: string
  loading?: 'lazy' | 'eager'
  priority?: 'auto' | 'high' | 'low'
}

export const Logo = (props: Props) => {
  const { loading: loadingFromProps, priority: priorityFromProps, className } = props

  const loading = loadingFromProps || 'lazy'
  const priority = priorityFromProps || 'low'

  return (
    <>
      <Image
        alt="Amerikiosks"
        width={220}
        height={40}
        loading={loading}
        fetchPriority={priority}
        decoding="async"
        className="logo-desktop"
        src="/logos/logo-4.svg"
      />
      <Image
        alt=""
        aria-hidden="true"
        width={140}
        height={34}
        loading={loading}
        fetchPriority={priority}
        decoding="async"
        className="logo-mobile"
        src="/logos/logo-1.svg"
      />
    </>
  )
}
