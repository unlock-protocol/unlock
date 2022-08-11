import { useActor } from '@xstate/react'
import { UnlockAccount } from '../UnlockAccount'
import { CheckoutService } from './checkoutMachine'
import { UnlockAccountService } from '../UnlockAccount/unlockAccountMachine'
import { ProgressCircleIcon, ProgressFinishIcon } from '../Progress'
import { Fragment } from 'react'
interface Props {
  injectedProvider: unknown
  checkoutService: CheckoutService
}

export function UnlockAccountSignIn({
  checkoutService,
  injectedProvider,
}: Props) {
  const [state] = useActor(checkoutService)
  const { paywallConfig } = state.context

  const unlockAccountService = state.children
    .unlockAccount as UnlockAccountService

  return (
    <Fragment>
      <div className="flex px-6 p-2 flex-wrap items-center w-full gap-2">
        <div className="flex items-center gap-2 col-span-4">
          <button
            aria-label="exit"
            onClick={(event) => {
              event.preventDefault()
              unlockAccountService.send('EXIT')
            }}
            className="p-2 w-16 bg-brand-ui-primary inline-flex items-center justify-center rounded-full"
          >
            <div className="p-0.5 w-12 bg-white rounded-full"></div>
          </button>
          <h4 className="text-sm "></h4>
        </div>
        <div className="border-t-4 w-full flex-1"></div>
        <div className="inline-flex items-center gap-0.5">
          <ProgressCircleIcon disabled />
          {paywallConfig.messageToSign && <ProgressCircleIcon disabled />}
          <ProgressCircleIcon disabled />
          <ProgressFinishIcon disabled />
        </div>
      </div>
      <UnlockAccount
        unlockAccountService={unlockAccountService}
        injectedProvider={injectedProvider}
      />
    </Fragment>
  )
}
