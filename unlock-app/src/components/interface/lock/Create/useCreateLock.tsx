import { useForm } from 'react-hook-form'

export interface LockFormProps {
  name: string
  price?: number
  duration?: number
  quantity?: number
  network: number
  unlimitedDuration: boolean
  unlimitedQuantity: boolean
}

export const useCreateLock = (network: number) => {
  const form = useForm<LockFormProps>({
    mode: 'onChange',
    defaultValues: {
      name: '',
      network,
      quantity: undefined,
      duration: undefined,
      price: undefined,
      unlimitedDuration: true,
      unlimitedQuantity: true,
    },
  })

  return {
    form,
    values: form.getValues(),
  }
}
