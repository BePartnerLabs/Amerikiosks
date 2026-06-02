'use client'
import { Highlight, themes } from 'prism-react-renderer'
import type React from 'react'
import { CopyButton } from './CopyButton'

type Props = {
  code: string
  language?: string
}

export const Code: React.FC<Props> = ({ code, language = '' }) => {
  if (!code) return null

  return (
    <Highlight
      code={code}
      language={language}
      theme={themes.vsDark}
    >
      {({ getLineProps, getTokenProps, tokens }) => (
        <pre className="">
          {tokens.map((line, i) =>
            // Using content-based key to avoid pure index usage.
            (() => {
              const lineKey = line.map((token) => token.content).join('') || `line-${i + 1}`
              return (
                <div
                  key={lineKey}
                  {...getLineProps({ className: 'table-row', line })}
                >
                  <span className="">{i + 1}</span>
                  <span className="">
                    {line.map((token) => (
                      <span
                        key={`${token.types.join('-')}:${token.content}`}
                        {...getTokenProps({ token })}
                      />
                    ))}
                  </span>
                </div>
              )
            })(),
          )}
          <CopyButton code={code} />
        </pre>
      )}
    </Highlight>
  )
}
