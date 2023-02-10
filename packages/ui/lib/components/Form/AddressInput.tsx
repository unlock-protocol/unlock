import { InputHTMLAttributes, ForwardedRef, ReactNode, useState } from 'react'
import type { Size, SizeStyleProp } from '../../types'
import { forwardRef } from 'react'
import { twMerge } from 'tailwind-merge'
import { FieldLayout } from './FieldLayout'
import { Icon } from '../Icon/Icon'
import { FaWallet, FaSpinner } from 'react-icons/fa'
import { IconBaseProps } from 'react-icons'
import { minifyAddress } from '../../utils'
import { Web3Service } from '@unlock-protocol/unlock-js'

export interface Props
  extends Omit<
    InputHTMLAttributes<HTMLInputElement>,
    'size' | 'id' | 'children'
  > {
  label?: string
  size?: Size
  description?: ReactNode
  withIcon?: boolean
  isTruncated?: boolean
  web3Service: Web3Service
  localForm: any // todo: fix typing UseFormReturn<any, any>' is not assignable to type .UseFormReturn<any, any>'. Types of property 'setValue' are incompatible.
  name: string
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

const WalletIcon = (props: IconBaseProps) => (
  <FaWallet {...props} className="fill-gray-500" />
)
const LoadingIcon = (props: IconBaseProps) => (
  <FaSpinner {...props} className="fill-gray-500" />
)

/**
 * Primary Input component for React Hook Form
 *
 * @param label - Label for the input
 * @param name - Name of the input
 * @param type - Type of the input
 * @param localForm - React Hook Form object
 * @returns Input component
 *
 */
export const AddressInput = forwardRef(
  (props: Props, ref: ForwardedRef<HTMLInputElement>) => {
    const {
      size = 'medium',
      value,
      className,
      description,
      label,
      withIcon = true,
      isTruncated,
      web3Service,
      localForm,
      name,
      ...inputProps
    } = props

    if (!localForm) return null
    const { register } = localForm

    const [addressType, setAddressType] = useState('')
    const [resolvedAddress, setResolvedAddress] = useState('')
    const [resolvedName, setResolvedName] = useState('')
    const [loadingResolvedAddress, setLoading] = useState(false)
    const [error, setError] = useState<any>('')
    const [success, setSuccess] = useState('')

    const inputSizeStyle = SIZE_STYLES[size]
    let inputStateStyles = ''

    if (error) {
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

    const handleResolver = async (address: string) => {
      if (address.length) {
        setLoading(true)
        setError('')
        setSuccess('')
        setAddressType('')
      }
      const result = await web3Service.resolveName(address)
      if (result && result.name !== null && result.type === 'address') {
        setLoading(false)
        setAddressType(result.type)
        setSuccess(`It's a valid eth address`)
        setResolvedName(result.name)
        return result.address
      } else if (result && result.address !== null && result.type === 'name') {
        setLoading(false)
        setAddressType(result.type)
        setSuccess(`It's a valid ens name`)
        setResolvedAddress(result.address)
        return result.address
      } else if (
        (result && result.address === null) ||
        (result && result.name === null && result.type === 'error')
      ) {
        setLoading(false)
        setAddressType('error')
        setError(`It's not a valid ens name or address`)
      }
    }
    return (
      <>
        <FieldLayout
          label={label}
          size={size}
          success={success}
          error={error}
          description={description}
        >
          <div className="flex flex-col">
            <div className="relative">
              {withIcon && (
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  {loadingResolvedAddress ? (
                    <div className="animate-spin">
                      <Icon size={size} icon={LoadingIcon} />
                    </div>
                  ) : (
                    <Icon size={size} icon={WalletIcon} />
                  )}
                </span>
              )}
              <input
                {...inputProps}
                id={label}
                className={inputClass}
                {...register(name, {
                  setValueAs: (value: string) => handleResolver(value),
                })}
              />
            </div>
          </div>
        </FieldLayout>
        {!loadingResolvedAddress && (
          <div>
            {addressType === 'name' && resolvedAddress !== '' && (
              <span className="text-gray-600">
                {isTruncated ? minifyAddress(resolvedAddress) : resolvedAddress}
              </span>
            )}
            {addressType === 'address' && resolvedName !== '' && (
              <span className="text-gray-600">
                {isTruncated ? minifyAddress(resolvedName) : resolvedName}
              </span>
            )}
          </div>
        )}
      </>
    )
  }
)

AddressInput.displayName = 'AddressInput'
