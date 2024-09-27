import { locksmith } from '~/config/locksmith'

import { useQuery } from '@tanstack/react-query'

export const useKeyGranter = ({ network }: { network: number }) => {
  const getKeyGranter = async () => {
    const { data } = await locksmith.balance()
    return data[network].address
  }

  return useQuery({
    queryKey: ['getKeyGranter', network],
    queryFn: () => {
      return getKeyGranter()
    },
  })
}

export default useKeyGranter
