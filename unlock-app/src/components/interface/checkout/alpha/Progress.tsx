import { useActor, useSelector } from '@xstate/react'
import { CheckoutPage, CheckoutService } from './Checkout/checkoutMachine'
import { useCheckoutHeadContent } from './useCheckoutHeadContent'
import {
  RiRecordCircleFill as CircleIcon,
  RiFlagLine as FinishIcon,
} from 'react-icons/ri'
import UnlockAssets from '@unlock-protocol/unlock-assets'

const { SvgComponents } = UnlockAssets

interface ProgressIconProps {
  disabled?: boolean
}

const ProgressCircleIcon = ({ disabled }: ProgressIconProps) => {
  return (
    <CircleIcon
      size={26}
      className={`fill-brand-ui-primary ${disabled && 'opacity-75'}`}
    />
  )
}

const ProgressFinishIcon = ({ disabled }: ProgressIconProps) => {
  return (
    <FinishIcon
      size={21.6}
      className={`bg-brand-ui-primary p-0.5 rounded-full fill-white  ${
        disabled && 'opacity-75'
      }`}
    />
  )
}

const ProgressFinishedIcon = ({ disabled }: ProgressIconProps) => {
  return (
    <SvgComponents.RocketLaunch
      height={22}
      width={22}
      className={`bg-brand-ui-primary p-0.5 rounded-full fill-white  ${
        disabled && 'opacity-75'
      }`}
    />
  )
}

interface Props {
  checkoutService: CheckoutService
}

