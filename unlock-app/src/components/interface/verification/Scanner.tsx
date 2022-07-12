import { Fragment, useState, useEffect } from 'react'
import { Transition, Dialog } from '@headlessui/react'
import {
  getMembershipVerificationConfig,
  MembershipVerificationConfig,
} from '~/utils/verification'
import VerificationStatus from '../VerificationStatus'
import QrScanner from 'qr-scanner'

interface QRCodeScannerProps {
  onResult: (content: string) => void | Promise<void>
}

export function QrCodeScanner({ onResult }: QRCodeScannerProps) {
  useEffect(() => {
    const videoElement = document.querySelector<HTMLVideoElement>('#scanner')
    if (!videoElement) {
      return
    }
    const qrScanner = new QrScanner(
      videoElement,
      (result) => {
        onResult(result.data)
      },
      {
        preferredCamera: 'environment',
        highlightScanRegion: true,
      }
    )
    qrScanner.start()
    return () => qrScanner.stop()
  }, [onResult])
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
    return
  }
}

export function Scanner() {
  const [membershipVerificationConfig, setMembershipVerificationConfig] =
    useState<MembershipVerificationConfig | null>(null)

  useEffect(() => {
    const videoElement = document.querySelector<HTMLVideoElement>('#scanner')
    if (!videoElement) {
      return
    }
    const qrScanner = new QrScanner(
      videoElement,
      (result) => {
        const config = getVerificatioConfigFromURL(result.data)
        if (!config) {
          return
        }
        setMembershipVerificationConfig(config)
        qrScanner.stop()
      },
      {
        preferredCamera: 'environment',
        highlightScanRegion: true,
      }
    )
    if (!membershipVerificationConfig) {
      qrScanner.start()
    }
    return () => qrScanner.stop()
  }, [membershipVerificationConfig])

  return (
    <>
      <div className="grid justify-center">
        <div className="text-center p-6">
          <h3 className="font-bold text-lg">
            Scan the QR code to check in Ticket
          </h3>
        </div>
        <video className="rounded-xl" muted id="scanner" />
      </div>
      <Transition show={!!membershipVerificationConfig} appear as={Fragment}>
        <Dialog
          as="div"
          className="relative z-50"
          onClose={() => {
            setMembershipVerificationConfig(null)
          }}
          open={!!membershipVerificationConfig}
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
                  <VerificationStatus config={membershipVerificationConfig!} />
                </Dialog.Panel>
              </div>
            </div>
          </Transition.Child>
        </Dialog>
      </Transition>
    </>
  )
}
