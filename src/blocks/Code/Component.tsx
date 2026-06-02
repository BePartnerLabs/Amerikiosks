import type React from 'react'

import { Code } from './Component.client'

export type CodeBlockProps = {
  code: string
  language?: string
  blockType: 'code'
}

type Props = CodeBlockProps & {
  className?: string
}

export const CodeBlock: React.FC<Props> = ({ className: _className, code, language }) => {
  return (
    <div className="">
      <Code
        code={code}
        language={language}
      />
    </div>
  )
}
