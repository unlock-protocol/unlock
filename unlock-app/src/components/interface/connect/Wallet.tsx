import {
  RECENTLY_USED_PROVIDER,
  useAuthenticate,
} from '~/hooks/useAuthenticate'
import SvgComponents from '../svg'
import { ConnectButton } from './Custom'
import { useLocalStorage } from '@rehooks/local-storage'
import { MouseEventHandler, useState } from 'react'
import { Button, Input } from '@unlock-protocol/ui'
import { useForm } from 'react-hook-form'
import { ConnectUnlockAccount } from './UnlockAccount'
import { useAuth } from '~/contexts/AuthenticationContext'
import { ToastHelper } from '~/components/helpers/toast.helper'
import { useStorageService } from '~/utils/withStorageService'

interface ConnectWalletProps {
  injectedProvider?: unknown
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

export const ConnectWallet = ({ injectedProvider }: ConnectWalletProps) => {
  const { email, isUnlockAccount } = useAuth()
  const [useUnlockAccount, setUseUnlockAccount] = useState<string | undefined>(
    email || undefined
  )
  const [isExistingUser, setIsExistingUser] = useState<boolean>(
    useUnlockAccount !== ''
  )

  const { authenticateWithProvider } = useAuthenticate({ injectedProvider })
  const [recentlyUsedProvider] = useLocalStorage(RECENTLY_USED_PROVIDER, null)
  const [isConnecting, setIsConnecting] = useState('')
  const [isLoadingUserExists, setIsLoadingUserExists] = useState(false)

  const storageService = useStorageService()

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
    setIsLoadingUserExists(true)
    try {
      const existingUser = await storageService.userExist(email)
      if (existingUser) {
        setUseUnlockAccount(email)
        setIsExistingUser(true)
        setIsLoadingUserExists(false)
        return
      }
    } catch (error) {
      if (error instanceof Error) {
        ToastHelper.error(`Email Error: ${error.message}`)
      }
    }
    setUseUnlockAccount(email)
    setIsLoadingUserExists(false)
    setIsExistingUser(false)
  }

  return (
    <div className="space-y-4">
      {useUnlockAccount === undefined && !isUnlockAccount && (
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
                console.log('email', email)
                verifyAndSetEmail(email)
              }}
            />
          </div>
        </>
      )}
      {(useUnlockAccount != undefined || isUnlockAccount) && (
        <ConnectUnlockAccount
          defaultEmail={useUnlockAccount}
          setDefaultEmail={setUseUnlockAccount}
          isExistingUser={isExistingUser}
          useIcon={false}
        />
      )}
    </div>
  )
}
