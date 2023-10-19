import { CheckoutService } from './checkoutMachine'
import { Connected } from '../Connected'
import { Button, Placeholder, minifyAddress } from '@unlock-protocol/ui'
import { Fragment } from 'react'
import { useActor } from '@xstate/react'
import { PoweredByUnlock } from '../PoweredByUnlock'
import { Stepper } from '../Stepper'
import { useAuth } from '~/contexts/AuthenticationContext'
import { useLockGuild } from '~/hooks/useLockGuild'
import Link from 'next/link'
import { useDataForGuild } from '~/hooks/useDataForGuild'
import { FiExternalLink as ExternalLinkIcon } from 'react-icons/fi'
import LoadingIcon from '../../Loading'

interface Props {
  injectedProvider: unknown
  checkoutService: CheckoutService
}

export function Guild({ injectedProvider, checkoutService }: Props) {
  const { account } = useAuth()
  const [state, send] = useActor(checkoutService)
  const { recipients, lock } = state.context

  const users = recipients.length > 0 ? recipients : [account!]

  const { isLoading: isLoadingGuild, data: guild } = useLockGuild({
    lockAddress: lock!.address,
    network: lock!.network,
  })

  const { data, isLoading: isLoadingGuildData } = useDataForGuild({
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

  const isLoading = isLoadingGuild || isLoadingGuildData
  const disabled = !data || data.filter((d) => !d).length == 0

  return (
    <Fragment>
      <Stepper service={checkoutService} />
      <main className="h-full px-6 py-2 pt-4 overflow-auto text-sm">
        {isLoading && !guild && (
          <Placeholder.Root
            data-testid="placeholder"
            className="flex flex-col w-full gap-5 p-4"
          >
            <div className="flex flex-col gap-2">
              <Placeholder.Line />
              <Placeholder.Line />
            </div>
            <Placeholder.Line size="lg" />
          </Placeholder.Root>
        )}
        {guild && (
          <>
            <p>
              Memberships to this lock are restricted to addresses that belong
              to the{' '}
              <Link
                className="underline text-brand-ui-primary"
                target="_blank"
                rel="noreferrer"
                href={`https://guild.xyz/${guild!.urlName}`}
              >
                {guild!.name}{' '}
                <ExternalLinkIcon
                  size={14}
                  className="inline text-brand-ui-primary"
                />
              </Link>{' '}
              guild.
            </p>
            <ul className="mt-2 mb-4">
              {users.map((user, index) => {
                if (isLoadingGuildData) {
                  return (
                    <li
                      key={user}
                      className="flex items-center w-full gap-1 pl-1 mb-2 text-center"
                    >
                      <LoadingIcon size={14} />
                      {minifyAddress(user)}
                    </li>
                  )
                }
                if (data && data[index]) {
                  return (
                    <li
                      key={user}
                      className="flex items-center w-full gap-1 pl-1 mb-2 text-center"
                    >
                      ✅ {minifyAddress(user)}
                    </li>
                  )
                }
                return (
                  <li
                    key={user}
                    className="flex items-center w-full gap-1 pl-1 mb-2 text-center"
                  >
                    ❌ {minifyAddress(user)}
                  </li>
                )
              })}
            </ul>
            <>
              {disabled && users.length === 1 && (
                <Button
                  className="inline"
                  as="a"
                  target="_blank"
                  rel="noreferrer"
                  href={`https://guild.xyz/${guild!.urlName}`}
                  size="tiny"
                >
                  Join the Guild!
                </Button>
              )}
            </>
            <>
              {disabled && users.length > 1 && (
                <p>
                  Some of the recipients that you have selected are not members
                  of the Guild.{' '}
                  <Button
                    className="inline"
                    as="a"
                    target="_blank"
                    rel="noreferrer"
                    href={`https://guild.xyz/${guild!.urlName}`}
                    size="tiny"
                  >
                    Join the Guild!
                  </Button>
                </p>
              )}
            </>
          </>
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
            disabled={isLoadingGuildData || disabled}
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
