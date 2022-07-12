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

function getVerificatioConfigFromURL(text?: string) {
  try {
    if (!text) {
      return
    }
    const url = new URL(text)
    const data = url.searchParams.get('data')
    const sig = url.searchParams.get('sig')
    const config = getMembershipVerificationConfig({
      data,
      sig,
    })
    return config
  } catch (error) {
    console.error(error)
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

  const membershipVerificationConfig = getVerificatioConfigFromURL(result)
  return (
    <>
      {!membershipVerificationConfig ? (
        <div className="grid justify-center">
          <div className="text-center p-6">
            <h3 className="font-bold text-lg">
              Scan the QR code to check in Ticket
            </h3>
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
                    <VerificationStatus config={membershipVerificationConfig} />
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
