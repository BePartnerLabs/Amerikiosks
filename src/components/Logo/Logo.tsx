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
      {/* Desktop: full horizontal logo */}
      <Image
        alt="Amerikiosks"
        width={220}
        height={40}
        loading={loading}
        fetchPriority={priority}
        decoding="async"
        className=""
        src="/logos/logo-4.svg"
      />
      {/* Mobile: compact rectangular logo */}
      <Image
        alt="Amerikiosks"
        width={140}
        height={34}
        loading={loading}
        fetchPriority={priority}
        decoding="async"
        className=""
        src="/logos/logo-1.svg"
      />
    </>
  )
}
