import type React from 'react'
import { Fragment } from 'react'
import { ArchiveBlock } from '@/blocks/ArchiveBlock/Component'
import { AudienceShowcaseServer } from '@/blocks/AudienceShowcase/Server'
import { CallToActionBlock } from '@/blocks/CallToAction/Component'
import { CardGridBlock } from '@/blocks/CardGrid/Component'
import { ClaimFormServer } from '@/blocks/ClaimForm/Server'
import { ContentBlock } from '@/blocks/Content/Component'
import { FAQWithFormServer } from '@/blocks/FAQWithForm/Server'
import { FormBlock } from '@/blocks/Form/Component'
import { FormatsGridServer } from '@/blocks/FormatsGrid/Server'
import { InsightsShowcaseBlock } from '@/blocks/InsightsShowcase/Component'
import { MachineLineupServer } from '@/blocks/MachineLineup/Server'
import { MachinesListingServer } from '@/blocks/MachinesListing/Server'
import { MediaBlock } from '@/blocks/MediaBlock/Component'
import { MetricsBlock } from '@/blocks/Metrics/Component'
import { ModelLinesServer } from '@/blocks/ModelLines/Server'
import { ProcessStepsBlock } from '@/blocks/ProcessSteps/Component'
import { ProjectsShowcaseBlock } from '@/blocks/ProjectsShowcase/Component'
import { StatementBlock } from '@/blocks/Statement/Component'
import { SupportHubBlock } from '@/blocks/SupportHub/Component'
import { TrustStripServer } from '@/blocks/TrustStrip/Server'
import type { Page } from '@/payload-types'

const blockComponents = {
  archive: ArchiveBlock,
  audienceShowcase: AudienceShowcaseServer,
  claimForm: ClaimFormServer,
  content: ContentBlock,
  cta: CallToActionBlock,
  formBlock: FormBlock,
  mediaBlock: MediaBlock,
  cardGrid: CardGridBlock,
  metrics: MetricsBlock,
  insightsShowcase: InsightsShowcaseBlock,
  projectsShowcase: ProjectsShowcaseBlock,
  trustStrip: TrustStripServer,
  formatsGrid: FormatsGridServer,
  processSteps: ProcessStepsBlock,
  faqWithForm: FAQWithFormServer,
  machinesListing: MachinesListingServer,
  modelLines: ModelLinesServer,
  machineLineup: MachineLineupServer,
  statement: StatementBlock,
  supportHub: SupportHubBlock,
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
          const { blockType, blockName } = block

          if (blockName?.trim().toLowerCase() === 'hidden') return null

          if (blockType && blockType in blockComponents) {
            const Block = blockComponents[blockType] as React.ComponentType<Record<string, unknown>>

            if (Block) {
              return (
                <div key={block.id ?? `${blockType}-${block.blockName ?? 'block'}`}>
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
