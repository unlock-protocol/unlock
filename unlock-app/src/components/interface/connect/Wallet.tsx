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
import { ConnectUnlockAccount } from './UnlockAccount'
import { useAuth } from '~/contexts/AuthenticationContext'
import { UserAccountType } from '~/utils/userAccountType'
import { CheckoutService } from '../checkout/main/checkoutMachine'
import { getUserAccountType } from '~/utils/getUserAccountType'

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
  const [userAccountType, setUserAccountType] = useState<UserAccountType[]>([])

  useEffect(() => {
    const userAccountType = async () => {
      if (!userEmail) {
        setIsLoadingUserExists(false)
        return
      }

      const userType = await getUserAccountType(userEmail)
      setUserAccountType(userType)
      setIsLoadingUserExists(false)
    }

    userAccountType()
  }, [userEmail])

  const { authenticateWithProvider } = useAuthenticate({ injectedProvider })
  const [recentlyUsedProvider] = useLocalStorage(RECENTLY_USED_PROVIDER, null)
  const [isConnecting, setIsConnecting] = useState('')
  const [isLoadingUserExists, setIsLoadingUserExists] = useState(false)

  const createOnConnectHandler = (provider: any) => {
    const handler: MouseEventHandler<HTMLButtonElement> = async (event) => {
      event.preventDefault()
      setIsConnecting(provider)
      await authenticateWithProvider(provider)
      setIsConnecting('')
    }
    return handler
  }

  const verifyAndSetEmail = async (email: string) => {
    if (email) {
      setIsLoadingUserExists(true)
      setUserEmail(email)
    }
  }

  return (
    <div className="space-y-4">
      {(!userEmail || isLoadingUserExists) && (
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
              isLoadingUserExists={isLoadingUserExists}
              onUnlockAccount={(email: string) => {
                verifyAndSetEmail(email)
              }}
            />
          </div>
        </>
      )}
      {userEmail && !isLoadingUserExists && (
        <ConnectUnlockAccount
          email={userEmail}
          setEmail={setUserEmail}
          accountType={userAccountType}
          useIcon={false}
          shoudOpenConnectModal={shoudOpenConnectModal}
          checkoutService={checkoutService}
        />
      )}
    </div>
  )
}
