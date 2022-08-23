export const paginate = ({
  items,
  page,
  itemsPerPage = 30,
}: {
  items: any[]
  page: number
  itemsPerPage?: number
}) => {
  const start = itemsPerPage * page ?? 0
  const end = itemsPerPage * page + itemsPerPage
  const hasNextPage = end < items?.length

  return {
    items: items.slice(start, end),
    hasNextPage,
  }
}
