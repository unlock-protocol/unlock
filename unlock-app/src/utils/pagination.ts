export const paginate = ({
  items = [],
  page = 0,
  itemsPerPage = 30,
}: {
  items: any[]
  page: number
  itemsPerPage?: number
}) => {
  const start = itemsPerPage * page ?? 0
  const end = itemsPerPage * page + itemsPerPage
  const hasNextPage = end < items?.length
  const maxNumbersOfPage = Math.ceil(items?.length / itemsPerPage || 1)

  return {
    items: items?.slice(start, end),
    hasNextPage,
    maxNumbersOfPage,
  }
}
