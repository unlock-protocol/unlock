import {
  InputHTMLAttributes,
  ForwardedRef,
  ReactNode,
  useState,
  useEffect,
} from 'react'
import type { Size } from '../../types'
import { forwardRef } from 'react'
import { FaWallet, FaSpinner } from 'react-icons/fa'
import { IconBaseProps } from 'react-icons'
import { isAddressOrEns, minifyAddress } from '../../utils'
import { Web3Service } from '@unlock-protocol/unlock-js'
import { useMutation } from '@tanstack/react-query'
import networks from '@unlock-protocol/networks'
import { Input } from './Input'
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
  optional?: boolean
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
 * @returns Input component
 *
 */
export const AddressInput = forwardRef(
  (props: Props, ref: ForwardedRef<HTMLInputElement>) => {
    const {
      size = 'medium',
      value,
      defaultValue,
      className,
      description,
      label,
      withIcon = true,
      isTruncated = false, // address not truncated by default
      onChange,
      ...inputProps
    } = props

    const web3Service = new Web3Service(networks)

    const [error, setError] = useState<any>('')
    const [success, setSuccess] = useState('')
    const [address, setAddress] = useState<string>(value as string)

    const resolveName = async (address: string) => {
      if (address.length === 0) return
      return await web3Service.resolveName(address)
    }

    const onReset = () => {
      setError('')
      setSuccess('')
    }

    const resolveNameMutation = useMutation(resolveName, {
      onMutate: () => {
        onReset() // restore state when typing
      },
    })

    const handleResolver = async (address: string) => {
      try {
        const res: any = await resolveNameMutation.mutateAsync(address)
        if (res) {
          const isError = res?.type === 'error'

          setError(isError ? `It's not a valid ens name or address` : '') // set error when is error

          if (res && (res?.type || '')?.length > 0) {
            if (res.type === 'address') {
              setSuccess(res.name)
            }

            if (res.type === 'name') {
              setSuccess(res.address)
            }
          }
          return res.address
        }
        return ''
      } catch (err) {
        onReset()
        setError(`It's not a valid ens name or address`)
        return ''
      }
    }

    useEffect(() => {
      if (
        (typeof defaultValue === 'string' && defaultValue.length === 0) ||
        (typeof value === 'string' && value === '')
      ) {
        setAddress('')
        onReset()
      }
    }, [defaultValue, value])

    return (
      <>
        <Input
          {...inputProps}
          type="address"
          value={address}
          label={label}
          error={error}
          success={isTruncated ? minifyAddress(success) : success}
          description={description}
          iconClass={resolveNameMutation.isLoading ? 'animate-spin' : ''}
          icon={resolveNameMutation.isLoading ? LoadingIcon : WalletIcon}
          onChange={async (e) => {
            const value: string = e.target.value
            await resolveNameMutation.reset() // reset mutation
            setAddress(value)

            if (isAddressOrEns(value)) {
              try {
                const res = await handleResolver(value)
                if (typeof onChange === 'function' && res) {
                  onChange(res)
                }
              } catch (_err) {}
            } else {
              setError(`It's not a valid ens name or address`)
              if (typeof onChange === 'function') {
                onChange(value as any)
              }
            }
          }}
        />
      </>
    )
  }
)

AddressInput.displayName = 'AddressInput'
