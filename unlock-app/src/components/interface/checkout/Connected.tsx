import { Button } from '@unlock-protocol/ui'
import { useSelector } from '@xstate/react'
import {
  Fragment,
  MouseEventHandler,
  ReactNode,
  useEffect,
  useState,
} from 'react'
import { useAuth } from '~/contexts/AuthenticationContext'
import { useAuthenticate } from '~/hooks/useAuthenticate'
import { addressMinify } from '~/utils/strings'
import SvgComponents from '../svg'
import { useSIWE } from '~/hooks/useSIWE'
import { CheckoutService } from './main/checkoutMachine'
import { PoweredByUnlock } from './PoweredByUnlock'
import { Stepper } from './Stepper'
import { ConnectButton } from '../connect/Custom'
import { AiOutlineDisconnect as DisconnectIcon } from 'react-icons/ai'

interface SignedInProps {
  onDisconnect?: () => void
  isUnlockAccount: boolean
  email?: string
  account?: string
  isDisconnecting?: boolean
}

export function SignedIn({
  onDisconnect,
  isUnlockAccount,
  email,
  account,
  isDisconnecting,
}: SignedInProps) {
  return (
    <div className="grid divide-y divide-gray-100">
      <div className="flex flex-col items-center justify-center gap-6 p-6">
        <div className="inline-flex items-center gap-2 text-lg font-bold">
          <button
            onClick={(event) => {
              event.preventDefault()
              //copy()
            }}
            className="cursor-pointer"
          >
            {addressMinify(account!)}
          </button>
        </div>
      </div>
      <div className="flex flex-col items-center justify-center p-6 text-center">
        {isUnlockAccount ? (
          <div className="text-gray-700">
            You are successfully verified as {email}
          </div>
        ) : (
          <div className="text-gray-700">
            You are successfully connected as {addressMinify(account!)}
          </div>
        )}
      </div>
      <div className="grid p-6">
        <ConnectButton
          onClick={onDisconnect}
          loading={isDisconnecting}
          icon={<DisconnectIcon size={24} />}
        >
          Disconnect
        </ConnectButton>
      </div>
    </div>
  )
}

interface ConfirmOwnershipProps {
  signIn: () => void
  onDisconnect?: () => void
  isDisconnecting?: boolean
  account: string
}

export function ConfirmOwnership({
  signIn,
  onDisconnect,
  isDisconnecting,
  account,
}: ConfirmOwnershipProps) {
  const session = false

  return (
    <div className="grid divide-y divide-gray-100">
      <div className="flex flex-col items-center justify-center p-6 text-center">
        {session && !isDisconnecting && (
          <div className="text-gray-700">
            You are successfully verified as {addressMinify(account!)}
          </div>
        )}
        {!session && !isDisconnecting && (
          <div className="flex flex-col gap-4">
            <h3 className="text-gray-700">
              Sign message to confirm ownership of your account
            </h3>
            <Button
              loading={false}
              onClick={(event) => {
                event.preventDefault()
                signIn()
              }}
            >
              Confirm Ownership
            </Button>
          </div>
        )}
      </div>
      <div className="grid p-6">
        <ConnectButton
          onClick={onDisconnect}
          loading={isDisconnecting}
          icon={<DisconnectIcon size={24} />}
        >
          Disconnect
        </ConnectButton>
      </div>
    </div>
  )
}

interface SignedOutProps {
  authenticateWithProvider(
    provider:
      | 'METAMASK'
      | 'UNLOCK'
      | 'WALLET_CONNECT'
      | 'COINBASE'
      | 'DELEGATED_PROVIDER'
  ): Promise<void>
  onUnlockAccount(): void
}

