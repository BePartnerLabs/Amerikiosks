'use client'

import type React from 'react'
import { QueryProvider } from './QueryProvider'

export const Providers: React.FC<{
  children: React.ReactNode
}> = ({ children }) => {
  return <QueryProvider>{children}</QueryProvider>
}
