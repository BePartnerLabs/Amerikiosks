import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderBoldText } from '@/utilities/renderBoldText'

describe('renderBoldText', () => {
  it('returns plain text unchanged when there are no ** markers', () => {
    const { container } = render(renderBoldText('Simple heading'))
    expect(container.textContent).toBe('Simple heading')
    expect(container.querySelector('strong')).toBeNull()
  })

  it('wraps a single **marked** segment in <strong>', () => {
    const { container } = render(renderBoldText('Ahorra **hasta 40%** hoy'))
    expect(container.textContent).toBe('Ahorra hasta 40% hoy')
    const strong = container.querySelector('strong')
    expect(strong).not.toBeNull()
    expect(strong?.textContent).toBe('hasta 40%')
  })

  it('wraps multiple **marked** segments independently', () => {
    const { container } = render(renderBoldText('**Rápido** y **confiable**'))
    const strongs = container.querySelectorAll('strong')
    expect(strongs).toHaveLength(2)
    expect(strongs[0].textContent).toBe('Rápido')
    expect(strongs[1].textContent).toBe('confiable')
    expect(container.textContent).toBe('Rápido y confiable')
  })

  it('leaves an unclosed ** marker literal instead of breaking the render', () => {
    const { container } = render(renderBoldText('Texto con ** suelto'))
    expect(container.textContent).toBe('Texto con ** suelto')
    expect(container.querySelector('strong')).toBeNull()
  })

  it('returns an empty result for an empty string', () => {
    const { container } = render(renderBoldText(''))
    expect(container.textContent).toBe('')
  })
})
