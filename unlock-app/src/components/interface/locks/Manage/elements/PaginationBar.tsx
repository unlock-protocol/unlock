import {
  FaArrowRight as ArrowRightIcon,
  FaArrowLeft as ArrowLeftIcon,
} from 'react-icons/fa'
import React from 'react'
import { twMerge } from 'tailwind-merge'
import { Button } from '@unlock-protocol/ui'

interface PageProps {
  page: number
  active?: boolean
  setPage: (page: number) => void
}

interface PaginationBarProps {
  maxNumbersOfPage: number
  page: number
  setPage: (page: number) => void
}

const Page = ({ page, active, setPage }: PageProps) => {
  const pageClass = twMerge(
    'flex items-center justify-center w-8 h-8 p-0 rounded-full',
    active ? 'bg-brand-ui-primary text-white' : ''
  )
  return (
    <Button
      variant="borderless"
      className={pageClass}
      onClick={() => setPage(page)}
    >
      {page}
    </Button>
  )
}

const LIMIT_NEXT_PREV_PAGE = 5

const Pages = ({ maxNumbersOfPage, page, setPage }: PaginationBarProps) => {
  const maxPage = page + LIMIT_NEXT_PREV_PAGE

  const minFromMaxPage = maxNumbersOfPage - LIMIT_NEXT_PREV_PAGE

  return (
    <div className="flex flex-wrap gap-2">
      {Array(maxNumbersOfPage)
        .fill(null)
        .map((_, index) => {
          const currentPage: number = index + 1
          const isCurrent = currentPage === page
          const isLastPage = maxNumbersOfPage === currentPage

          const showNextPage =
            currentPage >= page &&
            currentPage <= maxPage &&
            page < minFromMaxPage

          const showPrevPage =
            currentPage >= minFromMaxPage &&
            currentPage < maxNumbersOfPage &&
            page >= minFromMaxPage

          const showLastPage = isLastPage && currentPage >= maxNumbersOfPage

          const showDots =
            currentPage === maxPage &&
            !showPrevPage &&
            maxNumbersOfPage - maxPage > 1

          return (
            <>
              {(showPrevPage || showNextPage) && (
                <Page
                  key={index}
                  page={currentPage}
                  active={isCurrent}
                  setPage={setPage}
                />
              )}

              {showDots && <span>...</span>}

              {showLastPage && (
                <div className="flex items-center gap-2">
                  <Page
                    page={currentPage}
                    setPage={setPage}
                    active={isCurrent}
                  />
                </div>
              )}
            </>
          )
        })}
    </div>
  )
}

export const PaginationBar = ({
  maxNumbersOfPage,
  page,
  setPage,
}: PaginationBarProps) => {
  const backDisabled = page === 1
  const nextDisabled = maxNumbersOfPage === page

  return (
    <div className="flex items-center justify-between">
      <div className="flex gap-6">
        <button
          aria-label="arrow left"
          disabled={backDisabled}
          onClick={() => setPage(page - 1)}
        >
          <ArrowLeftIcon />
        </button>
        <Pages
          maxNumbersOfPage={maxNumbersOfPage}
          page={page}
          setPage={setPage}
        />
        <button
          aria-label="arrow right"
          disabled={nextDisabled}
          onClick={() => setPage(page + 1)}
        >
          <ArrowRightIcon />
        </button>
      </div>
    </div>
  )
}
