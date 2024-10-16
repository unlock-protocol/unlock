import { LoginModal, useLogin, usePrivy } from '@privy-io/react-auth'
import { useEffect } from 'react'
import { useCookies } from 'react-cookie'
import { locksmith } from '~/config/locksmith'
import { queryClient } from '~/config/queryClient'
import { useAppStorage } from '~/hooks/useAppStorage'
import { useSession } from '~/hooks/useSession'
import { saveAccessToken } from '~/utils/session'

export const ConnectWallet = () => {
  const [cookies] = useCookies()
  const { refetchSession } = useSession()
  const { setStorage } = useAppStorage()

  const { getAccessToken: privyGetAccessToken } = usePrivy()
  // https://docs.privy.io/guide/react/wallets/external/#connect-or-create
  const { login } = useLogin({
    onComplete: async () => {
      try {
        const accessToken = await privyGetAccessToken()
        const identityToken = cookies['privy-id-token']
        const response = await locksmith.loginWithPrivy({
          accessToken: accessToken!,
          identityToken: identityToken!,
        })

        const { accessToken: locksmithAccessToken, walletAddress } =
          response.data
        if (locksmithAccessToken && walletAddress) {
          saveAccessToken({
            accessToken: locksmithAccessToken,
            walletAddress,
          })
        }
        setStorage('account', walletAddress)

        await queryClient.refetchQueries()
        await refetchSession()
      } catch (error) {
        console.error(error)
        return null
      }
    },
    onError: (error) => {
      console.error(error)
    },
  })

  useEffect(() => {
    login()
  }, [])

  return <LoginModal open={true} />
}
