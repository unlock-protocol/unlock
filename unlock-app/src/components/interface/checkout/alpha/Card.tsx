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
    <div className="border rounded-xl border-zinc-300">
      <div className="px-6 pt-6">
        <p className="font-medium inline-flex items-center gap-2">
          <CreditCardIcon size={18} /> XXXX-XXXX-XXXX-{last4}
        </p>
        <p> {name}</p>
        <p>{country}</p>
        <time>
          {String(exp_month)?.padStart(2, '0')}/{exp_year}
        </time>
      </div>
      <div className="flex items-center p-2 justify-end">
        <Button onClick={onChange} size="small">
          Change
        </Button>
      </div>
    </div>
  )
}

export function CardPlaceholder() {
  return (
    <div className="border rounded-xl p-6 not-sr-only flex flex-col gap-2">
      <div className="w-full bg-gray-100 p-2 rounded-lg animate-pulse"></div>
      <div className="w-54 bg-gray-100 p-2 rounded-lg animate-pulse"></div>
      <div className="w-16 bg-gray-100 p-2 rounded-lg animate-pulse"></div>
      <div className="w-16 bg-gray-100 p-2 rounded-lg animate-pulse"></div>
    </div>
  )
}
