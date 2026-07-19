import type { ReactNode } from 'react'

const BOLD_MARKER = /\*\*(.+?)\*\*/g

/** Splits `**marked**` segments out of a plain string into <strong> nodes. */
export function renderBoldText(text: string): ReactNode {
  if (!text.includes('**')) return text

  const nodes: ReactNode[] = []
  let lastIndex = 0
  let match: RegExpExecArray | null

  BOLD_MARKER.lastIndex = 0
  // biome-ignore lint/suspicious/noAssignInExpressions: standard regex.exec loop
  while ((match = BOLD_MARKER.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index))
    }
    nodes.push(<strong key={match.index}>{match[1]}</strong>)
    lastIndex = BOLD_MARKER.lastIndex
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex))
  }

  return nodes
}
