import { Button } from '@unlock-protocol/ui'
import { BsCreditCard as CreditCardIcon } from 'react-icons/bs'

interface Props {
  last4: string
  name: string
  country: string
  exp_month: number
  exp_year: number
  onChange(): void
}

export function Card({
  name,
  onChange,
  last4,
  country,
  exp_month,
  exp_year,
}: Props) {
  return (
    <div className="w-full max-w-screen-sm bg-white border rounded-xl">
      <div className="px-6 pt-6">
        <p className="inline-flex items-center gap-2 font-medium">
          <CreditCardIcon size={18} /> XXXX-XXXX-XXXX-{last4}
        </p>
        <p> {name}</p>
        <p>{country}</p>
        <time>
          {String(exp_month)?.padStart(2, '0')}/{exp_year}
        </time>
      </div>
      <div className="flex items-center justify-end p-2">
        <Button onClick={onChange} size="small">
          Change
        </Button>
      </div>
    </div>
  )
}

export function CardPlaceholder() {
  return (
    <div className="flex flex-col gap-2 p-6 border not-sr-only rounded-xl">
      <div className="w-full p-2 bg-gray-100 rounded-lg animate-pulse"></div>
      <div className="p-2 bg-gray-100 rounded-lg w-54 animate-pulse"></div>
      <div className="w-16 p-2 bg-gray-100 rounded-lg animate-pulse"></div>
      <div className="w-16 p-2 bg-gray-100 rounded-lg animate-pulse"></div>
    </div>
  )
}
