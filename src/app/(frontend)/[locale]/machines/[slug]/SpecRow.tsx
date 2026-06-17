'use client'

import { useInView } from '@/utilities/useInView'

type Props = {
  label: string
  value: string
}

export const SpecRow: React.FC<Props> = ({ label, value }) => {
  const { ref, inView } = useInView<HTMLDivElement>()

  return (
    <div
      ref={ref}
      className={`ak-machine-detail__spec-row${inView ? ' ak-machine-detail__spec-row--in-view' : ''}`}
    >
      <span className="ak-machine-detail__spec-label">{label}</span>
      <span className="ak-machine-detail__spec-value">{value}</span>
    </div>
  )
}
