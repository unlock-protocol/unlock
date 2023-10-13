import { useAuth } from '~/contexts/AuthenticationContext'
import { ConnectButton } from './Custom'
import { Button, Placeholder, minifyAddress, Input } from '@unlock-protocol/ui'
import { AiOutlineDisconnect as DisconnectIcon } from 'react-icons/ai'
import useClipboard from 'react-use-clipboard'
import { useSIWE } from '~/hooks/useSIWE'
import { useCallback, useEffect, useState } from 'react'
import { useConnectModal } from '~/hooks/useConnectModal'
import BlockiesSvg from 'blockies-react-svg'
import { useSessionUser } from '~/hooks/useSession'
import { storage } from '~/config/storage'
import { useMutation } from '@tanstack/react-query'
import { SubmitHandler, useForm } from 'react-hook-form'

interface FormProps {
  emailAddress?: string
}

export const ConnectedWallet = () => {
  const { deAuthenticate, displayAccount, connected } = useAuth()
  const { closeConnectModal } = useConnectModal()
  const { signIn, signOut } = useSIWE()
  const [isDisconnecting, setIsDisconnecting] = useState(false)
  const [isSigningIn, setIsSigningIn] = useState(false)
  const { isUnlockAccount } = useAuth()
  const [_, copy] = useClipboard(displayAccount!, {
    successDuration: 1000,
  })
  const { data: user, refetch } = useSessionUser()

  const onSignIn = useCallback(async () => {
    setIsSigningIn(true)
    await signIn()
    setIsSigningIn(false)
    const response = await storage.user()
    if (response.data?.emailAddress) {
      closeConnectModal()
    }
  }, [setIsSigningIn, signIn, closeConnectModal])

  const onSignOut = useCallback(async () => {
    setIsDisconnecting(true)
    await signOut()
    deAuthenticate()
    closeConnectModal()
    setIsDisconnecting(false)
  }, [signOut, deAuthenticate, setIsDisconnecting, closeConnectModal])

  useEffect(() => {
    if (connected && isUnlockAccount) {
      onSignIn()
    }
  }, [onSignIn, connected, isUnlockAccount])

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<FormProps>({})

  const saveEmailMutation = useMutation(async (data: FormProps) => {
    try {
      await storage.updateUser(data)
      closeConnectModal()
    } catch (error: any) {
      if (error.response?.data?.message === 'Validation error') {
        setError('emailAddress', {
          message:
            'There is already a user with that email address. Please use another one!',
        })
      } else {
        setError('emailAddress', {
          message: 'Something went wrong. Please try again later.',
        })
      }
    }
    await refetch()
  })
  const onSubmit: SubmitHandler<FormProps> = async (data) => {
    await saveEmailMutation.mutate(data)
  }

  return (
    <div className="grid divide-y divide-gray-100">
      <div className="flex flex-col items-center justify-center gap-6 p-6">
        <BlockiesSvg address={connected!} size={14} className="rounded-full" />
        <div className="inline-flex items-center gap-2 text-lg font-bold">
          <button
            onClick={(event) => {
              event.preventDefault()
              copy()
            }}
            className="cursor-pointer"
          >
            {minifyAddress(displayAccount!)}
          </button>
        </div>
      </div>
      <div className="flex flex-col items-center justify-center p-6 text-center">
        {isDisconnecting && (
          <Placeholder.Root className="grid w-full">
            <Placeholder.Line />
          </Placeholder.Root>
        )}
        {!isDisconnecting && (
          <>
            {user && (
              <>
                {user?.emailAddress && (
                  <div className="text-gray-700">
                    You are successfully verified as{' '}
                    {minifyAddress(displayAccount!)}
                  </div>
                )}
                {!user?.emailAddress && (
                  <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="flex flex-col gap-4 w-full text-left"
                  >
                    <Input
                      {...register('emailAddress', { required: true })}
                      label="Save your email address"
                      description="We won't share it with anyone."
                      type="email"
                      error={errors.emailAddress?.message}
                    />
                    <Button loading={saveEmailMutation.isLoading} type="submit">
                      Save
                    </Button>
                  </form>
                )}
              </>
            )}
            {!user && (
              <div className="flex flex-col gap-4">
                <h3 className="text-gray-700">
                  Sign message to confirm ownership of your account
                </h3>
                <Button loading={isSigningIn} onClick={onSignIn}>
                  Confirm Ownership
                </Button>
              </div>
            )}
          </>
        )}
      </div>
      <div className="grid p-6">
        <ConnectButton
          onClick={onSignOut}
          loading={isDisconnecting}
          icon={<DisconnectIcon size={24} />}
        >
          Disconnect
        </ConnectButton>
      </div>
    </div>
  )
}
