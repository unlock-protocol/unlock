import { CheckoutService } from './checkoutMachine'
import { Connected } from '../Connected'
import { Button } from '@unlock-protocol/ui'
import { Fragment } from 'react'
import { useActor } from '@xstate/react'
import { PoweredByUnlock } from '../PoweredByUnlock'
import { Stepper } from '../Stepper'
import { useAuth } from '~/contexts/AuthenticationContext'
import { useLockGuild } from '~/hooks/useLockGuild'
import Link from 'next/link'
import { useDataForGuild } from '~/hooks/useDataForGuild'

interface Props {
  injectedProvider: unknown
  checkoutService: CheckoutService
}

export function Guild({ injectedProvider, checkoutService }: Props) {
  const { account } = useAuth()
  const [state, send] = useActor(checkoutService)
  const { recipients, lock } = state.context

  // Check that all recipients are members  of the guild
  // First, load the guild? Do we need to?
  const users = recipients.length > 0 ? recipients : [account!]

  const { isLoading: isLoadingGuild, data: guild } = useLockGuild({
    lockAddress: lock!.address,
    network: lock!.network,
  })

  const { data, isLoading: useGuildData } = useDataForGuild({
    lockAddress: lock!.address,
    network: lock!.network,
    recipients: users,
  })

  const onSubmit = async () => {
    if (data) {
      send({
        type: 'SUBMIT_DATA',
        data: data,
      })
    }
  }

  const isLoading = isLoadingGuild || useGuildData

  const disabled = data && data.filter((d) => !d).length > 0

  return (
    <Fragment>
      <Stepper service={checkoutService} />
      <main className="h-full px-6 py-2 overflow-auto">
        {!isLoading && (
          <p className=" text-sm">
            In order to purchase this membership the recipient&apos;s address
            needs to belong to the{' '}
            <Link
              className="text-brand-ui-primary"
              target="_blank"
              rel="noreferrer"
              href={`https://guild.xyz/${guild!.urlName}`}
            >
              {guild!.name}
            </Link>{' '}
            guild: <em>{guild!.description}</em>.
          </p>
        )}
      </main>
      <footer className="grid items-center px-6 pt-6 border-t">
        <Connected
          injectedProvider={injectedProvider}
          service={checkoutService}
        >
          <Button
            type="submit"
            form="password"
            className="w-full"
            disabled={disabled}
            loading={isLoading}
            onClick={onSubmit}
          >
            Continue
          </Button>
        </Connected>
        <PoweredByUnlock />
      </footer>
    </Fragment>
  )
}
