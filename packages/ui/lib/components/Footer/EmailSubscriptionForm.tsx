import React, { useState } from 'react'
import { Button } from '@unlock-protocol/ui'

export const EMAIL_SUBSCRIPTION_FORM = {
  portalId: '19942922',
  formGuid: '868101be-ae3e-422e-bc86-356c96939187',
}

interface EmailSubscriptionFormProps {
  portalId: string
  formGuid: string
}

export function EmailSubscriptionForm({
  portalId,
  formGuid,
}: EmailSubscriptionFormProps) {
  const [email, setEmail] = useState('')
  const [confirm, setConfirm] = useState(false)
  const [_, setError] = useState<string | null>(null)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!email) {
      return
    }
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        formGuid,
        portalId,
        fields: [
          {
            name: 'email',
            value: email,
          },
        ],
      }),
    }

    const endpoint = `https://api.hsforms.com/submissions/v3/integration/submit/${portalId}/${formGuid}`
    const response = await fetch(endpoint, options)

    if (!response.ok) {
      setError(
        'Failed to subscribe due to technical issue. Retry after some time.'
      )
      return
    }
    setConfirm(true)
    // Delay before resetting the form for user to notice the impact
    setTimeout(() => {
      setConfirm(false)
      setEmail('')
    }, 3000)
  }

  const ConfirmButton = (props: any) => {
    return (
      <Button disabled={confirm} variant="secondary" type="submit" {...props}>
        {confirm ? 'Subscribed' : 'Sign Up'}
      </Button>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col w-full gap-2 md:flex-row md:gap-0"
    >
      <div className="relative flex w-full sm:w-[400px] items-center p-1.5 rounded-3xl bg-white">
        <input
          type="email"
          placeholder="Type your email here"
          name="email"
          className="w-full bg-white border-none rounded-3xl focus:border-none focus:ring-0"
          value={email}
          disabled={confirm}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <ConfirmButton className="absolute hidden md:block right-1" />
      </div>

      <ConfirmButton className="flex w-full md:hidden" />
    </form>
  )
}
