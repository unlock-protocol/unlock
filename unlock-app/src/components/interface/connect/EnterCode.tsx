import { Button, Input } from '@unlock-protocol/ui'
import { signIn } from 'next-auth/react'
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

  if (email) {
    setValue('email', email)
  }

  const onSubmit = async (data: UserDetails) => {
    if (!data.email) return
    try {
      const value = await signIn('credentials', {
        callbackUrl: callbackUrl,
        email: email,
        code: data.code,
        redirect: false,
      })

      if (value?.error) {
        ToastHelper.error('Invalid code')
      }

      return
    } catch (error) {
      if (error instanceof Error) {
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
  }

  return (
    <div className="grid gap-2 px-6">
      <div className="grid gap-4">
        <div className="text-sm text-gray-600">
          We have sent an email to you containing your sign-in code. Please
          check your inbox. If you do not see the email in your inbox, please
          check your spam or junk folder.
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
        {onReturn && (
          <div className="w-full flex items-center justify-end px-6 py-4">
            <button
              onClick={() => onReturn()}
              className="hover:text-ui-main-600 underline"
            >
              Back
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
