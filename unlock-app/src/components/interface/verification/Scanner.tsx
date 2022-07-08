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
      facingMode: 'environment',
    },
    videoId: 'scanner',
    onResult,
    scanDelay: 300,
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
      {!membershipVerificationConfig && (
        <div className="grid justify-center">
          <div className="text-center p-6">
            <h2 className="font-bold text-lg">
              Scan the QR code to check in Ticket
            </h2>
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
      )}
      {membershipVerificationConfig && (
        <Transition show={true} appear={true} as={Fragment}>
          <Dialog
            as="div"
            className="relative z-50"
            onClose={() => {
              setResult({})
            }}
            open={!!membershipVerificationConfig}
          >
            <div className="fixed inset-0 bg-zinc-500 backdrop-blur-md bg-opacity-25" />
            <Transition.Child
              as={Fragment}
              enter="transition ease-out duration-300"
              enterFrom="opacity-0 translate-y-1"
              enterTo="opacity-100"
              leave="transition ease-in duration-150"
              leaveFrom="opacity-100"
              leaveTo="opacity-0 translate-y-1"
            >
              <div className="fixed inset-0 overflow-y-auto">
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
