/** One resolved redirect, as served by /next/redirects. */
export type RedirectEntry = {
  /** Normalized lookup key, e.g. `/contact-old/london-office`. */
  from: string
  /** Fully resolved destination, e.g. `/contact`. */
  to: string
  /** 301 permanent by default — the right status for a moved URL. */
  status: 301 | 302
}
