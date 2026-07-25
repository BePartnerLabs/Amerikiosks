import type React from 'react'
import './styles.css'
import { SectionHeader } from '@/components/SectionHeader'
import type { StatementBlock as StatementBlockProps } from '@/payload-types'
import { toSnakeCase } from '@/utilities/toSnakeCase'

const PATTERN_TILE_IDS = Array.from({ length: 6 }, () => crypto.randomUUID())

export const StatementBlock: React.FC<StatementBlockProps> = ({
  eyebrow,
  statement,
  subheading,
  blockName,
  blockType,
}) => {
  if (!statement) return null

  return (
    <section
      className="ak-statement"
      aria-label={blockName ?? eyebrow ?? undefined}
      data-ga-block={toSnakeCase(blockType)}
      data-ga-section={blockName ?? undefined}
    >
      <div
        className="ak-statement__patterns"
        aria-hidden="true"
      >
        <span className="ak-statement__pattern ak-statement__pattern--left" />
        <span className="ak-statement__pattern ak-statement__pattern--right">
          {PATTERN_TILE_IDS.map((id) => (
            <span
              key={id}
              className="ak-statement__pattern-tile"
            />
          ))}
        </span>
      </div>
      <div className="bp-content-grid">
        <div className="breakout ak-statement__inner">
          <SectionHeader
            eyebrow={eyebrow}
            heading={statement}
            subtitle={subheading}
            align="center"
          />
        </div>
      </div>
    </section>
  )
}
