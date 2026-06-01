import React from 'react'
import type { Page } from '@/payload-types'
import RichText from '@/components/RichText'
import './styles.css'

type ValuePropsBlockType = Extract<NonNullable<Page['layout']>[number], { blockType: 'valueProps' }>

export const ValuePropsBlock: React.FC<ValuePropsBlockType & { disableInnerContainer?: boolean }> = ({
  heading,
  items,
}) => {
  if (!heading && (!items || items.length === 0)) return null

  return (
    <section className="ak-value-props">
      <div className="bp-content-grid">
        <div className="breakout ak-value-props__inner">
          {heading && <h2 className="ak-value-props__heading">{heading}</h2>}

          {Array.isArray(items) && items.length > 0 && (
            <div className="ak-value-props__cards">
              {items.map((item, i) => (
                <div key={item.id ?? i} className="ak-value-props__card">
                  {item.title && <p className="ak-value-props__card-title">{item.title}</p>}
                  {item.body && (
                    <div className="ak-value-props__card-body">
                      <RichText data={item.body} enableGutter={false} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
