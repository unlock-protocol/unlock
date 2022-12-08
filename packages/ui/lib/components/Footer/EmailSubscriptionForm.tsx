import React, { useState } from 'react'
import { Button } from '@unlock-protocol/ui'

const SVG_DATA_IMAGE = {
  imgSignUpFull: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1000 1000' fill='none' preserveAspectRatio='xMinYMin' className='inset-0 max-w-full max-h-full' %3E%3Cg clip-path='url(%23clip0_8422_11409)'%3E%3Crect width='1200' height='210' fill='%23BFB1F7' /%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M-47.9538 243.873C-46.4252 239.306 -43.685 233.435 -43.1176 232.03C-41.4088 227.789 -39.8302 223.494 -37.9892 219.308C-35.899 214.555 -33.5264 209.929 -31.3299 205.223C-23.9901 189.483 -15.1091 175.018 -7.53086 159.559C12.9188 117.844 56.9639 57.9278 99.901 35.279C128.878 19.9944 181.985 37.919 190.813 71.071C196.254 91.5061 179.553 109.633 165.213 122.414C160.114 126.959 155.016 131.502 149.917 136.047C148.898 136.956 146.858 138.774 146.858 138.774C146.858 138.774 156.084 130.551 160.701 126.435C168.04 119.894 175.598 114.182 184.588 110.891C206.479 102.874 236.004 123.028 242.631 143.066C253.85 176.993 231.551 201.843 207.268 223.487C160.779 264.922 87.0659 295.761 25.3885 302.733C-6.10637 306.293 -30.019 300.618 -50.9946 277.084C-57.3145 269.993 -49.8737 249.606 -47.9538 243.873Z' fill='%23D8F177' /%3E%3C/g%3E%3Cdefs%3E%3CclipPath id='clip0_8422_11409'%3E%3Crect width='1200' height='210' fill='white' /%3E%3C/clipPath%3E%3C/defs%3E%3C/svg%3E")`,
  imgSignUpMobile: `url("data:image/svg+xml,%3Csvg viewBox='0 0 311 308' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cg clip-path='url(%23clip0_8422_11398)'%3E%3Crect width='311' height='308' fill='%23BFB1F7' /%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M-47.9538 243.873C-46.4252 239.306 -43.685 233.435 -43.1176 232.03C-41.4088 227.789 -39.8302 223.494 -37.9892 219.308C-35.899 214.555 -33.5264 209.929 -31.3299 205.223C-23.9901 189.483 -15.1091 175.018 -7.53086 159.559C12.9188 117.844 56.9639 57.9278 99.901 35.279C128.878 19.9944 181.985 37.919 190.813 71.071C196.254 91.5061 179.553 109.633 165.213 122.414C160.114 126.959 155.016 131.502 149.917 136.047C148.898 136.956 146.858 138.774 146.858 138.774C146.858 138.774 156.084 130.551 160.701 126.435C168.04 119.894 175.598 114.182 184.588 110.891C206.479 102.874 236.004 123.028 242.631 143.066C253.85 176.993 231.551 201.843 207.268 223.487C160.779 264.922 87.0659 295.761 25.3885 302.733C-6.10637 306.293 -30.019 300.618 -50.9946 277.084C-57.3145 269.993 -49.8737 249.606 -47.9538 243.873Z' fill='%23D8F177' /%3E%3C/g%3E%3Cdefs%3E%3CclipPath id='clip0_8422_11398'%3E%3Crect width='311' height='308' fill='white' /%3E%3C/clipPath%3E%3C/defs%3E%3C/svg%3E");`,
}

export interface EmailSubscriptionFormProps {
  onSubmit: (email: string) => void
}

export function EmailSubscriptionForm({
  onSubmit,
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
      className="relative flex overflow-hidden bg-red-400 bg-cover rounded-3xl"
      style={{
        backgroundImage: SVG_DATA_IMAGE.imgSignUpFull,
        backgroundSize: 'cover',
      }}
    >
      <div className="absolute inset-0 z-0 w-full h-full">
        <div className="hidden md:block">
          <div
            style={{
              backgroundImage: SVG_DATA_IMAGE.imgSignUpFull,
            }}
          />
        </div>
        <div className="block md:hidden">
          <div
            style={{
              backgroundImage: SVG_DATA_IMAGE.imgSignUpMobile,
            }}
          />
        </div>
      </div>

      <div className="z-10 grid gap-6 p-6 md:gap-2 md:px-8 md:py-20 md:grid-cols-2">
        <span className="text-2xl font-semibold tracking-wider md:col-span-1">
          Sign up for updates & fresh news about Unlock.
        </span>
        <div className="w-full md:col-span-1">
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
        </div>
      </div>
    </div>
  )
}
