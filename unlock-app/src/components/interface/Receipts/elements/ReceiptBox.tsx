import {
  Button,
  Disclosure,
  Placeholder,
  Detail,
  PriceFormatter,
} from '@unlock-protocol/ui'
import ReactToPrint from 'react-to-print'
import { useEffect, useRef, useState } from 'react'
import { PoweredByUnlock } from '../../checkout/PoweredByUnlock'
import { addressMinify } from '~/utils/strings'
import { UpdatePurchaserDrawer } from './UpdatePurchaserDrawer'
import { useUpdateReceipt, useGetReceipt } from '~/hooks/useReceipts'
import dayjs from 'dayjs'
import networks from '@unlock-protocol/networks'
import { useAuth } from '~/contexts/AuthenticationContext'
import { useLockManager } from '~/hooks/useLockManager'
import { useWeb3Service } from '~/utils/withWeb3Service'
import { useQuery } from '@tanstack/react-query'
import { useGetPrice } from '~/hooks/usePrice'
import Link from 'next/link'
import { HiOutlineExternalLink as ExternalLinkIcon } from 'react-icons/hi'
import { locksmith } from '~/config/locksmith'

interface SingleReceiptBoxProps {
  lockAddress: string
  network: number
  hash: string
}

interface MultipleReceiptBoxProps {
  lockAddress: string
  network: number
}

interface ReceiptBoxProps {
  lockAddress: string
  network: number
  hash?: string
}

interface Receipt {
  id: string
  receiptNumber: string
  timestamp: string
  sender: string
  payer: string
  recipient: string
  lockAddress: string
  tokenAddress: string
  gasTotal: string
  amountTransferred: string
  network: number
  supplierAddress: string
}

