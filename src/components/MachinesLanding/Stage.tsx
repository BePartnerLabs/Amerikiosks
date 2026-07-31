'use client'

import { MachinesLineup } from './Lineup'
import { MachinesScene } from './Scene'

type Props = {
  eyebrow: string
  heading: string
}

/**
 * The dark opening block: the model-line selector and the pinned scene it
 * feeds. Both live on navy so the cut-out renders read — see styles.css.
 */
export const MachinesStage: React.FC<Props> = ({ eyebrow, heading }) => (
  <div className="ak-machines-landing__stage">
    <div className="ak-machines-landing__intro">
      <div className="bp-content-grid">
        <div className="breakout">
          <p className="ak-machines-landing__eyebrow">{eyebrow}</p>
          <h1 className="ak-machines-landing__title">{heading}</h1>
          <MachinesLineup />
        </div>
      </div>
    </div>

    <MachinesScene />
  </div>
)
