import configPromise from '@payload-config'
import Image from 'next/image'
import Link from 'next/link'
import { getLocale } from 'next-intl/server'
import { getPayload } from 'payload'
import type React from 'react'
import RichText from '@/components/RichText'
import { SectionHeader } from '@/components/SectionHeader'
import type { Media, ProjectsShowcaseBlock as Props } from '@/payload-types'
import { toSnakeCase } from '@/utilities/toSnakeCase'
import './styles.css'

export const ProjectsShowcaseBlock: React.FC<Props & { blockName?: string | null }> = async ({
  eyebrow,
  heading,
  body,
  filterTag,
  blockName,
  blockType,
}) => {
  const payload = await getPayload({ config: configPromise })
  const locale = (await getLocale()) as 'en' | 'es'

  const { docs } = await payload.find({
    collection: 'projects',
    where: { 'tags.label': { equals: filterTag }, _status: { equals: 'published' } },
    limit: 2,
    depth: 1,
    overrideAccess: false,
    locale,
    fallbackLocale: 'en',
    select: { title: true, slug: true, category: true, description: true, image: true },
  })

  if (!heading) return null

  return (
    <section
      className="ak-projects-showcase"
      aria-label={heading}
      data-ga-block={toSnakeCase(blockType)}
      data-ga-section={blockName ?? undefined}
    >
      <div className="bp-content-grid">
        <div className="breakout ak-projects-showcase__inner">
          <div className="ak-projects-showcase__text">
            <SectionHeader
              eyebrow={eyebrow}
              heading={heading}
              align="left"
            />
            {body && (
              <RichText
                data={body}
                enableGutter={false}
                className="ak-projects-showcase__body"
              />
            )}
          </div>

          {docs.length > 0 && (
            <div className="ak-projects-showcase__cards">
              {docs.map((project) => {
                const img =
                  project.image && typeof project.image === 'object'
                    ? (project.image as Media)
                    : null
                const href = `/${locale}/projects/${project.slug}`

                return (
                  <article
                    key={project.id}
                    className="ak-projects-showcase__card"
                  >
                    {img?.url && (
                      <div className="ak-projects-showcase__card-img">
                        <Image
                          src={img.url}
                          alt={img.alt ?? project.title}
                          fill
                          sizes="(max-width: 768px) 100vw, 35vw"
                          className="ak-projects-showcase__card-img-inner"
                        />
                      </div>
                    )}
                    <div className="ak-projects-showcase__card-body">
                      {project.category && (
                        <p className="ak-projects-showcase__card-eyebrow">{project.category}</p>
                      )}
                      <h3 className="ak-projects-showcase__card-title">{project.title}</h3>
                      {project.description && (
                        <p className="ak-projects-showcase__card-desc">{project.description}</p>
                      )}
                      <Link
                        href={href}
                        className="ak-projects-showcase__card-link bp-btn bp-btn--outline"
                        data-ga-event="project_card_click"
                        data-ga-label={project.title}
                      >
                        View Project
                      </Link>
                    </div>
                  </article>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
