import type * as React from 'react'

export const Width: React.FC<{
  children: React.ReactNode
  className?: string
  width?: number | string
}> = ({ children, className, width }) => {
  const numWidth = typeof width === 'string' ? parseInt(width, 10) : width
  const gridColumn = numWidth && numWidth <= 50 ? 'span 1' : 'span 2'

  return (
    <div
      className={['ak-form__field', className].filter(Boolean).join(' ')}
      style={{ gridColumn }}
    >
      {children}
    </div>
  )
}