export function ProgressIndicator({ checkoutService }: Props) {
  const [state] = useActor(checkoutService)
  const matched = state.value.toString() as CheckoutPage
  const paywallConfig = useSelector(
    checkoutService,
    (state) => state.context.paywallConfig
  )
  const { title } = useCheckoutHeadContent(paywallConfig, matched)

  switch (matched) {
    case 'SELECT': {
      return (
        <div className="flex flex-wrap items-center w-full gap-2">
          <div className="flex items-center gap-2 col-span-4">
            <div>
              <ProgressCircleIcon />
            </div>
            <h4 className="text-sm font-medium"> {title}</h4>
          </div>
          <div className="border-t-4 w-full flex-1"></div>
          <div className="inline-flex items-center gap-1">
            <ProgressCircleIcon disabled />
            <ProgressCircleIcon disabled />
            {paywallConfig.messageToSign && <ProgressCircleIcon disabled />}
            <ProgressCircleIcon disabled />
            <ProgressFinishIcon disabled />
          </div>
        </div>
      )
    }
    case 'QUANTITY': {
      return (
        <div className="flex flex-wrap items-center w-full gap-2">
          <div className="flex items-center gap-2 col-span-4">
            <div className="flex items-center gap-0.5">
              <ProgressCircleIcon />
              <ProgressCircleIcon />
            </div>
            <h4 className="text-sm font-medium"> {title}</h4>
          </div>
          <div className="border-t-4 w-full flex-1"></div>
          <div className="inline-flex items-center gap-0.5">
            <ProgressCircleIcon disabled />
            {paywallConfig.messageToSign && <ProgressCircleIcon disabled />}
            <ProgressCircleIcon disabled />
            <ProgressFinishIcon disabled />
          </div>
        </div>
      )
    }
    case 'UNLOCK_ACCOUNT': {
      return (
        <div className="flex flex-wrap items-center w-full gap-2">
          <div className="flex items-center gap-2 col-span-4">
            <div className="flex items-center gap-0.5">
              <div className="p-2 w-16 bg-brand-ui-primary inline-flex items-center justify-center rounded-full">
                <div className="p-0.5 w-12 bg-white rounded-full"></div>
              </div>
            </div>
            <h4 className="text-sm font-medium"> {title}</h4>
          </div>
          <div className="border-t-4 w-full flex-1"></div>
          <div className="inline-flex items-center gap-0.5">
            <ProgressCircleIcon disabled />
            {paywallConfig.messageToSign && <ProgressCircleIcon disabled />}
            <ProgressCircleIcon disabled />
            <ProgressFinishIcon disabled />
          </div>
        </div>
      )
    }
    case 'CARD': {
      return (
        <div className="flex flex-wrap items-center w-full gap-2">
          <div className="flex items-center gap-2 col-span-4">
            <div className="flex items-center gap-0.5">
              <div className="p-2 w-16 bg-brand-ui-primary inline-flex items-center justify-center rounded-full">
                <div className="p-0.5 w-12 bg-white rounded-full"></div>
              </div>
            </div>
            <h4 className="text-sm font-medium"> {title}</h4>
          </div>
          <div className="border-t-4 w-full flex-1"></div>
          <div className="inline-flex items-center gap-0.5">
            <ProgressCircleIcon disabled />
            {paywallConfig.messageToSign && <ProgressCircleIcon disabled />}
            <ProgressCircleIcon disabled />
            <ProgressFinishIcon disabled />
          </div>
        </div>
      )
    }

    case 'METADATA': {
      return (
        <div className="flex flex-wrap items-center w-full gap-2">
          <div className="flex items-center gap-2 col-span-4">
            <div className="flex items-center gap-0.5">
              <ProgressCircleIcon />
              <ProgressCircleIcon />
              <ProgressCircleIcon />
            </div>
            <h4 className="text-sm font-medium"> {title}</h4>
          </div>
          <div className="border-t-4 w-full flex-1"></div>
          <div className="inline-flex items-center gap-1">
            {paywallConfig.messageToSign && <ProgressCircleIcon disabled />}
            <ProgressCircleIcon disabled />
            <ProgressFinishIcon disabled />
          </div>
        </div>
      )
    }

    case 'MESSAGE_TO_SIGN': {
      return (
        <div className="flex flex-wrap items-center w-full gap-2">
          <div className="flex items-center gap-2 col-span-4">
            <div className="flex items-center gap-0.5">
              <ProgressCircleIcon />
              <ProgressCircleIcon />
              <ProgressCircleIcon />
              <ProgressCircleIcon />
            </div>
            <h4 className="text-sm font-medium"> {title}</h4>
          </div>
          <div className="border-t-4 w-full flex-1"></div>
          <div className="inline-flex items-center gap-1">
            <ProgressCircleIcon disabled />
            <ProgressFinishIcon disabled />
          </div>
        </div>
      )
    }
    case 'CAPTCHA': {
      return (
        <div className="flex flex-wrap items-center w-full gap-2">
          <div className="flex items-center gap-2 col-span-4">
            <div className="flex items-center gap-0.5">
              {paywallConfig.messageToSign ? (
                <div className="p-2 w-32 bg-brand-ui-primary inline-flex items-center justify-center rounded-full">
                  <div className="p-0.5 w-28 bg-white rounded-full"></div>
                </div>
              ) : (
                <div className="p-2 w-28 bg-brand-ui-primary inline-flex items-center justify-center rounded-full">
                  <div className="p-0.5 w-24 bg-white rounded-full"></div>
                </div>
              )}
            </div>
            <h4 className="text-sm font-medium"> {title}</h4>
          </div>
          <div className="border-t-4 w-full flex-1"></div>
          <div className="inline-flex items-center gap-1">
            <ProgressCircleIcon disabled />
            <ProgressFinishIcon disabled />
          </div>
        </div>
      )
    }

    case 'CONFIRM': {
      return (
        <div className="flex flex-wrap items-center w-full gap-2">
          <div className="flex items-center gap-2 col-span-4">
            <div className="flex items-center gap-0.5">
              <ProgressCircleIcon />
              <ProgressCircleIcon />
              <ProgressCircleIcon />
              <ProgressCircleIcon />
              {paywallConfig.messageToSign && <ProgressCircleIcon />}
            </div>
            <h4 className="text-sm font-medium"> {title}</h4>
          </div>
          <div className="border-t-4 w-full flex-1"></div>
          <div className="inline-flex items-center gap-1">
            <ProgressFinishIcon disabled />
          </div>
        </div>
      )
    }
    case 'MINTING': {
      return (
        <div className="flex flex-wrap items-center w-full gap-2">
          <div className="flex items-center gap-2 col-span-4">
            <div className="flex items-center gap-0.5">
              <ProgressCircleIcon />
              <ProgressCircleIcon />
              <ProgressCircleIcon />
              {paywallConfig.messageToSign && <ProgressCircleIcon />}
              <ProgressCircleIcon />
              <ProgressFinishedIcon />
            </div>
            <h4 className="text-sm font-medium"> {title}</h4>
          </div>
          <div className="border-t-4 w-full flex-1"></div>
        </div>
      )
    }

    default: {
      return null
    }
  }
}
