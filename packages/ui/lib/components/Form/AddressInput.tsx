import {
  InputHTMLAttributes,
  ForwardedRef,
  ReactNode,
  useState,
  useEffect
} from 'react'
import { ethers } from 'ethers'
import type { Size, SizeStyleProp } from '../../types'
import { forwardRef } from 'react'
import { twMerge } from 'tailwind-merge'
import { FieldLayout } from './FieldLayout'
import { Icon } from '../Icon/Icon'
import { FaWallet as WalletIcon } from 'react-icons/fa'
import { IconBaseProps } from 'react-icons'
import { minifyAddress } from '../../utils'
import { FieldErrors } from 'react-hook-form'

export interface Props
  extends Omit<
    InputHTMLAttributes<HTMLInputElement>,
    'size' | 'id' | 'children'
  > {
  label?: string
  size?: Size
  success?: string
  errors?: FieldErrors
  description?: ReactNode
  withIcon?: boolean
  isTruncated?: Boolean
  address?: string
  resolvedEns?: string
  web3Service?: any
}

const SIZE_STYLES: SizeStyleProp = {
  small: 'pl-2.5 py-1.5 text-sm',
  medium: 'pl-4 py-2 text-base',
  large: 'pl-4 py-2.5',
}

const STATE_STYLES = {
  error:
    'border-brand-secondary hover:border-brand-secondary focus:border-brand-secondary focus:ring-brand-secondary',
  success:
    'border-green-500 hover:border-green-500 focus:border-green-500 focus:ring-green-500',
}

const CustomizedIcon = (props: IconBaseProps) => <WalletIcon {...props} className="fill-gray-500" />

 export const AddressInput = forwardRef(
  (props: Props, ref: ForwardedRef<HTMLInputElement>) => {
    const {
      size = 'medium',
      value,
      className,
      errors,
      success,
      description,
      label,
      withIcon = true,
      isTruncated,
      address,
      resolvedEns,
      web3Service,
      ...inputProps
    } = props

    const inputSizeStyle = SIZE_STYLES[size]
    let inputStateStyles = ''

    if (errors) {
      inputStateStyles = STATE_STYLES.error
    } else if (success) {
      inputStateStyles = STATE_STYLES.success
    }

    const inputClass = twMerge(
      'block w-full box-border rounded-lg transition-all shadow-sm border border-gray-400 hover:border-gray-500 focus:ring-gray-500 focus:border-gray-500 focus:outline-none flex-1 disabled:bg-gray-100',
      inputSizeStyle,
      inputStateStyles,
      withIcon ? 'pl-10' : undefined
    )

    const [resolvedAddress, setResolvedAddress] = useState('')
    const [loadingResolvedAddress, setLoading] = useState(true)
   
    const isValidEns = address?.includes('.eth')
    const isValidAddress = address && ethers.utils.isAddress(address)
  
    useEffect(() => {
      const resolveEns = async () => {
        if (address && isValidEns) {
          const result = await web3Service.resolveEns(address)
            if (result) {
              setResolvedAddress(result)
              setLoading(false)
            }
        }
      }
      resolveEns()
    }, [address, isValidEns ])

    return (
      <>
        <FieldLayout
          label={label}
          size={size}
          success={success}
          description={description}
        >
          <div className="flex flex-col">
            <div className="relative">
              {withIcon && (
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Icon size={size} icon={CustomizedIcon} />
                </span>
              )}
              <input
                {...inputProps}
                id={label}
                value={value}
                ref={ref}
                className={inputClass}
              />
            </div>
          </div>
        </FieldLayout>
        <div>
          {!isValidEns && !isValidAddress && address ? (
            <span className='text-rose-700'>Please enter a valid ens or address</span>
          ) : isValidEns  && loadingResolvedAddress ? (
            <span className='text-gray-600'>
              Loading resolved address...
            </span>
          ) : resolvedAddress !== '' && isTruncated ? (
            <span className='text-gray-600'>
              {minifyAddress(resolvedAddress)}
            </span>
          ) : resolvedAddress !== '' && (
            <span className='text-gray-600'>
              {resolvedAddress}
            </span>
          )}
        </div>
      </>
    )
  }
)

AddressInput.displayName = 'AddressInput'