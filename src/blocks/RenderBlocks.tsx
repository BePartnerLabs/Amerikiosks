import type React from 'react'
import { Fragment } from 'react'
import { ArchiveBlock } from '@/blocks/ArchiveBlock/Component'
import { AudienceShowcaseServer } from '@/blocks/AudienceShowcase/Server'
import { CallToActionBlock } from '@/blocks/CallToAction/Component'
import { CardGridBlock } from '@/blocks/CardGrid/Component'
import { ContentBlock } from '@/blocks/Content/Component'
import { FormBlock } from '@/blocks/Form/Component'
import { FormatsGridServer } from '@/blocks/FormatsGrid/Server'
import { InsightsShowcaseBlock } from '@/blocks/InsightsShowcase/Component'
import { MediaBlock } from '@/blocks/MediaBlock/Component'
import { TrustStripServer } from '@/blocks/TrustStrip/Server'
import type { Page } from '@/payload-types'

const blockComponents = {
  archive: ArchiveBlock,
  audienceShowcase: AudienceShowcaseServer,
  content: ContentBlock,
  cta: CallToActionBlock,
  formBlock: FormBlock,
  mediaBlock: MediaBlock,
  cardGrid: CardGridBlock,
  insightsShowcase: InsightsShowcaseBlock,
  trustStrip: TrustStripServer,
  formatsGrid: FormatsGridServer,
}

export const RenderBlocks: React.FC<{
  blocks: NonNullable<Page['layout']>
}> = (props) => {
  const { blocks } = props

  const hasBlocks = blocks && Array.isArray(blocks) && blocks.length > 0

  if (hasBlocks) {
    return (
      <Fragment>
        {blocks.map((block) => {
          const { blockType } = block

          if (blockType && blockType in blockComponents) {
            const Block = blockComponents[blockType] as React.ComponentType<Record<string, unknown>>

            if (Block) {
              return (
                <div
                  className=""
                  key={block.id ?? `${blockType}-${block.blockName ?? 'block'}`}
                >
                  <Block {...block} />
                </div>
              )
            }
          }
          return null
        })}
      </Fragment>
    )
  }

  return null
}
