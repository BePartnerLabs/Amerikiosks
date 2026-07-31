import Link from 'next/link'
import { useLocale } from 'next-intl'
import type React from 'react'
import { type AppLocale, localizeHref } from '@/utilities/localeUrl'

export const Pagination: React.FC<{
  className?: string
  page: number
  totalPages: number
}> = ({ className, page, totalPages }) => {
  const locale = useLocale() as AppLocale
  // Pagination hrefs are built here rather than coming from the CMS, but they
  // hit the same trap: un-prefixed, they resolve as EN, so paging from /es
  // silently walked the visitor into the English archive.
  const insightsPage = (n: number) => localizeHref(`/insights/page/${n}`, locale)

  const hasNextPage = page < totalPages
  const hasPrevPage = page > 1
  const hasExtraPrevPages = page - 1 > 1
  const hasExtraNextPages = page + 1 < totalPages

  return (
    <nav
      aria-label="Pagination"
      className={className}
    >
      <ol className="bp-pagination">
        <li className="bp-pagination__item">
          <Link
            aria-disabled={!hasPrevPage}
            aria-label="Go to previous page"
            className="bp-pagination__link"
            href={hasPrevPage ? insightsPage(page - 1) : '#'}
            tabIndex={hasPrevPage ? undefined : -1}
          >
            ← Prev
          </Link>
        </li>

        {hasExtraPrevPages && (
          <li className="bp-pagination__item">
            <span className="bp-pagination__ellipsis">…</span>
          </li>
        )}

        {hasPrevPage && (
          <li className="bp-pagination__item">
            <Link
              className="bp-pagination__link"
              href={insightsPage(page - 1)}
            >
              {page - 1}
            </Link>
          </li>
        )}

        <li className="bp-pagination__item">
          <Link
            aria-current="page"
            className="bp-pagination__link"
            href={insightsPage(page)}
          >
            {page}
          </Link>
        </li>

        {hasNextPage && (
          <li className="bp-pagination__item">
            <Link
              className="bp-pagination__link"
              href={insightsPage(page + 1)}
            >
              {page + 1}
            </Link>
          </li>
        )}

        {hasExtraNextPages && (
          <li className="bp-pagination__item">
            <span className="bp-pagination__ellipsis">…</span>
          </li>
        )}

        <li className="bp-pagination__item">
          <Link
            aria-disabled={!hasNextPage}
            aria-label="Go to next page"
            className="bp-pagination__link"
            href={hasNextPage ? insightsPage(page + 1) : '#'}
            tabIndex={hasNextPage ? undefined : -1}
          >
            Next →
          </Link>
        </li>
      </ol>
    </nav>
  )
}
