import { Button, Input } from '@unlock-protocol/ui'
import { useActor } from '@xstate/react'
import { useState } from 'react'
import { FieldValues, useForm } from 'react-hook-form'
import { useStorageService } from '~/utils/withStorageService'
import { PoweredByUnlock } from '../PoweredByUnlock'
import { UnlockAccountService } from './unlockAccountMachine'

interface Props {
  unlockAccountService: UnlockAccountService
}

export function EnterEmail({ unlockAccountService }: Props) {
  const [_, send] = useActor(unlockAccountService)
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm()
  const storageService = useStorageService()
  const [isContinuing, setIsContinuing] = useState(false)
  async function onSubmit({ email }: FieldValues) {
    try {
      setIsContinuing(true)
      const existingUser = await storageService.userExist(email)
      send({
        type: 'SUBMIT_USER',
        email,
        existingUser,
      })
      setIsContinuing(false)
    } catch (error) {
      if (error instanceof Error) {
        setError('email', {
          type: 'value',
          message: error.message,
        })
      }
      setIsContinuing(false)
    }
  }

  return (
    <div>
      <main className="p-6 overflow-auto h-64 sm:h-72">
        <div className="space-y-4">
          <h3 className="font-bold">
            Let&apos;s start with your email address
          </h3>
          <form id="enter-email" onSubmit={handleSubmit(onSubmit)}>
            <Input
              label="Email Address"
              type="email"
              size="small"
              placeholder="julien@unlock-protocol.com"
              required
              error={errors?.email?.message}
              description="If you have previously created account with Unlock, please enter the same email to contine"
              {...register('email', {
                required: true,
              })}
            />
          </form>
        </div>
      </main>
      <footer className="px-6 pt-6 border-t grid items-center">
        <Button
          loading={isContinuing}
          form="enter-email"
          disabled={isContinuing}
          type="submit"
        >
          {isContinuing ? 'Continuing' : 'Continue'}
        </Button>
        <PoweredByUnlock />
      </footer>
    </div>
  )
}
