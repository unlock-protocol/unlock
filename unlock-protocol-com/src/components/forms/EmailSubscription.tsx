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
    <form
      className="sm:min-w-[420px]"
      autoComplete="off"
      onSubmit={handleSubmit}
    >
      <div className="flex justify-between w-full gap-2 py-2 pl-4 pr-2 rounded-full sm:pl-6 bg-brand-gray">
        <input
          type="email"
          placeholder="Type your email here"
          name="email"
          className="text-sm rounded outline-none bg-brand-gray"
          value={email}
          disabled={confirm}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <div>
          <Button disabled={confirm} variant="secondary" type="submit">
            {confirm ? 'Subscribed' : 'Sign Up'}
          </Button>
        </div>
      </div>
    </form>
  )
}
