import {
  InputHTMLAttributes,
  ForwardedRef,
  ReactNode,
  useState,
  useEffect
} from 'react'
import type { Size, SizeStyleProp } from '../../types'
import { forwardRef } from 'react'
import { twMerge } from 'tailwind-merge'
import { FieldLayout } from './FieldLayout'
import { Icon } from '../Icon/Icon'
import { FaWallet as WalletIcon } from 'react-icons/fa'
import { IconBaseProps } from 'react-icons'
import { isValidAddress, isValidEns, minifyAddress } from '../../utils'

export interface Props
  extends Omit<
    InputHTMLAttributes<HTMLInputElement>,
    'size' | 'id' | 'children'
  > {
  label?: string
  size?: Size
  description?: ReactNode
  withIcon?: boolean
  isTruncated?: Boolean
  address?: string
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
      description,
      label,
      withIcon = true,
      isTruncated,
      address,
      web3Service,
      ...inputProps
    } = props

    const [addressType, setAddressType] = useState('')
    const [resolvedAddress, setResolvedAddress] = useState('')
    const [resolvedName, setResolvedName] = useState('')
    const [loadingResolvedAddress, setLoading] = useState(false)
    const [error, setError] = useState<any>('')
    const [success, setSuccess] = useState('')

    const [isValidEthAddress, setIsValidEthAddress] = useState(false)
    const [isValidEnsName, setIsValidEnsName] = useState(false)

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

    useEffect(() => {
      const getAddressType = async () => {
        if (address && address.length) {
          if (isValidAddress(address)) {
            setLoading(true)
            setIsValidEthAddress(true)
            const addressType = await web3Service.getEthAddressType(address)
            setAddressType(addressType)
          } else if (isValidEns(address)) {
            setLoading(true)
            setIsValidEnsName(true)
            const addressType = await web3Service.getEthAddressType(address)
            setAddressType(addressType)
          }
        } else {
          setLoading(false)
          setIsValidEnsName(false)
          setIsValidEthAddress(false)
          setError('')
        }
      }
      getAddressType()
    }, [address, address?.length])
  
    useEffect(() => {
      const handleResolver = async () => {
        if (isValidEnsName && addressType === 'name') {
          try {
            const result = await web3Service.resolveName(address)
            if (result) {
              setLoading(false)
              setError('')
              setSuccess(`It's a valid ens name`)
              setResolvedAddress(result.address)
            } 
          } catch (error) {
            setLoading(false)
            setError('Ens name is not configured')
            setAddressType('error')
          }
        } else if (isValidEthAddress && addressType === 'address') {
          try {
            const result = await web3Service.resolveName(address)
            if (result) {
              setLoading(false)
              setError('')
              setSuccess(`It's a valid eth address`)
              setResolvedName(result.name)
            }
          } catch (error) {
            setLoading(false)
            setError('Invalid eth address')
            setAddressType('error')
          }
        }
      }
      handleResolver()
    }, [isValidEnsName, isValidEthAddress, error, addressType])

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
                  <Icon size={size} icon={CustomizedIcon} />
                </span>
              )}
              <input
                {...inputProps}
                id={label}
                value={value}
                className={inputClass}
              />
            </div>
          </div>
        </FieldLayout>
        <div>
          {loadingResolvedAddress && addressType === 'name' ? (
            <span className='text-gray-600'>
              Loading resolved address...
            </span>
          ) : !loadingResolvedAddress && resolvedAddress !== '' && addressType === 'name' && isValidEnsName  ? (
            <span className='text-gray-600'>
              {resolvedAddress}
            </span>
          ) : !loadingResolvedAddress && addressType === 'name' && isValidEnsName && resolvedAddress !== '' && isTruncated ? (
            <span className='text-gray-600'>
             {minifyAddress(resolvedAddress)}
            </span>
          ) : loadingResolvedAddress && addressType === 'address'? (
            <span className='text-gray-600'>
              Loading resolved ens...
            </span> 
            ) : !loadingResolvedAddress && addressType === 'address' && isValidEthAddress && resolvedName !== '' ? (
            <span className='text-gray-600'>
              {resolvedName}
            </span>
          ) : addressType === 'error' && error !== '' && (
            <span className='text-rose-700'>Please enter a valid ens or address</span>
          )}
        </div>
      </>
    )
  }
)

AddressInput.displayName = 'AddressInput'