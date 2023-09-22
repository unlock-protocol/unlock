export const paginate = ({
  page = 0,
  itemsPerPage = 30,
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
