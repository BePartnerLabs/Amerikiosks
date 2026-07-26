import type React from 'react'
import { ModelLinesRow } from '@/components/ModelLinesRow'
import { SectionHeader } from '@/components/SectionHeader'
import type { MachineFamily, ModelLinesBlock as ModelLinesBlockProps } from '@/payload-types'
import { toSnakeCase } from '@/utilities/toSnakeCase'
import './styles.css'

type Props = ModelLinesBlockProps & { families: MachineFamily[] }

export const ModelLinesBlock: React.FC<Props> = ({
  eyebrow,
  heading,
  subheading,
  blockName,
  blockType,
  families,
}) => {
  if (!heading || families.length === 0) return null

  return (
    <section
      className="ak-model-lines"
      aria-label={heading}
      data-ga-block={toSnakeCase(blockType)}
      data-ga-section={blockName ?? undefined}
    >
      <div className="bp-content-grid">
        <div className="breakout ak-model-lines__inner">
          <SectionHeader
            eyebrow={eyebrow}
            heading={heading}
            subtitle={subheading}
            align="center"
          />

          <ModelLinesRow families={families} />
        </div>
      </div>
    </section>
  )
}
