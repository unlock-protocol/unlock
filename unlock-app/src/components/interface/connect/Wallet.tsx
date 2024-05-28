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

interface ConnectWalletProps {
  onUnlockAccount: (email?: string) => void
  // Optional, but required for Checkout
  injectedProvider?: unknown
}

interface ConnectViaEmailProps {
  onUnlockAccount: (email?: string) => void
}

interface UserDetails {
  email: string
}

export const ConnectViaEmail = ({ onUnlockAccount }: ConnectViaEmailProps) => {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
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
          placeholder="your@email.com"
          error={errors.email?.message}
          {...register('email', {
            required: {
              value: true,
              message: 'Email is required',
            },
          })}
        />
        <Button type="submit" loading={isSubmitting} className="p-2.5">
          Continue with Email
        </Button>
      </form>
    </div>
  )
}

export const ConnectWallet = ({
  onUnlockAccount,
  injectedProvider,
}: ConnectWalletProps) => {
  const { authenticateWithProvider } = useAuthenticate({ injectedProvider })
  const [recentlyUsedProvider] = useLocalStorage(RECENTLY_USED_PROVIDER, null)
  const [isConnecting, setIsConnecting] = useState('')

  const createOnConnectHandler = (provider: any) => {
    const handler: MouseEventHandler<HTMLButtonElement> = async (event) => {
      event.preventDefault()
      setIsConnecting(provider)
      await authenticateWithProvider(provider)
      setIsConnecting('')
    }
    return handler
  }

  return (
    <div className="space-y-6 divide-y divide-gray-100">
      <div className="grid gap-4 px-6">
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
      <div className="grid gap-2 pt-6 px-6 pb-1">
        <div className="px-2 text-sm text-center text-gray-600">
          If you previously created an unlock account or do not have a wallet,
          use this option.
        </div>
        <ConnectViaEmail onUnlockAccount={onUnlockAccount} />
      </div>
    </div>
  )
}
