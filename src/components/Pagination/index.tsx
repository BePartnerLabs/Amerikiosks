import Link from 'next/link'
import type React from 'react'

export const Pagination: React.FC<{
  className?: string
  page: number
  totalPages: number
}> = ({ className, page, totalPages }) => {
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
            href={hasPrevPage ? `/insights/page/${page - 1}` : '#'}
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
              href={`/insights/page/${page - 1}`}
            >
              {page - 1}
            </Link>
          </li>
        )}

        <li className="bp-pagination__item">
          <Link
            aria-current="page"
            className="bp-pagination__link"
            href={`/insights/page/${page}`}
          >
            {page}
          </Link>
        </li>

        {hasNextPage && (
          <li className="bp-pagination__item">
            <Link
              className="bp-pagination__link"
              href={`/insights/page/${page + 1}`}
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
            href={hasNextPage ? `/insights/page/${page + 1}` : '#'}
          >
            Next →
          </Link>
        </li>
      </ol>
    </nav>
  )
}
