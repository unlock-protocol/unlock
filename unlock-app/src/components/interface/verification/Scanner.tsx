import { Fragment, useState } from 'react'
import { useQrReader, OnResultFunction } from 'react-qr-reader'
import { Transition, Dialog } from '@headlessui/react'
import { getMembershipVerificationConfig } from '~/utils/verification'
import VerificationStatus from '../VerificationStatus'

interface QRCodeScannerProps {
  onResult: OnResultFunction
}

export function QrCodeScanner({ onResult }: QRCodeScannerProps) {
  useQrReader({
    constraints: {
      aspectRatio: 1,
      facingMode: 'environment',
    },
    videoId: 'scanner',
    onResult,
    scanDelay: 250,
  })
  return <video className="rounded-xl" muted id="scanner" />
}

function getVerificationConfig(text?: string) {
  try {
    if (text) {
      const url = new URL(text)
      const data = url.searchParams.get('data')
      const sig = url.searchParams.get('sig')
      if (data && sig) {
        const item = {
          data,
          sig,
        }
        const config = getMembershipVerificationConfig(item)
        if (config) {
          return {
            ...config,
            rawData: data,
          }
        }
      }
    }
  } catch {
    return
  }
}

export function Scanner() {
  const [{ result }, setResult] = useState<
    Partial<Record<'result' | 'error', string>>
  >({
    result: undefined,
    error: undefined,
  })

  const membershipVerificationConfig = getVerificationConfig(result)
  return (
    <>
      {!membershipVerificationConfig ? (
        <div className="grid justify-center">
          <div className="text-center p-6">
            <h3 className="font-bold text-lg">
              Scan the QR code to check in Ticket
            </h3>
            <button
              onClick={() => {
                setResult({
                  result:
                    'https://staging-app.unlock-protocol.com/verification?data=%257B%2522network%2522%253A4%252C%2522account%2522%253A%25220xd02a0D6dE5A0b56Cc15E0F5E6681a6331f9c7821%2522%252C%2522lockAddress%2522%253A%25220xff6e45fde991cf534d0253e241743cf4238b21d9%2522%252C%2522timestamp%2522%253A1657382710731%252C%2522tokenId%2522%253A%252246%2522%257D&sig=0xeaff850b53bb69e651f80e71500a80124c9072a438c9ac3a8f9b74bce4102b23590976c5b1210a361b1a4386793e1b97da4899360d2b78af1bf8116280b0446f1b',
                })
              }}
            >
              {' '}
              test{' '}
            </button>
          </div>
          <QrCodeScanner
            onResult={(result, error) => {
              setResult({
                result: result?.toString(),
                error: error?.message,
              })
            }}
          />
        </div>
      ) : (
        <Transition show appear as={Fragment}>
          <Dialog
            as="div"
            className="relative z-50"
            onClose={() => {
              setResult({})
            }}
            open
          >
            <div className="fixed inset-0 backdrop-filter backdrop-blur-sm bg-zinc-500 bg-opacity-25" />
            <Transition.Child
              as={Fragment}
              enter="transition ease-out duration-300"
              enterFrom="opacity-0 translate-y-1"
              enterTo="opacity-100"
              leave="transition ease-in duration-150"
              leaveFrom="opacity-100"
              leaveTo="opacity-0 translate-y-1"
            >
              <div className="fixed p-6 inset-0 overflow-y-auto">
                <div className="flex min-h-full items-center justify-center text-center">
                  <Dialog.Panel className="max-w-sm w-full">
                    <VerificationStatus
                      data={membershipVerificationConfig.data}
                      rawData={membershipVerificationConfig.rawData}
                      sig={membershipVerificationConfig.sig}
                    />
                  </Dialog.Panel>
                </div>
              </div>
            </Transition.Child>
          </Dialog>
        </Transition>
      )}
    </>
  )
}
