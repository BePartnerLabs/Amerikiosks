import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/blocks/Code/Component.client', () => ({
  Code: ({ code, language }: { code: string; language?: string }) => (
    <pre
      data-testid="code"
      data-language={language}
    >
      {code}
    </pre>
  ),
}))

import { CodeBlock } from '@/blocks/Code/Component'

describe('CodeBlock', () => {
  afterEach(cleanup)

  it('passes code and language through to the Code component', () => {
    render(
      <CodeBlock
        blockType="code"
        code="console.log('hi')"
        language="ts"
      />,
    )
    const code = screen.getByTestId('code')
    expect(code).toHaveTextContent("console.log('hi')")
    expect(code).toHaveAttribute('data-language', 'ts')
  })
})
