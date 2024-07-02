import { TfiReload } from 'react-icons/tfi'

import { Button } from '@unlock-protocol/ui'
import Link from 'next/link'
import { RiErrorWarningFill as ErrorIcon } from 'react-icons/ri'

interface TransactionPreparationErrorProps {
  lockAddress: string
  network: number
  refetch: () => void
}

export const TransactionPreparationError = ({
  lockAddress,
  refetch,
}: TransactionPreparationErrorProps) => {
  const isBaseSummit =
    [
      '0xe07e2Ac346078e9a237BF9449C62436419738e8b', // fake contract
      '0x04C44ce4f683726616eAC1601F1Feb5c0584f543',
      '0xA345f09aB214E4Ac42c33C371026ba2335280E45',
      '0xab6842300Dbb21D22e643948f0355acF39B1511c',
      '0xd0193D0595Be3388b7D3784168413Fc534e42fCc',
    ]
      .map((address) => address.toLowerCase())
      .indexOf(lockAddress.toLowerCase()) > -1

  if (isBaseSummit) {
    return (
      <div className="text-sm flex flex-col gap-2">
        <p className="">
          ❌ Your wallet is not yet approved to purchase a ticket.
        </p>
        <p className="">
          At this point, sales are restricted to{' '}
          <Link
            className="underline text-brand-ui-primary"
            target="_blank"
            href="https://www.coinbase.com/wallet"
          >
            Coinbase Wallet
          </Link>{' '}
          users. <strong>General Public ticket sales begin 7/12.</strong>
        </p>
        <Button
          onClick={() => {
            refetch()
          }}
          iconLeft={<TfiReload />}
          size="tiny"
        >
          Check again
        </Button>
      </div>
    )
  }

  return (
    <div>
      <p className="text-sm font-bold">
        <ErrorIcon className="inline" />
        There was an error when preparing the transaction
      </p>
    </div>
  )
}
