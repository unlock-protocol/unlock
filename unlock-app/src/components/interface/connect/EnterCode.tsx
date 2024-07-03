import { Button, Input } from '@unlock-protocol/ui'
import { useForm } from 'react-hook-form'

interface UserDetails {
  email: string
  code: string
}

export interface EnterCodeProps {
  email: string
  callbackUrl: string
  onReturn(): void
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
      window.location.href = `/api/auth/callback/email?email=${encodeURIComponent(
        email
      )}&token=${data.code}&callbackUrl=${encodeURIComponent(callbackUrl)}`
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
            type="number"
            autoComplete="number"
            error={errors.email?.message}
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
        <div className="w-full flex items-center justify-end px-6 py-4">
          <button
            onClick={() => onReturn()}
            className="hover:text-ui-main-600 underline"
          >
            Back
          </button>
        </div>
      </div>
    </div>
  )
}
