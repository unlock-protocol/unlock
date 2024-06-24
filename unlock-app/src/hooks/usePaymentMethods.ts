import { useMutation, useQuery } from '@tanstack/react-query'
import { locksmith } from '~/config/storage'
import { useAuth } from '~/contexts/AuthenticationContext'

export const useRemovePaymentMethods = () => {
  const { account } = useAuth()
  return useMutation(
    ['removePaymentMethods', account],
    async () => {
      const response = await locksmith.removePaymentMethods()
      return response.data.success
    },
    {
      retry: 2,
    }
  )
}

export const usePaymentMethodList = () => {
  const { account } = useAuth()
  return useQuery(
    ['listPaymentMethods', account],
    async () => {
      const response = await locksmith.listPaymentMethods()
      return response.data.methods || []
    },
    {
      retry: 2,
      enabled: !!account,
    }
  )
}
