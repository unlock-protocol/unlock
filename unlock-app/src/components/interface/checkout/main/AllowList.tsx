import { Fragment } from 'react'
import { useSelector } from '@xstate/react'
import { Button, minifyAddress, Placeholder } from '@unlock-protocol/ui'
import { CheckoutService } from './checkoutMachine'
import { PoweredByUnlock } from '../PoweredByUnlock'
import { Stepper } from '../Stepper'
import LoadingIcon from '../../Loading'
import Disconnect from './Disconnect'
import { useAuthenticate } from '~/hooks/useAuthenticate'
import { useDataForAllowList } from '~/hooks/useDataForForAllowList'

interface Props {
  checkoutService: CheckoutService
}

export function AllowList({ checkoutService }: Props) {
  const { account } = useAuthenticate()
  const { recipients, lock } = useSelector(
    checkoutService,
    (state) => state.context
  )

  const users = recipients.length > 0 ? recipients : [account!]

  const {
    data,
    isLoading: isLoadingAllowListData,
    isFetching: isFetchingAllowListData,
  } = useDataForAllowList({
    hookAddress: lock!.onKeyPurchaseHook!,
    lockAddress: lock!.address,
    network: lock!.network,
    recipients: users,
  })

  const onSubmit = async () => {
    if (data) {
      checkoutService.send({
        type: 'SUBMIT_DATA',
        data: data,
      })
    }
  }

  const isLoading = isLoadingAllowListData || isFetchingAllowListData
  const disabled = !data || data.some((d) => !d)

  return (
    <Fragment>
      <Stepper service={checkoutService} />
      <main className="h-full px-6 py-2 pt-4 overflow-auto text-sm">
        <p>
          Memberships to this lock are restricted to addresses that have been
          pre-approved by this lock&apos;s manager.
        </p>

        {isLoading && (
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
        {!isLoading && (
          <ul className="mt-2 mb-4">
            {users.map((user, index) => {
              if (isLoadingAllowListData) {
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
        )}
      </main>
      <footer className="grid items-center px-6 pt-6 border-t">
        <Button
          type="submit"
          className="w-full"
          disabled={isLoadingAllowListData || disabled}
          loading={isLoading}
          onClick={onSubmit}
        >
          Continue
        </Button>
        <Disconnect service={checkoutService} />
        <PoweredByUnlock />
      </footer>
    </Fragment>
  )
}
