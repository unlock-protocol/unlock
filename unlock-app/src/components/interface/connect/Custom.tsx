import { classed, ComponentProps } from '@tw-classed/react'
import { ReactNode, forwardRef } from 'react'
import { CgSpinnerAlt as SpinnerIcon } from 'react-icons/cg'

const CustomButton = classed(
  'button',
  'inline-flex items-center justify-between px-6 h-12 font-semibold rounded-2xl disabled:opacity-75 disabled:cursor-not-allowed',
  {
    variants: {
      primary: {
        true: 'text-white fill-white bg-ui-main-400 hover:bg-ui-main-500 active:bg-ui-main-500 focus:bg-ui-main-500 disabled:hover:bg-ui-main-400 disabled:active:bg-ui-main-400 disabled:focus:bg-ui-main-400',
        false:
          'bg-gray-50 text-gray-800 fill-gray-800 hover:bg-gray-100 focus:bg-gray-100 active:bg-gray-100 disabled:hover:bg-gray-50 disabled:active:bg-gray-50 disabled:focus:bg-gray-50',
      },
      highlight: {
        true: 'ring-2 ring-ui-main-400',
        false: '',
      },
    },
    defaultVariants: {
      primary: false,
      highlight: false,
    },
  }
)

export const CustomAnchorButton = classed('a', CustomButton)

interface Props extends ComponentProps<typeof CustomButton> {
  loading?: boolean
  icon: ReactNode
  highlight?: boolean
  children: ReactNode
}

export const ConnectButton = forwardRef<HTMLButtonElement, Props>(
  ({ loading, icon, children, highlight, ...props }, ref) => {
    return (
      <CustomButton
        {...props}
        disabled={!!loading}
        ref={ref}
        highlight={!!highlight}
      >
        <div className="flex flex-col items-start w-full">
          {children}
          {highlight && (
            <div className="text-xs text-ui-main-400">Recently used</div>
          )}
        </div>
        {loading ? (
          <SpinnerIcon
            size={24}
            className="animate-spin text-brand-ui-primary"
          />
        ) : (
          icon
        )}
      </CustomButton>
    )
  }
)

ConnectButton.displayName = 'ConnectButton'
