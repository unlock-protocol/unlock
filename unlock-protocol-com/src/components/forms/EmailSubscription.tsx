import React, { useState } from 'react'
import { Button } from '@unlock-protocol/ui'

interface Props {
  portalId: string
  formGuid: string
}

export function EmailSubscriptionForm({ portalId, formGuid }: Props) {
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
    // Delay before reseting the form for user to notice the impact
    setTimeout(() => {
      setConfirm(false)
      setEmail('')
    }, 3000)
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="relative flex w-full sm:w-[400px] items-center p-1.5 rounded-3xl bg-brand-gray">
        <input
          type="email"
          placeholder="Type your email here"
          name="email"
          className="w-full border-none rounded-3xl bg-brand-gray focus:border-none focus:ring-0"
          value={email}
          disabled={confirm}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <Button
          className="absolute right-1"
          disabled={confirm}
          variant="secondary"
          type="submit"
        >
          {confirm ? 'Subscribed' : 'Sign Up'}
        </Button>
      </div>
    </form>
  )
}
