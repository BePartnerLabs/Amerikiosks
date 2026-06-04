import type React from 'react'
import { Code } from './Component.client'
import './styles.css'

export type CodeBlockProps = {
  code: string
  language?: string
  blockType: 'code'
}

export const CodeBlock: React.FC<CodeBlockProps & { className?: string }> = ({
  code,
  language,
}) => {
  return (
    <div className="ak-code">
      <Code
        code={code}
        language={language}
      />
    </div>
  )
}