export function SignedOut({
  onUnlockAccount,
  authenticateWithProvider,
}: SignedOutProps) {
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
            loading={isConnecting === 'METAMASK'}
            onClick={createOnConnectHandler('METAMASK')}
          >
            Metamask
          </ConnectButton>
        )}

        <ConnectButton
          icon={<SvgComponents.WalletConnect width={40} height={40} />}
          loading={isConnecting === 'WALLET_CONNECT'}
          onClick={createOnConnectHandler('WALLET_CONNECT')}
        >
          WalletConnect
        </ConnectButton>

        <ConnectButton
          icon={<SvgComponents.CoinbaseWallet width={40} height={40} />}
          loading={isConnecting === 'COINBASE'}
          onClick={createOnConnectHandler('COINBASE')}
        >
          Coinbase Wallet
        </ConnectButton>
      </div>
      <div className="grid gap-4 p-6">
        <div className="px-2 text-sm text-center text-gray-600">
          If you previously created an unlock account or do not have a wallet,
          use this option.
        </div>
        <ConnectButton
          icon={<SvgComponents.Unlock width={40} height={40} />}
          loading={isConnecting === 'UNLOCK'}
          onClick={(event) => {
            event.preventDefault()
            onUnlockAccount()
          }}
        >
          Unlock Account
        </ConnectButton>
      </div>
    </div>
  )
}

interface ConnectedCheckoutProps {
  skipAccountDetails?: boolean
  injectedProvider?: unknown
  service: CheckoutService
  children?: ReactNode
}

export function Connected({
  skipAccountDetails = false,
  service,
  injectedProvider,
  children,
}: ConnectedCheckoutProps) {
  const state = useSelector(service, (state) => state)
  const { account, email, isUnlockAccount, deAuthenticate, connected } =
    useAuth()
  const [signing, setSigning] = useState(false)

  const { authenticateWithProvider } = useAuthenticate({
    injectedProvider,
  })
  const { signIn, signOut, isSignedIn } = useSIWE()
  const [isDisconnecting, setIsDisconnecting] = useState(false)
  const useDelegatedProvider =
    state.context?.paywallConfig?.useDelegatedProvider

  useEffect(() => {
    const autoSignIn = async () => {
      if (!isSignedIn && !signing && connected && isUnlockAccount) {
        await signIn()
      }
    }
    autoSignIn()
    // adding signIn creates an inifnite loop for some reason
  }, [connected, useDelegatedProvider, isUnlockAccount, signing, isSignedIn])

  useEffect(() => {
    if (!account) {
      console.debug('Not connected')
    } else {
      console.debug(`Connected as ${account}`)
    }
  }, [account])

  const signToSignIn = async () => {
    setSigning(true)
    await signIn()
    setSigning(false)
  }

  if (useDelegatedProvider) {
    if (isSignedIn) {
      return <div className="space-y-2">{children}</div>
    }
    return (
      <Button
        disabled={!connected || signing}
        loading={signing}
        onClick={signToSignIn}
        className="w-full"
      >
        Continue
      </Button>
    )
  }

  const onDisconnect = async () => {
    setIsDisconnecting(true)
    await signOut()
    await deAuthenticate()
    // service.send({ type: 'DISCONNECT' })
    setIsDisconnecting(false)
  }

  return (
    <Fragment>
      <Stepper service={service} />
      <main className="h-full px-6 py-2 overflow-auto">
        {account ? (
          <div className="space-y-2">
            {children}
            {!skipAccountDetails && (
              <SignedIn
                isDisconnecting={isDisconnecting}
                account={account}
                email={email}
                isUnlockAccount={!!isUnlockAccount}
                onDisconnect={onDisconnect}
              />
            )}
          </div>
        ) : connected ? (
          <ConfirmOwnership
            signIn={signIn}
            onDisconnect={onDisconnect}
            isDisconnecting={isDisconnecting}
          />
        ) : (
          <div className="h-full">
            <SignedOut
              onUnlockAccount={() => {
                service.send({ type: 'UNLOCK_ACCOUNT' })
              }}
              authenticateWithProvider={authenticateWithProvider}
            />
          </div>
        )}
      </main>
      <footer className="grid items-center px-6 pt-6 border-t">
        <Button
          disabled={!account}
          onClick={async (event) => {
            event.preventDefault()

            service.send({
              type: 'SELECT',
            })
          }}
        >
          Next
        </Button>
        <PoweredByUnlock />
      </footer>
    </Fragment>
  )
}
