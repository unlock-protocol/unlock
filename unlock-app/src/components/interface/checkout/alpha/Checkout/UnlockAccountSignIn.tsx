import { useActor } from '@xstate/react'
import { UnlockAccount } from '../UnlockAccount'
import { CheckoutService } from './checkoutMachine'
import { UnlockAccountService } from '../UnlockAccount/unlockAccountMachine'
import { CheckoutHead, CloseButton } from '../Shell'
import { useCheckoutHeadContent } from '../useCheckoutHeadContent'
import { ProgressCircleIcon, ProgressFinishIcon } from '../Progress'
interface Props {
  injectedProvider: unknown
  checkoutService: CheckoutService
  onClose(params?: Record<string, string>): void
}

export function UnlockAccountSignIn({
  checkoutService,
  injectedProvider,
  onClose,
}: Props) {
  const [state] = useActor(checkoutService)
  const { paywallConfig } = state.context
  const { title, description, iconURL } =
    useCheckoutHeadContent(checkoutService)
  const unlockAccountService = state.children
    .unlockAccount as UnlockAccountService

  return (
    <div className="bg-white max-w-md rounded-xl flex flex-col w-full h-[80vh]">
      <div className="flex items-center justify-end mt-4 mx-4">
        <CloseButton onClick={() => onClose()} />
      </div>
      <CheckoutHead
        title={paywallConfig.title}
        iconURL={iconURL}
        description={description}
      />
      <div className="flex px-6 mt-6 flex-wrap items-center w-full gap-2">
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
          <h4 className="text-sm "> {title}</h4>
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
    </div>
  )
}
