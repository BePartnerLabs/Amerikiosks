import { SectionHeader } from '@/components/SectionHeader'
import type { Machine } from '@/payload-types'

type Props = {
  models: Machine[]
}

// Builds one row per spec label (in first-seen order), one column per model.
// Models in a family should use matching `specs[].label` text so rows line up —
// see the admin description on `machines.specs`.
export const SpecsCompare: React.FC<Props> = ({ models }) => {
  const modelsWithSpecs = models.filter((m) => (m.specs?.length ?? 0) > 0)
  if (modelsWithSpecs.length < 2) return null

  const labels: string[] = []
  for (const model of modelsWithSpecs) {
    for (const spec of model.specs ?? []) {
      if (spec.label && !labels.includes(spec.label)) labels.push(spec.label)
    }
  }
  if (labels.length === 0) return null

  return (
    <section className="ak-family-detail__compare">
      <div className="bp-content-grid">
        <div className="content ak-family-detail__compare-inner">
          <SectionHeader
            eyebrow="Compare"
            heading="Our models, side by side."
          />
          <div className="ak-family-detail__compare-tablewrap">
            <table className="ak-family-detail__compare-table">
              <thead>
                <tr>
                  <th>Spec</th>
                  {modelsWithSpecs.map((m) => (
                    <th key={m.id}>{m.name}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {labels.map((label) => (
                  <tr key={label}>
                    <th>{label}</th>
                    {modelsWithSpecs.map((m) => {
                      const value = m.specs?.find((s) => s.label === label)?.value
                      return <td key={m.id}>{value ?? '—'}</td>
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  )
}
