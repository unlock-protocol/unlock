import { Input, Button } from '@unlock-protocol/ui'
import { useForm } from 'react-hook-form'
import { useMutation } from '@tanstack/react-query'
import { locksmith } from '~/config/locksmith'
import { UserAccountType } from '~/utils/userAccountType'
import { ToastHelper } from '~/components/helpers/toast.helper'
import { useEffect } from 'react'

interface ConnectViaEmailProps {
  onNext: (data: { email: string; accountType: UserAccountType[] }) => void
  email?: string
}

export const ConnectViaEmail = ({ onNext, email }: ConnectViaEmailProps) => {
  const methods = useForm<{ email: string }>({
    defaultValues: {
      email: email || '',
    },
  })

  useEffect(() => {
    if (email && !methods.getValues('email')) {
      methods.setValue('email', email)
      onSubmit({ email })
    }
  }, [email])

  // check user account type
  const checkUserAccountType = useMutation({
    mutationFn: async (email: string) => {
      const response = await locksmith.getUserAccountType(email)
      return (
        response.data.userAccountType?.map((type: string) => {
          switch (type) {
            case 'EMAIL_CODE':
              return UserAccountType.EmailCodeAccount
            case 'UNLOCK_ACCOUNT':
              return UserAccountType.UnlockAccount
            case 'GOOGLE_ACCOUNT':
              return UserAccountType.GoogleAccount
            case 'PASSKEY_ACCOUNT':
              return UserAccountType.PasskeyAccount
            default:
              throw new Error(`Unknown account type: ${type}`)
          }
        }) || []
      )
    },
  })

  // Check if user already has Privy account
  const checkPrivyUserMutation = useMutation({
    mutationFn: async (email: string) => {
      const privyUser = await locksmith.checkPrivyUser({ email })
      return privyUser.data.user
    },
  })

  const onSubmit = async (data: { email: string }) => {
    try {
      const email = data.email.trim()
      if (!email) {
        ToastHelper.error('Email is required')
        return
      }

      // proceed to check account type if no Privy account exists
      const accountType = await checkUserAccountType.mutateAsync(email)
      if (!accountType?.length) {
        ToastHelper.error('No account found for this email')
        return
      }

      onNext({ email, accountType })
    } catch (error) {
      console.error(error)
      ToastHelper.error('An error occurred')
    }
  }

  return (
    <div className="grid gap-2">
      <form className="grid gap-4" onSubmit={methods.handleSubmit(onSubmit)}>
        <Input
          label="Email"
          type="email"
          disabled={
            checkPrivyUserMutation.isPending || checkUserAccountType.isPending
          }
          placeholder="Enter your email"
          {...methods.register('email', {
            required: 'Email is required',
            pattern: {
              value: /^\S+@\S+$/i,
              message: 'Invalid email address',
            },
          })}
          error={methods.formState.errors.email?.message}
        />
        <Button
          type="submit"
          loading={
            checkPrivyUserMutation.isPending || checkUserAccountType.isPending
          }
        >
          Continue
        </Button>
      </form>
    </div>
  )
}
