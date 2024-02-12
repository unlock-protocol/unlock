import { TfiReload } from 'react-icons/tfi'
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

  const {
    data,
    isLoading: isLoadingGuildData,
    isFetching: isFetchingGuildData,
    refetch,
  } = useDataForGuild({
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

  const isLoading = isLoadingGuild || isLoadingGuildData || isFetchingGuildData
  const disabled = !data || data.some((d) => !d)

  const isFarCon =
    guild &&
    [
      '0x238b522Fa4d04bFe0B9B875e9CcEa6d3f98d51d2',
      '0x27fB25e111d2540B195a4A0C6e471a5E7e8Cd6Ec',
      '0x456CC03543d41Eb1c9a7cA9FA86e9383B404f50d',
    ]
      .map((address) => address.toLowerCase())
      .indexOf(lock!.address.toLowerCase()) > -1

  return (
    <Fragment>
      <Stepper service={checkoutService} />
      <main className="h-full px-6 py-2 pt-4 overflow-auto text-sm">
        {isLoading && !guild && (
          <Placeholder.Root
            data-testid="placeholder"
            className="flex flex-col w-full gap-5 "
          >
            <div className="flex flex-col gap-2">
              <Placeholder.Line />
              <Placeholder.Line />
            </div>
            <Placeholder.Line size="lg" />
          </Placeholder.Root>
        )}
        {isFarCon && (
          <div className="">
            {disabled && (
              <>
                <p className="my-2">
                  ❌ Your wallet address ({minifyAddress(users[0])}) is not on
                  the list of approved attendees for this{' '}
                  <Link
                    className="underline text-brand-ui-primary"
                    target="_blank"
                    rel="noreferrer"
                    href="https://farcon.xyz/"
                  >
                    FarCon
                  </Link>{' '}
                  class of tickets.
                </p>
                <p className="my-2">
                  Please check that you have been approved and use the address
                  linked to your Farcaster account.{' '}
                </p>
                <Button
                  loading={isLoading}
                  onClick={() => {
                    console.log('refetch')
                    refetch()
                  }}
                  iconLeft={<TfiReload />}
                  size="tiny"
                >
                  Check again
                </Button>
              </>
            )}
            {!disabled && !isLoading && (
              <p>✅ Your wallet is on the list of approved attendees!</p>
            )}
          </div>
        )}
        {guild && !isFarCon && (
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
                <div className="flex flex-row gap-2">
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
                  <Button
                    loading={isLoading}
                    onClick={() => {
                      console.log('refetch')
                      refetch()
                    }}
                    iconLeft={<TfiReload />}
                    size="tiny"
                  >
                    Check again
                  </Button>
                </div>
              )}
            </>
            <>
              {disabled && users.length > 1 && (
                <p>
                  Some of the recipients that you have selected are not members
                  of the Guild.{' '}
                  <div className="flex flex-row gap-2">
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
                    <Button
                      loading={isLoading}
                      onClick={() => {
                        console.log('refetch')
                        refetch()
                      }}
                      iconLeft={<TfiReload />}
                      size="tiny"
                    >
                      Check again
                    </Button>
                  </div>
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
