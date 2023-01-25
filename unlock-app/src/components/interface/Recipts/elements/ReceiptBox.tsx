import { Button } from '@unlock-protocol/ui'
import ReactToPrint from 'react-to-print'
import { useRef, useState } from 'react'
import { PoweredByUnlock } from '../../checkout/PoweredByUnlock'
import { addressMinify } from '~/utils/strings'
import { UpdatePurchaserDrawer } from './UpdatePurchaserDrawer'
import { updateReceipt, useGetReceipt } from '~/hooks/receipts'

interface ReceiptBoxProps {
  lockAddress: string
  network: number
  hash: string
}

interface DetailLabelProps {
  label: string
  value: string
  inline?: boolean
}

export const DetailLabel = ({
  label,
  value,
  inline = false,
}: DetailLabelProps) => {
  return (
    <div className={`flex ${inline ? 'gap-2' : 'flex-col'}`}>
      <span className="text-base">{label}</span>
      <div className="flex items-center">
        <span className="block text-base font-bold break-words md:inline-block">
          {value || '-'}
        </span>
      </div>
    </div>
  )
}

const Address = ({
  addressLine1 = '',
  addressLine2 = '',
  city = '',
  zip = '',
  country = '',
  state = '',
}: any) => {
  const addressLine =
    city.length + state.length + zip.length > 0
      ? [city, state, zip].join(', ')
      : ''
  return (
    <div className="flex flex-col gap-1">
      {addressLine1 && <span className="text-base">{addressLine1}</span>}
      {addressLine2 && <span className="text-base">{addressLine2}</span>}
      {addressLine?.length > 0 && (
        <span className="text-base">{addressLine}</span>
      )}
      <span className="text-base">{country}</span>
    </div>
  )
}

const ReceiptBoxPlaceholder = () => {
  return (
    <div className="w-full max-w-lg rounded-xl bg-slate-200 animate-pulse h-[500px]"></div>
  )
}

export const ReceiptBox = ({ lockAddress, hash, network }: ReceiptBoxProps) => {
  const [purchaserDrawer, setPurchaserDrawer] = useState(false)

  const {
    data: receipt,
    isLoading,
    refetch: refetchReceipt,
  } = useGetReceipt({
    lockAddress,
    hash,
    network,
  })

  const { isLoading: isUpdatingReceipt } = updateReceipt({
    lockAddress,
    hash,
    network,
  })

  const { purchaser, supplier } = receipt ?? {}

  const isPurchaser = true

  const disabledInput = isLoading || isUpdatingReceipt

  const PurchaseDetails = () => {
    return (
      <div className="grid gap-2">
        <DetailLabel label="Transaction Date" value="" />
        <DetailLabel label="Transaction Hash" value={addressMinify(hash)} />
      </div>
    )
  }

  const ReceiptDetails = () => {
    return (
      <div className="grid gap-2">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-brand-ui-primary">Receipt:</h2>
        </div>
        <div className="flex flex-col gap-4">
          <div className="grid gap-4 pb-2 border-b border-gray-400 last-of-type:border-none">
            <DetailLabel inline label="Amount payed:" value="" />
            <DetailLabel inline label="Total gas:" value="" />
            <DetailLabel
              label="Service performed:"
              value={supplier?.servicePerformed}
            />
          </div>
        </div>
      </div>
    )
  }

  const Purchaser = () => {
    return (
      <div className="grid gap-2">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-bold text-brand-ui-primary">Bill to:</h2>
          {isPurchaser && (
            <Button
              onClick={() => setPurchaserDrawer(!purchaserDrawer)}
              className="print:hidden"
              size="tiny"
              disabled={disabledInput}
              variant="outlined-primary"
            >
              {purchaser ? 'Edit' : 'Add details'}
            </Button>
          )}
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-lg font-semibold">
            {purchaser?.businessName}
          </span>
          <span className="text-base">{purchaser?.fullname}</span>
          <Address {...purchaser} />
        </div>
      </div>
    )
  }

  const Supplier = () => {
    return (
      <div className="grid gap-2">
        <div className="flex flex-col gap-1">
          <span className="text-lg font-semibold">
            {supplier?.supplierName}
          </span>
          <span className="text-base">{supplier?.vat}</span>
          <Address {...supplier} />
        </div>
      </div>
    )
  }

  const componentRef = useRef<any>()

  if (isLoading) {
    return <ReceiptBoxPlaceholder />
  }

  return (
    <>
      {isPurchaser && (
        <UpdatePurchaserDrawer
          isOpen={purchaserDrawer}
          setIsOpen={setPurchaserDrawer}
          lockAddress={lockAddress}
          network={network}
          hash={hash}
          purchaser={purchaser}
          onSave={() => {
            refetchReceipt()
            setPurchaserDrawer(false)
          }}
        />
      )}
      <div className="grid w-full max-w-lg gap-4">
        <div
          className="relative grid w-full gap-4 px-6 py-10 bg-white border rounded-xl"
          ref={componentRef}
        >
          <div className="absolute ml-auto right-6 top-10">
            <PurchaseDetails />
          </div>
          <Supplier />
          <Purchaser />
          <ReceiptDetails />
          <div className="mt-4">
            <PoweredByUnlock />
          </div>
        </div>
        <ReactToPrint
          trigger={() => (
            <div className="flex justify-end w-full">
              <Button size="small">Print PDF</Button>
            </div>
          )}
          content={() => componentRef.current}
        />
      </div>
    </>
  )
}
