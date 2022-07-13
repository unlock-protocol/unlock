import { Fragment, useState, useEffect, useRef } from 'react'
import { Transition, Dialog } from '@headlessui/react'
import {
  getMembershipVerificationConfig,
  MembershipVerificationConfig,
} from '~/utils/verification'
import VerificationStatus from '../VerificationStatus'
import QrScanner from 'qr-scanner'

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
  const videoRef = useRef<HTMLVideoElement | null>(null)

  useEffect(() => {
    const videoElement = videoRef.current
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
      qrScanner.start().catch((error) => console.error(error))
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
        {!membershipVerificationConfig && (
          <video
            ref={videoRef}
            className="rounded-xl object-cover w-full max-w-sm h-96"
            muted
            id="scanner"
          />
        )}
      </div>
      {membershipVerificationConfig && (
        <Transition show appear as={Fragment}>
          <Dialog
            as="div"
            className="relative z-50"
            onClose={() => {
              setMembershipVerificationConfig(null)
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
