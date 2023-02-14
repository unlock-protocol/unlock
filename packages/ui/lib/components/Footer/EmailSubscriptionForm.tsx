import React, { useState } from 'react'
import { Button } from '~/components/Button/Button'
import SignUpImageUrl from './../../assets/img-signup-lg.svg'

export interface EmailSubscriptionFormProps {
  onSubmit: (email: string) => void
  title: string
  description?: string
}

export function EmailSubscriptionForm({
  onSubmit,
  title = 'Sign up for Updates',
  description,
}: EmailSubscriptionFormProps) {
  const [email, setEmail] = useState('')
  const [confirm, setConfirm] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!email) {
      return
    }

    if (typeof onSubmit === 'function') {
      await onSubmit(email)
      setConfirm(true)
      // Delay before resetting the form for user to notice the impact
      setTimeout(() => {
        setConfirm(false)
        setEmail('')
      }, 3000)
    }
  }

  const ConfirmButton = (props: any) => {
    return (
      <Button disabled={confirm} variant="secondary" type="submit" {...props}>
        {confirm ? 'Subscribed' : 'Sign Up'}
      </Button>
    )
  }

  return (
    <div
      className={`relative flex overflow-hidden bg-cover shadow-md rounded-3xl`}
      style={{
        backgroundImage: `url(${SignUpImageUrl})`,
      }}
    >
      <div className="grid w-full gap-6 p-6 pb-10 md:gap-2 md:pt-16 md:pb-11 md:px-8 md:grid-cols-2">
        <div className="flex flex-col gap-2 md:gap-4">
          <span className="text-3xl font-semibold md:col-span-1">{title}</span>
          {description && (
            <span className="text-lg text-brand-dark">{description}</span>
          )}
        </div>
        <div className="w-full md:col-span-1">
          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-2 md:flex-row md:gap-0"
          >
            <div className="relative flex w-full items-center p-1.5 rounded-3xl bg-white">
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
        </div>
      </div>
    </div>
  )
}
