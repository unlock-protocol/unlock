import { useQuery } from '@tanstack/react-query'
import { locksmith } from '~/config/locksmith'

const getUserEventCollections = async (account: string) => {
  console.log({ account })
  const { data: eventCollections } =
    await locksmith.getEventCollectionsByManager(account)
  return eventCollections
}

export const useUserEventCollections = (account: string) => {
  return useQuery({
    queryKey: ['userEventCollections', account],
    queryFn: () => getUserEventCollections(account),
    enabled: !!account,
  })
}
