import { Input } from '@unlock-protocol/ui'
import { useForm } from 'react-hook-form'
import { forwardRef, useImperativeHandle } from 'react'

interface ConnectViaEmailProps {
  email: string
  onEmailChange: (email: string) => void
  isLoadingUserExists: boolean
}

export type ConnectViaEmailRef = {
  handleSubmit: ReturnType<typeof useForm>['handleSubmit']
}

export const ConnectViaEmail = forwardRef<
  ConnectViaEmailRef,
  ConnectViaEmailProps
>(({ email, isLoadingUserExists }, ref) => {
  const methods = useForm<{ email: string }>({
    defaultValues: { email },
  })

  useImperativeHandle(ref, () => ({
    handleSubmit: methods.handleSubmit,
  }))

  return (
    <div className="grid gap-2">
      <form className="grid gap-4">
        <Input
          label="Email"
          type="email"
          disabled={isLoadingUserExists}
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
      </form>
    </div>
  )
})

ConnectViaEmail.displayName = 'ConnectViaEmail'
