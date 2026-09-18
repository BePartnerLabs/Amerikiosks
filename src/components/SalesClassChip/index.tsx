import type React from 'react'
import type { MachineFamily } from '@/payload-types'
import '@/components/FamilyAccent/accent.css'
import './styles.css'

export type SalesClass = MachineFamily['salesClass']

type Props = {
  salesClass: SalesClass
  /** El rótulo ya resuelto en el servidor — ver `labels.ts`. */
  label: string
  /** Solo si dos familias comparten clase. Delta es la única hoy. */
  colorStep?: number | null
  /** Sobre navy el chip se resuelve con `glow` en vez de `ink`. */
  tone?: 'light' | 'dark'
  className?: string
}

/**
 * La etiqueta que hace que el color signifique algo.
 *
 * Un sistema de color que contesta «¿esta máquina sirve para lo que yo vendo?»
 * hay que enseñarlo una vez: el chip es esa vez, porque pone el nombre de la
 * clase justo al lado del tono. Sin él el visitante ve colores lindos y nunca
 * descubre la regla — y el color vuelve a ser decoración, que es de donde este
 * sistema viene.
 *
 * Es texto, no solo color: quien no distingue el verde del naranja lee
 * «Ambiente · alto volumen» igual.
 */
export const SalesClassChip: React.FC<Props> = ({
  salesClass,
  label,
  colorStep,
  tone = 'light',
  className,
}) => (
  <span
    className={`ak-class-chip ak-family-accent${tone === 'dark' ? ' ak-class-chip--on-dark' : ''}${
      className ? ` ${className}` : ''
    }`}
    data-sales-class={salesClass}
    style={colorStep ? ({ '--_family-step': colorStep } as React.CSSProperties) : undefined}
  >
    {label}
  </span>
)
