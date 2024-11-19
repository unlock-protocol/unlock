import { Input, Button } from '@unlock-protocol/ui'
import { useForm } from 'react-hook-form'
import { useMutation } from '@tanstack/react-query'
import { locksmith } from '~/config/locksmith'
import { getAccountFromPrivateKey } from '~/utils/accounts'
import { ToastHelper } from '../helpers/toast.helper'

interface SignInWithPasswordProps {
  userEmail: string
  onNext: (walletPk: string) => void
}

interface FormData {
  password: string
}

export const SignInWithPassword = ({
  userEmail,
  onNext,
}: SignInWithPasswordProps) => {
  const methods = useForm<FormData>()

  const signInMutation = useMutation({
    mutationFn: async (password: string) => {
      const response = await locksmith.getUserPrivateKey(userEmail)
      if (!response?.data?.passwordEncryptedPrivateKey) {
        throw new Error('No encrypted private key found')
      }
      const wallet = await getAccountFromPrivateKey(
        response.data.passwordEncryptedPrivateKey,
        password
      )
      return wallet.privateKey
    },
    onSuccess: (privateKey) => {
      onNext(privateKey)
    },
    onError: (error) => {
      console.error('Sign in error:', error)
      ToastHelper.error('Sign in failed. Please check your password.')
    },
  })

  const onSubmit = async (data: FormData) => {
    if (!data.password) {
      ToastHelper.error('Password is required')
      return
    }
    await signInMutation.mutateAsync(data.password)
  }

  return (
    <div className="grid gap-2">
      <form className="grid gap-4" onSubmit={methods.handleSubmit(onSubmit)}>
        <div className="flex flex-col gap-1">
          <Input
            label="Password"
            type="password"
            disabled={signInMutation.isPending}
            placeholder="Enter your password"
            {...methods.register('password', {
              required: 'Password is required',
            })}
            error={methods.formState.errors.password?.message}
          />
          <small className="text-sm text-gray-600">
            If you forgot your password, check your emails for an email from us
            titled
            <em>
              &#34;Welcome to Unlock! Please, read this email carefully&#34;
            </em>
          </small>
        </div>
        <Button type="submit" loading={signInMutation.isPending}>
          Sign In
        </Button>
      </form>
    </div>
  )
}
