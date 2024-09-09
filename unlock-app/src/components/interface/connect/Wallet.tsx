import {
  RECENTLY_USED_PROVIDER,
  useAuthenticate,
} from '~/hooks/useAuthenticate'
import { LoginModal, usePrivy, useWallets } from '@privy-io/react-auth'
import SvgComponents from '../svg'
import { ConnectButton } from './Custom'
import { useLocalStorage } from '@rehooks/local-storage'
import { MouseEventHandler, useEffect, useState } from 'react'
import { Button, Input } from '@unlock-protocol/ui'
import { useForm } from 'react-hook-form'
import { ConnectUnlockAccount } from './EmailAccount'
import { useAuth } from '~/contexts/AuthenticationContext'
import { CheckoutService } from '../checkout/main/checkoutMachine'
import { useQuery } from '@tanstack/react-query'
import { locksmith } from '~/config/locksmith'
import { UserAccountType } from '~/utils/userAccountType'
import { G } from '@decent.xyz/box-common/dist/index-D1n-mmTU'

interface ConnectWalletProps {
  injectedProvider?: unknown
  shoudOpenConnectModal?: boolean
  checkoutService?: CheckoutService
}

interface ConnectViaEmailProps {
  email: string | undefined
  isLoadingUserExists: boolean
  onUnlockAccount: (email: string) => void
}

interface UserDetails {
  email: string
}

export const ConnectViaEmail = ({
  email,
  isLoadingUserExists,
  onUnlockAccount,
}: ConnectViaEmailProps) => {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<UserDetails>()

  const onSubmit = async (data: UserDetails) => {
    if (!data.email) return
    try {
      onUnlockAccount(data.email)
    } catch (error) {
      if (error instanceof Error) {
        if (error instanceof Error) {
          setError(
            'email',
            {
              type: 'value',
              message: error.message,
            },
            {
              shouldFocus: true,
            }
          )
        }
      }
    }
  }

  return (
    <div>
      <form className="grid gap-4" onSubmit={handleSubmit(onSubmit)}>
        <Input
          type="email"
          autoComplete="email"
          placeholder={email ? email : 'your@email.com'}
          error={errors.email?.message}
          {...register('email', {
            required: {
              value: true,
              message: 'Email is required',
            },
          })}
          actions={
            <Button
              type="submit"
              disabled={!watch('email')}
              variant="borderless"
              loading={isSubmitting || isLoadingUserExists}
              className="p-2.5"
            >
              Continue
            </Button>
          }
        />
      </form>
    </div>
  )
}

export const ConnectWallet = ({
  shoudOpenConnectModal = false,
  checkoutService,
}: ConnectWalletProps) => {
  // https://docs.privy.io/guide/react/wallets/external/#connect-or-create
  const { connectOrCreateWallet, authenticated } = usePrivy()
  const { wallets } = useWallets()

  const { email } = useAuth()
  const [userEmail, setUserEmail] = useState<string | undefined>(
    email || undefined
  )

  const [isEmailLoading, setIsEmailLoading] = useState<boolean>(false)

  const { data: userType } = useQuery({
    queryKey: ['userAccountType', userEmail],
    queryFn: async () => {
      setIsEmailLoading(true)
      const result = await locksmith.getUserAccountType(userEmail as string)
      const userAccountType = result.data.userAccountType as UserAccountType[]
      setIsEmailLoading(false)
      return userAccountType
    },
    enabled: !!userEmail,
  })

  const { authenticate } = useAuth()

  useEffect(() => {
    if (!email) {
      setUserEmail('')
    }
  }, [email])

  useEffect(() => {
    connectOrCreateWallet()
  }, [connectOrCreateWallet])

  useEffect(() => {
    const connectWalletProvider = async () => {
      const provider = await wallets[0].getEthereumProvider()
      authenticate(provider)
    }
    connectWalletProvider()
  }, [wallets, authenticate])

  return <LoginModal open={true} />
}
