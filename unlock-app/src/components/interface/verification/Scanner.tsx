/* eslint-disable react/no-unescaped-entities */
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
      <div className="grid justify-center w-full">
        <div>
          <div className="mb-6 text-center">
            <h3 className="font-medium">Scan to check in ticket</h3>
          </div>
          {!membershipVerificationConfig && (
            <video
              ref={videoRef}
              className="object-cover shadow-lg rounded-xl w-80 h-80"
              muted
              id="scanner"
            />
          )}
        </div>
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
            <div className="fixed inset-0 bg-opacity-25 backdrop-filter backdrop-blur-sm bg-zinc-500" />
            <Transition.Child
              as={Fragment}
              enter="transition ease-out duration-300"
              enterFrom="opacity-0 translate-y-1"
              enterTo="opacity-100"
              leave="transition ease-in duration-150"
              leaveFrom="opacity-100"
              leaveTo="opacity-0 translate-y-1"
            >
              <div className="fixed inset-0 p-6 overflow-y-auto">
                <div className="flex items-center justify-center min-h-full">
                  <Dialog.Panel className="w-full max-w-sm">
                    <VerificationStatus
                      onClose={() => setMembershipVerificationConfig(null)}
                      onVerified={() => setMembershipVerificationConfig(null)}
                      config={membershipVerificationConfig}
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
