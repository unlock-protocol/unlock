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
  // [-2 -1 0 1 2]
  const pagesToShow = Array(LIMIT_NEXT_PREV_PAGE)
    .fill(null)
    .map((_, index) => {
      return (
        Math.min(page, maxNumbersOfPage - 2) + index + 1 - Math.min(3, page)
      )
    })

  // Add first
  if (pagesToShow[0] > 1) {
    pagesToShow.unshift(1)
  }
  // Add last
  if (pagesToShow[pagesToShow.length - 1] < maxNumbersOfPage) {
    pagesToShow.push(maxNumbersOfPage)
  }

  return (
    <div className="flex flex-wrap gap-2">
      {pagesToShow.map((currentPage, index) => {
        const showDots = pagesToShow[index - 1] < currentPage - 1

        return (
          <>
            {showDots && <span>...</span>}
            <Page
              key={index}
              page={currentPage}
              active={currentPage === page}
              setPage={setPage}
            />
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
        <Button
          variant="borderless"
          aria-label="arrow left"
          disabled={backDisabled}
          onClick={() => setPage(page - 1)}
        >
          <ArrowLeftIcon />
        </Button>
        <Pages
          maxNumbersOfPage={maxNumbersOfPage}
          page={page}
          setPage={setPage}
        />
        <Button
          variant="borderless"
          aria-label="arrow right"
          disabled={nextDisabled}
          onClick={() => setPage(page + 1)}
        >
          <ArrowRightIcon />
        </Button>
      </div>
    </div>
  )
}
