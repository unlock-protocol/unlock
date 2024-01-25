import { PAGE_SIZE } from '@unlock-protocol/core'

export const paginate = ({
  page = 0,
  itemsPerPage = PAGE_SIZE,
  totalItems = 1000,
}: {
  page: number
  itemsPerPage?: number
  totalItems?: number
}) => {
  const end = itemsPerPage * page + itemsPerPage
  const hasNextPage = end < totalItems
  const maxNumbersOfPage = Math.ceil(totalItems / itemsPerPage || 1)

  return {
    hasNextPage,
    maxNumbersOfPage,
  }
}
