import { MEMBERS_PER_PAGE } from '~/constants'

export const paginate = ({
  page = 0,
  itemsPerPage = MEMBERS_PER_PAGE,
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
