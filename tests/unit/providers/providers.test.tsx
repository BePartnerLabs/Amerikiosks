import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { Providers } from '@/providers'
import { QueryProvider } from '@/providers/QueryProvider'

describe('QueryProvider', () => {
  afterEach(cleanup)

  it('renders its children inside a QueryClientProvider', () => {
    render(
      <QueryProvider>
        <div data-testid="child">hello</div>
      </QueryProvider>,
    )
    expect(screen.getByTestId('child')).toHaveTextContent('hello')
  })
})

describe('Providers', () => {
  afterEach(cleanup)

  it('renders children wrapped by QueryProvider', () => {
    render(
      <Providers>
        <div data-testid="child">hello</div>
      </Providers>,
    )
    expect(screen.getByTestId('child')).toHaveTextContent('hello')
  })
})
