import { useQuery } from '@tanstack/react-query'
import { Button } from '@unlock-protocol/ui'
import { storage } from '~/config/storage'
import ReactToPrint from 'react-to-print'
import { useRef } from 'react'
import { PoweredByUnlock } from '../../checkout/PoweredByUnlock'

interface ReceiptBoxProps {
  lockAddress: string
  network: number
  hash: string
}

export const ReceiptBox = ({ lockAddress, hash, network }: ReceiptBoxProps) => {
  const getReceipt = async (): Promise<any> => {
    return await storage.getReceipt(network, lockAddress, hash)
  }

  const { isLoading, data: receipt } = useQuery(
    ['getReceipt', lockAddress, network],
    async () => {
      return getReceipt()
    }
  )

  const { purchaser, supplier } = receipt ?? {}

  const onEditPurchaser = () => {
    // todo
  }

  const isPurchaser = false

  const Details = () => {
    return (
      <div className="grid gap-2">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-brand-ui-primary">Receipt:</h2>
        </div>
        <div className="flex flex-col gap-4">
          <div className="gap-1 pb-2 border-b border-gray-400 last-of-type:border-none">
            <div className="flex items-center gap-2">
              <span className="text-base">Amount payed: </span>
              <div className="flex items-center gap-2">
                <span className="block text-base font-bold break-words md:inline-block">
                  {/* todo */}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-base">Total gas: </span>
              <div className="flex items-center gap-2">
                <span className="block text-base font-bold break-words md:inline-block">
                  {/* todo */}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const Purchaser = () => {
    return (
      <div className="grid gap-2">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-brand-ui-primary">Bill to:</h2>
          <Button
            onClick={onEditPurchaser}
            className="print:hidden"
            size="small"
            disabled={!isPurchaser}
          >
            Edit
          </Button>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-lg font-semibold">
            {purchaser?.businessName}
          </span>
          <span className="text-base">{purchaser?.fullname}</span>
          <span className="text-base">{purchaser?.addressLine1}</span>
          <span className="text-base">{purchaser?.addressLine2}</span>
          <span className="text-base">{purchaser?.city}</span>
          <span className="text-base">{purchaser?.state}</span>
          <span className="text-base">{purchaser?.zip}</span>
          <span className="text-base">{purchaser?.country}</span>
        </div>
      </div>
    )
  }

  const Supplier = () => {
    return (
      <div className="grid gap-2">
        <h2 className="text-lg font-bold text-brand-ui-primary">From:</h2>
        <div className="flex flex-col gap-1">
          <span className="text-lg font-semibold">
            {supplier?.supplierName}
          </span>
          <span className="text-base">{supplier?.vat}</span>
          <span className="text-base">{supplier?.servicePerformed}</span>
          <span className="text-base">{supplier?.addressLine1}</span>
          <span className="text-base">{supplier?.addressLine2}</span>
          <span className="text-base">{supplier?.city}</span>
          <span className="text-base">{supplier?.state}</span>
          <span className="text-base">{supplier?.zip}</span>
          <span className="text-base">{supplier?.Country}</span>
        </div>
      </div>
    )
  }

  const disableInput = isLoading
  const componentRef = useRef<any>()

  return (
    <>
      <div className="grid w-full max-w-lg gap-4">
        <div
          className="grid w-full gap-4 p-4 bg-white border rounded-xl"
          ref={componentRef}
        >
          <Supplier />
          <Purchaser />
          <Details />
          <PoweredByUnlock />
        </div>
        <ReactToPrint
          trigger={() => (
            <div className="flex justify-end w-full">
              <Button size="small" disabled={!disableInput}>
                Print PDF
              </Button>
            </div>
          )}
          content={() => componentRef.current}
        />
      </div>
    </>
  )
}
