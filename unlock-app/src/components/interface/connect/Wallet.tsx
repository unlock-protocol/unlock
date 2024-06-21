import {
  RECENTLY_USED_PROVIDER,
  useAuthenticate,
} from '~/hooks/useAuthenticate'
import SvgComponents from '../svg'
import { ConnectButton } from './Custom'
import { useLocalStorage } from '@rehooks/local-storage'
import { MouseEventHandler, useEffect, useState } from 'react'
import { Button, Input } from '@unlock-protocol/ui'
import { useForm } from 'react-hook-form'
import { ConnectUnlockAccount } from './EmailAccount'
import { useAuth } from '~/contexts/AuthenticationContext'
import { CheckoutService } from '../checkout/main/checkoutMachine'
import { getUserAccountType } from '~/utils/getUserAccountType'
import { useQuery } from '@tanstack/react-query'

interface ConnectWalletProps {
  injectedProvider?: unknown
  shoudOpenConnectModal?: boolean
  checkoutService?: CheckoutService
}

interface ConnectViaEmailProps {
  isLoadingUserExists: boolean
  onUnlockAccount: (email: string) => void
}

interface UserDetails {
  email: string
}

export const ConnectViaEmail = ({
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
          placeholder="your@email.com"
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
  injectedProvider,
  shoudOpenConnectModal = false,
  checkoutService,
}: ConnectWalletProps) => {
  const { email } = useAuth()
  const [userEmail, setUserEmail] = useState<string | undefined>(
    email || undefined
  )

  const { data: userType, isLoading: isLoadingUserExists } = useQuery(
    ['userAccountType', userEmail],
    () => getUserAccountType(userEmail as string),
    {
      enabled: !!userEmail,
    }
  )

  const { authenticateWithProvider } = useAuthenticate({ injectedProvider })
  const [recentlyUsedProvider] = useLocalStorage(RECENTLY_USED_PROVIDER, null)
  const [isConnecting, setIsConnecting] = useState('')

  const [isEmailDefined, setIsEmailDefined] = useState(false)

  const isLoading = isEmailDefined && isLoadingUserExists

  const createOnConnectHandler = (provider: any) => {
    const handler: MouseEventHandler<HTMLButtonElement> = async (event) => {
      event.preventDefault()
      setIsConnecting(provider)
      await authenticateWithProvider(provider)
      setIsConnecting('')
    }
    return handler
  }

  useEffect(() => {
    setIsEmailDefined(!!userEmail)
  }, [userEmail])

  const verifyAndSetEmail = async (email: string) => {
    if (email) {
      setUserEmail(email)
    }
  }

  return (
    <div className="space-y-4">
      {(!userEmail || isLoading) && (
        <>
          <div className="grid gap-4 px-6">
            <div className=" text-sm text-gray-600">
              If you have a wallet, connect it now:
            </div>
            {window.ethereum && (
              <ConnectButton
                icon={<SvgComponents.Metamask width={40} height={40} />}
                highlight={recentlyUsedProvider === 'METAMASK'}
                loading={isConnecting === 'METAMASK'}
                onClick={createOnConnectHandler('METAMASK')}
              >
                Metamask
              </ConnectButton>
            )}

            <ConnectButton
              icon={<SvgComponents.WalletConnect width={40} height={40} />}
              highlight={recentlyUsedProvider === 'WALLET_CONNECT'}
              loading={isConnecting === 'WALLET_CONNECT'}
              onClick={createOnConnectHandler('WALLET_CONNECT')}
            >
              WalletConnect
            </ConnectButton>

            <ConnectButton
              icon={<SvgComponents.CoinbaseWallet width={40} height={40} />}
              highlight={recentlyUsedProvider === 'COINBASE'}
              loading={isConnecting === 'COINBASE'}
              onClick={createOnConnectHandler('COINBASE')}
            >
              Coinbase Wallet
            </ConnectButton>
          </div>
          <div className="grid gap-4 pt-2 px-6">
            <div className="text-sm text-gray-600">
              Otherwise, enter your email address:
            </div>
            <ConnectViaEmail
              isLoadingUserExists={isLoading}
              onUnlockAccount={(email: string) => {
                verifyAndSetEmail(email)
              }}
            />
          </div>
        </>
      )}
      {userEmail && !isLoading && (
        <ConnectUnlockAccount
          email={userEmail}
          setEmail={setUserEmail}
          accountType={userType || []}
          useIcon={false}
          shoudOpenConnectModal={shoudOpenConnectModal}
          checkoutService={checkoutService}
        />
      )}
    </div>
  )
}
