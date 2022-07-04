import {
  RiRecordCircleFill as CircleIcon,
  RiFlagLine as FinishIcon,
} from 'react-icons/ri'
import UnlockAssets from '@unlock-protocol/unlock-assets'
import { Tooltip } from '@unlock-protocol/ui'
const { SvgComponents } = UnlockAssets

interface ProgressIconProps {
  disabled?: boolean
}

export const ProgressCircleIcon = ({ disabled }: ProgressIconProps) => {
  return (
    <CircleIcon
      size={24}
      className={`fill-brand-ui-primary rounded-full ${
        disabled && 'opacity-75'
      }`}
    />
  )
}

export const ProgressFinishIcon = ({ disabled }: ProgressIconProps) => {
  return (
    <FinishIcon
      size={21.6}
      className={`bg-brand-ui-primary p-0.5 rounded-full fill-white  ${
        disabled && 'opacity-75'
      }`}
    />
  )
}

export const ProgressFinishedIcon = ({ disabled }: ProgressIconProps) => {
  return (
    <SvgComponents.RocketLaunch
      height={20}
      width={20}
      className={`bg-brand-ui-primary p-0.5 rounded-full fill-white  ${
        disabled && 'opacity-75'
      }`}
    />
  )
}

interface IconButtonProps {
  icon(props: ProgressIconProps): JSX.Element
  title: string
  onClick(): void | Promise<void>
  disabled?: boolean
}

export const IconButton = ({
  icon: IconComponent,
  title,
  onClick,
  disabled,
}: IconButtonProps) => {
  return (
    <Tooltip side="top" delay={50} label={title} tip={title}>
      <button
        className="rounded-full"
        aria-label={title}
        onClick={(event) => {
          event.preventDefault()
          onClick()
        }}
        disabled={disabled}
        type="button"
      >
        <IconComponent />
      </button>
    </Tooltip>
  )
}
