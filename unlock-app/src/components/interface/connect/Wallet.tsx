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
    onComplete: async (
      user,
      isNewUser,
      wasAlreadyAuthenticated,
      loginMethod,
      linkedAccount
    ) => {
      console.log(
        user,
        isNewUser,
        wasAlreadyAuthenticated,
        loginMethod,
        linkedAccount
      )

      try {
        const response = await locksmith.loginWithPrivy({
          accessToken: await privyGetAccessToken(),
          identityToken: cookies['privy-id-token'],
        })
        console.log(response.data)
        const { accessToken, walletAddress } = response.data
        if (accessToken && walletAddress) {
          saveAccessToken({
            accessToken,
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
      // Any logic you'd like to execute if the user is/becomes authenticated while this
      // component is mounted
    },
    onError: (error) => {
      console.log(error)
      // Any logic you'd like to execute after a user exits the login flow or there is an error
    },
  })

  useEffect(() => {
    login()
  }, [])

  return <LoginModal open={true} />
}
