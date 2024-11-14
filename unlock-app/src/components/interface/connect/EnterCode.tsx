import { Button, Input } from '@unlock-protocol/ui'
import { signIn as nextAuthSignIn } from 'next-auth/react'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { ToastHelper } from '~/components/helpers/toast.helper'

interface UserDetails {
  email: string
  code: string
}

export interface EnterCodeProps {
  email: string
  callbackUrl: string
  onReturn?(): void
}

export const EnterCode = ({ email, callbackUrl, onReturn }: EnterCodeProps) => {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
    setValue,
  } = useForm<UserDetails>()

  useEffect(() => {
    if (email) {
      setValue('email', email)
    }
  }, [email, setValue])

  const onSubmit = async (data: UserDetails) => {
    if (!data.email) return
    try {
      const value = await nextAuthSignIn('credentials', {
        callbackUrl: callbackUrl,
        email: email,
        code: data.code,
        redirect: false,
      })

      if (value?.error) {
        ToastHelper.error('Invalid code')
      } else {
        // Call the onReturn callback upon successful verification
        if (onReturn) {
          await onReturn()
        }
      }
      return
    } catch (error) {
      if (error instanceof Error) {
        setError(
          'code',
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

  return (
    <div className="grid gap-4">
      <div className="text-sm">
        An email code has been sent. Check your inbox or spam folder.
      </div>
      <form className="grid gap-4" onSubmit={handleSubmit(onSubmit)}>
        <Input
          type="text"
          autoComplete="text"
          placeholder="Code"
          error={errors.code?.message}
          {...register('code', {
            required: {
              value: true,
              message: 'Code is required',
            },
          })}
          actions={
            <Button
              type="submit"
              variant="borderless"
              loading={isSubmitting}
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
