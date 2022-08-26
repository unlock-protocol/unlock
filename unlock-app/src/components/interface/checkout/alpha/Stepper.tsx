import { RiFlagLine as FinishIcon } from 'react-icons/ri'
import { Tooltip } from '@unlock-protocol/ui'
import { twMerge } from 'tailwind-merge'
import { ReactNode } from 'react'
import { IoIosRocket as RocketIcon } from 'react-icons/io'
import { CheckoutService } from './Checkout/checkoutMachine'
import { UnlockAccountService } from './UnlockAccount/unlockAccountMachine'

interface IconProps {
  active?: boolean
}

export const Step = ({
  active,
  children = 1,
}: IconProps & { children?: ReactNode }) => {
  const stepIconClass = twMerge(
    `flex items-center justify-center font-medium border-gray-300 box-border border w-5 text-xs h-5 rounded-full cursor-default`,
    active && 'bg-ui-main-500 text-white border-none'
  )
  return <div className={stepIconClass}>{children}</div>
}

export const StepFinish = ({ active }: IconProps) => {
  const finishIconClass = twMerge(
    `font-medium box-border border p-0.5 w-5 text-xs h-5 rounded-full cursor-default`,
    active && 'bg-ui-main-500 text-white fill-white border-none'
  )
  return <FinishIcon size={20} className={finishIconClass} />
}

export const StepFinished = ({ active }: IconProps) => {
  const finishedIconClass = twMerge(
    `font-medium box-border border w-5 p-0.5 text-xs h-5 rounded-full cursor-default`,
    active && 'bg-ui-main-500 text-white fill-white border-none'
  )
  return <RocketIcon size={20} className={finishedIconClass} />
}

interface StepButtonProps {
  children?: ReactNode
  onClick(): void | Promise<void>
  label?: string
}

export const StepButton = ({
  children = 1,
  onClick,
  label,
}: StepButtonProps) => {
  const stepIconClass = twMerge(
    `flex items-center justify-center font-medium border-gray-300 box-border border w-5 text-xs h-5 rounded-full hover:bg-gray-50`
  )
  return (
    <Tooltip side="top" delay={50} label={label} tip={label}>
      <button
        className={stepIconClass}
        onClick={(event) => {
          event.preventDefault()
          onClick()
        }}
        type="button"
      >
        {children}
      </button>
    </Tooltip>
  )
}

export const StepTitle = ({ children }: { children: ReactNode }) => {
  return <h4 className="text-sm font-medium text-ui-main-500">{children}</h4>
}

export interface StepItem {
  id: number
  name: string
  to?: string
  skip?: boolean
}

interface StepperProps {
  items: StepItem[]
  position: number
  service: CheckoutService | UnlockAccountService
  disabled?: boolean
}

export const Stepper = ({
  items,
  position,
  service,
  disabled,
}: StepperProps) => {
  const index = items.findIndex((item) => item.id === position)
  const step = items[index]
  const base = items.slice(0, index).filter((item) => !item?.skip)
  const rest = items.slice(index + 1).filter((item) => !item?.skip)
  return (
    <div className="flex items-center justify-between w-full gap-2 p-2 px-6 border-b">
      <div className="flex items-center gap-1.5">
        {base.map((item, idx) =>
          item.to && !disabled ? (
            <StepButton
              key={idx}
              onClick={() => {
                service.send(item.to as any)
              }}
              label={item.name}
            >
              {idx + 1}
            </StepButton>
          ) : (
            <Step key={idx}>{idx + 1}</Step>
          )
        )}
        {!rest.length ? (
          <StepFinished active />
        ) : (
          <Step active> {base.length + 1}</Step>
        )}
        <StepTitle>{step?.name}</StepTitle>
      </div>
      <div className="flex items-center gap-1.5">
        {rest.map((_, index) =>
          index + 1 >= rest.length ? (
            <StepFinish key={index} />
          ) : (
            <Step key={index}>{base.length + index + 2}</Step>
          )
        )}
      </div>
    </div>
  )
}