const Address = ({
  addressLine1 = '',
  addressLine2 = '',
  city = '',
  zip = '',
  country = '',
  state = '',
}: Record<string, string>) => {
  const addressLine =
    city.length + state.length + zip.length > 0
      ? [zip, city, state].filter(Boolean).join(', ')
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

const NotAuthorizedBar = () => {
  const { account } = useAuth()
  return (
    <div className="w-full max-w-lg p-2 mt-5 text-base text-center text-red-700 bg-red-100 border border-red-700 rounded-xl">
      You are connected as {addressMinify(account!)} and this address is not a
      manager or payer for this receipt. If you want to update details, please
      connect as lock manager or payer of the transaction.
    </div>
  )
}

const PurchaseDetails = ({
  receiptNumber,
  transactionDate,
  hash,
}: {
  receiptNumber: string
  transactionDate: string
  hash: string
}) => {
  return (
    <div className="grid gap-2">
      <Detail label="Receipt Number">#{receiptNumber}</Detail>
      <Detail label="Transaction Date">{transactionDate}</Detail>
      <Detail label="Transaction Hash">{addressMinify(hash)}</Detail>
    </div>
  )
}

const ReceiptDetails = ({
  tokenSymbol,
  network,
  amount,
  currencyContractAddress,
  hash,
  isCancelReceipt,
  supplier = null,
}: {
  tokenSymbol: string | null
  network: number
  amount: number
  currencyContractAddress: string
  hash: string
  isCancelReceipt: boolean
  supplier?: any
}) => {
  const symbol = tokenSymbol || networks[network]?.nativeCurrency?.symbol

  const { data: receiptPrice } = useGetPrice({
    network,
    amount,
    currencyContractAddress,
    hash,
  })
  const multiplier = isCancelReceipt ? -1 : 1

  const vatRatePercentage = (supplier?.vatBasisPointsRate ?? 0) / 100
  const subtotal =
    (multiplier * receiptPrice?.total) / (1 + vatRatePercentage / 100)
  const vatTotalInAmount = Number((subtotal * vatRatePercentage) / 100)

  return (
    <div className="grid gap-2 mt-4">
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-3 gap-4 pb-2 border-b border-gray-400 last-of-type:border-none">
          <div className="col-span-full">
            <h2 className="text-lg font-bold text-brand-ui-primary">
              Service performed:
            </h2>
            {isCancelReceipt
              ? 'NFT membership canceled'
              : supplier?.servicePerformed || 'NFT membership'}
          </div>
          <div className="flex flex-col w-full gap-1 mt-5 md:ml-auto md:w-1/2 col-span-full">
            <h2 className="text-lg font-bold md:ml-auto text-brand-ui-primary">
              Amount
            </h2>
            <div className="grid gap-1">
              {vatRatePercentage > 0 && (
                <>
                  <Detail label="Subtotal" inline>
                    {`${subtotal.toFixed(2)} ${symbol}`}
                  </Detail>
                  <Detail label={`VAT (${vatRatePercentage}%)`} inline>
                    {vatTotalInAmount.toFixed(2)} {symbol}
                  </Detail>
                </>
              )}
              <Detail label="TOTAL" labelSize="medium" inline>
                <PriceFormatter
                  price={(
                    multiplier * parseFloat(receiptPrice?.total)
                  ).toString()}
                />{' '}
                {symbol}
              </Detail>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const Purchaser = ({
  isCancelReceipt,
  purchaser,
  purchaserDrawer,
  setPurchaserDrawer,
  isPurchaser,
  disabledInput,
  receiptDetails,
}: {
  isCancelReceipt: boolean
  purchaser: any
  purchaserDrawer: boolean
  setPurchaserDrawer: (purchaserDrawer: boolean) => void
  isPurchaser: boolean
  disabledInput: boolean
  receiptDetails: any
}) => {
  return (
    <div className="grid gap-2">
      <div className="flex items-center gap-2">
        <h2 className="text-lg font-bold text-brand-ui-primary">
          {isCancelReceipt ? 'Refunded to:' : 'Bill to:'}
        </h2>
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
        <span className="text-lg font-semibold">{purchaser?.businessName}</span>
        {purchaser?.email && (
          <span className="text-base">Email: {purchaser?.email}</span>
        )}
        <span className="text-base">
          Wallet:{' '}
          {isCancelReceipt
            ? receiptDetails?.recipient?.length > 0
              ? addressMinify(receiptDetails?.recipient)
              : ''
            : receiptDetails?.payer?.length > 0
              ? addressMinify(receiptDetails?.payer)
              : ''}
        </span>
        <span className="text-base">{purchaser?.fullname}</span>
        <Address {...purchaser} />
      </div>
    </div>
  )
}

const Supplier = ({ supplier }: { supplier: any }) => {
  return (
    <div className="grid gap-2">
      <div className="flex flex-col gap-1">
        <span className="text-lg font-semibold">{supplier?.supplierName}</span>
        <span className="text-base">{supplier?.vat}</span>
        <Address {...supplier} />
      </div>
    </div>
  )
}

const SingleReceiptBox = ({
  lockAddress,
  hash,
  network,
}: SingleReceiptBoxProps) => {
  const { account } = useAuth()

  const [purchaserDrawer, setPurchaserDrawer] = useState(false)
  const web3Service = useWeb3Service()
  const { isManager } = useLockManager({
    lockAddress,
    network,
  })

  const {
    data: receipt,
    isLoading,
    refetch: refetchReceipt,
  } = useGetReceipt({
    lockAddress,
    hash,
    network,
  })

  const { isPending: isUpdatingReceipt } = useUpdateReceipt({
    lockAddress,
    hash,
    network,
  })

  const { purchaser, supplier, receipt: receiptDetails } = receipt ?? {}

  const { data: tokenSymbol } = useQuery({
    queryKey: ['getContractTokenSymbol', lockAddress, network],
    queryFn: async () => {
      return await web3Service.getTokenSymbol(
        receiptDetails?.tokenAddress,
        network
      )
    },
    enabled: receiptDetails?.tokenAddress?.length > 0,
  })

  // enable edit of purchaser only if purchaser match the account
  const isPurchaser =
    receiptDetails?.payer?.toLowerCase() === account?.toLowerCase()

  const isRecipient =
    receiptDetails?.recipient?.toLowerCase() === account?.toLowerCase()

  const isCancelReceipt = receiptDetails?.payer == lockAddress

  const disabledInput = isLoading || isUpdatingReceipt

  const transactionDate =
    receiptDetails && receiptDetails.timestamp
      ? dayjs.unix(receiptDetails.timestamp).format('D MMM YYYY') // example: 20 Jan 1977
      : ''

  const receiptNumber = [
    supplier?.prefix,
    receiptDetails?.receiptNumber || '',
    isCancelReceipt ? 'REFUND' : '',
  ]
    .filter((z: string) => !!z)
    .join('-')

  const componentRef = useRef<any>()

  if (isLoading) {
    return (
      <Placeholder.Root>
        <Placeholder.Image className="h-[100px] md:w-[500px]" />
      </Placeholder.Root>
    )
  }

  if (!isManager && !isPurchaser && !isRecipient) {
    return <NotAuthorizedBar />
  }

  const transactionUrl = hash?.length
    ? networks[network].explorer?.urls.transaction(hash)
    : ''

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
      <div className="grid w-full max-w-lg gap-4 mb-5">
        <div className="grid w-full">
          <Disclosure
            label={`#${receiptNumber}`}
            description={
              transactionUrl?.length && (
                <div
                  onClick={(e: any) => {
                    e?.stopPropagation()
                  }}
                  className="flex"
                >
                  <Link href={transactionUrl}>
                    <div className="flex items-center gap-2">
                      <span>{`Transaction Hash:`} </span>
                      <span className="font-semibold text-brand-ui-primary">
                        {addressMinify(hash)}
                      </span>
                      <ExternalLinkIcon
                        size={20}
                        className="text-brand-ui-primary"
                      />
                    </div>
                  </Link>
                </div>
              )
            }
          >
            <div
              className="relative w-full print:px-6 print:py-10 "
              ref={componentRef}
            >
              <div className="flex flex-col-reverse gap-4 mb-4 md:flex-row md:mb-0 md:justify-between">
                <Supplier supplier={supplier} />
                <PurchaseDetails
                  receiptNumber={receiptNumber}
                  transactionDate={transactionDate}
                  hash={hash}
                />
              </div>
              <Purchaser
                isCancelReceipt={isCancelReceipt}
                purchaser={purchaser}
                disabledInput={disabledInput}
                isPurchaser={isPurchaser}
                purchaserDrawer={purchaserDrawer}
                receiptDetails={receiptDetails}
                setPurchaserDrawer={setPurchaserDrawer}
              />
              <ReceiptDetails
                network={network}
                tokenSymbol={tokenSymbol}
                hash={hash}
                amount={receiptDetails?.amountTransferred || 0}
                currencyContractAddress={receiptDetails?.tokenAddress}
                isCancelReceipt={isCancelReceipt}
              />
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
          </Disclosure>
        </div>
      </div>
    </>
  )
}

const MultipleReceiptBox = ({
  lockAddress,
  network,
}: MultipleReceiptBoxProps) => {
  const [receipts, setReceipts] = useState<Receipt[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [tokenSymbol, setTokenSymbol] = useState<string | null>(null)
  const [isPrintMode, setIsPrintMode] = useState(false)

  const componentRef = useRef<any>()
  const receiptRef = useRef<any>()
  const printButtonRef = useRef<any>()
  const web3Service = useWeb3Service()

  useEffect(() => {
    fetchReceipts()
  }, [])

  useEffect(() => {
    if (receipts.length > 0) {
      getTokenSymbol(receipts[0].tokenAddress)
    }
  }, [receipts])

  function getTransactionUrl(hash: string) {
    return networks[network].explorer?.urls.transaction(hash)
  }

  function getTransactionDate(timestamp: number) {
    return dayjs.unix(timestamp).format('D MMM YYYY')
  }

  function handlePrint() {
    setIsPrintMode(true)
    setTimeout(() => {
      printButtonRef.current?.click()
    }, 0)
  }

  async function getTokenSymbol(tokenAddress: string) {
    const tokenSymbol = await web3Service.getTokenSymbol(tokenAddress, network)
    setTokenSymbol(tokenSymbol)
  }

  async function fetchReceipts() {
    setIsLoading(true)
    try {
      const { data } = await locksmith.getReceipts(network, lockAddress)
      const items: Receipt[] = data.items as Receipt[]
      setReceipts(items)
    } catch (error) {
      console.log(error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <Placeholder.Root>
        <Placeholder.Image className="h-[500px] md:w-[490px]" />
      </Placeholder.Root>
    )
  }

  return (
    <div
      className={`relative rounded-2xl w-full ${isPrintMode ? 'max-w-[490px]' : ''}`}
    >
      <div ref={componentRef} className="flex justify-center">
        <div
          className={`relative w-full max-w-[490px] flex flex-col gap-6 ${isPrintMode ? 'bg-white p-6' : ''}`}
        >
          {receipts.length > 0 &&
            receipts.map((receipt: Receipt, i) =>
              isPrintMode ? (
                <div key={i} className="mb-6 bg-white">
                  <div className="grid w-full max-w-lg gap-4">
                    <div className="grid w-full">
                      <div className="flex flex-col-reverse gap-4 mb-6 md:mb-0 md:flex-row md:justify-start">
                        <Supplier supplier={receipt.supplierAddress} />
                        <PurchaseDetails
                          receiptNumber={receipt.receiptNumber}
                          transactionDate={getTransactionDate(
                            Number(receipt.timestamp)
                          )}
                          hash={receipt.id}
                        />
                      </div>
                      <h2 className="text-lg font-bold text-brand-ui-primary">
                        Bill to:
                      </h2>
                      <p>Wallet: {addressMinify(receipt.recipient)}</p>

                      <ReceiptDetails
                        network={network}
                        tokenSymbol={tokenSymbol}
                        hash={receipt.id}
                        amount={Number(receipt.amountTransferred)}
                        currencyContractAddress={receipt.tokenAddress}
                        isCancelReceipt={receipt.payer == lockAddress}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <Disclosure
                  key={i}
                  label={`#${receipt.receiptNumber}`}
                  description={
                    <div
                      onClick={(e: any) => {
                        e?.stopPropagation()
                      }}
                      className="flex"
                    >
                      <a href={getTransactionUrl(receipt.id)} target="_blank">
                        <div className="flex items-center gap-2">
                          <span>{`Transaction Hash:`} </span>
                          <span className="font-semibold text-brand-ui-primary">
                            {addressMinify(receipt.id)}
                          </span>
                          <ExternalLinkIcon
                            size={20}
                            className="text-brand-ui-primary"
                          />
                        </div>
                      </a>
                    </div>
                  }
                >
                  <div
                    key={i}
                    ref={receiptRef}
                    className="bg-white relative print:p-6"
                  >
                    <div className="grid w-full max-w-lg gap-4">
                      <div className="grid w-full">
                        <div className="flex flex-col-reverse gap-0 pb-6 sm:mb-0 md:flex-row justify-start sm:justify-end print:justify-start">
                          <Supplier supplier={receipt.supplierAddress} />
                          <PurchaseDetails
                            receiptNumber={receipt.receiptNumber}
                            transactionDate={getTransactionDate(
                              Number(receipt.timestamp)
                            )}
                            hash={receipt.id}
                          />
                        </div>
                        <h2 className="text-lg font-bold text-brand-ui-primary">
                          Bill to:
                        </h2>
                        <p>Wallet: {addressMinify(receipt.recipient)}</p>

                        <ReceiptDetails
                          network={network}
                          tokenSymbol={tokenSymbol}
                          hash={receipt.id}
                          amount={Number(receipt.amountTransferred)}
                          currencyContractAddress={receipt.tokenAddress}
                          isCancelReceipt={receipt.payer == lockAddress}
                        />
                      </div>
                    </div>

                    <div className="flex justify-end py-2 print:hidden">
                      <ReactToPrint
                        trigger={() => (
                          <Button className="" size="small">
                            Print PDF
                          </Button>
                        )}
                        content={() => receiptRef.current}
                      />
                    </div>
                  </div>
                </Disclosure>
              )
            )}
          <div className="mt-4 pb-6 hidden print:visible">
            <PoweredByUnlock />
          </div>
          <Button className="print:hidden" size="medium" onClick={handlePrint}>
            Print All
          </Button>
        </div>
      </div>

      <ReactToPrint
        trigger={() => <button className="hidden" ref={printButtonRef} />}
        content={() => componentRef.current}
        onAfterPrint={() => setIsPrintMode(false)}
      />
    </div>
  )
}

export const ReceiptBox = ({ lockAddress, network, hash }: ReceiptBoxProps) => {
  if (hash) {
    return (
      <SingleReceiptBox
        lockAddress={lockAddress}
        network={network}
        hash={hash}
      />
    )
  }
  return <MultipleReceiptBox lockAddress={lockAddress} network={network} />
}
