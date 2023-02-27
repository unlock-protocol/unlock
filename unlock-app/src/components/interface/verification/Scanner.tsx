import { Fragment, useState, useEffect, useRef } from 'react'
import { Transition, Dialog } from '@headlessui/react'
import {
  getMembershipVerificationConfig,
  MembershipVerificationConfig,
} from '~/utils/verification'
import VerificationStatus from '../VerificationStatus'
import QrScanner from 'qr-scanner'
import { useDropzone } from 'react-dropzone'
import { getURL } from '~/utils/url'
import { ToastHelper } from '~/components/helpers/toast.helper'
import { config as AppConfig } from '~/config/app'
import { parseDomain } from 'parse-domain'
import { Button } from '@unlock-protocol/ui'

const getVerificationConfigFromURL = async (content?: string) => {
  try {
    if (!content) {
      return
    }
    let endpoint = new URL(content)
    const domain = parseDomain(endpoint.hostname).hostname
    // If the domain is not the same as the unlock static url, we need to resolve the redirect.
    if (domain !== new URL(AppConfig.unlockStaticUrl).hostname) {
      const redirectResolveEndpoint = new URL(
        '/resolve-redirect',
        AppConfig.rpcURL
      )
      redirectResolveEndpoint.searchParams.append('url', endpoint!.toString())
      const response = await fetch(redirectResolveEndpoint.toString(), {
        method: 'GET',
      })
      const json = await response.json()
      endpoint = new URL(json.url)
    }
    const data = endpoint.searchParams.get('data')
    const sig = endpoint.searchParams.get('sig')
    const ticketConfig = getMembershipVerificationConfig({
      data,
      sig,
    })
    return ticketConfig
  } catch (error) {
    return
  }
}

export function Scanner() {
  const [membershipVerificationConfig, setMembershipVerificationConfig] =
    useState<MembershipVerificationConfig | null>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const { getInputProps, getRootProps } = useDropzone({
    accept: {
      'image/png': ['.png'],
      'image/jpeg': ['.jpeg', '.jpg'],
      'image/svg': ['.svg'],
    },
    async onDropAccepted(files) {
      setIsProcessing(true)
      try {
        const file = files[0]
        const scanned = await QrScanner.scanImage(file, {
          scanRegion: {},
        })
        const endpoint = getURL(scanned.data)
        if (!endpoint) {
          throw new Error('Invalid URL in QR code')
        }
        const membershipConfig = await getVerificationConfigFromURL(
          endpoint.toString()
        )
        if (!membershipConfig) {
          throw new Error('Invalid ticket config')
        }
        setMembershipVerificationConfig(membershipConfig)
      } catch (error) {
        console.error(error)
        ToastHelper.error('Invalid Ticket QR code')
      }
      setIsProcessing(false)
    },
  })
  useEffect(() => {
    const videoElement = videoRef.current
    if (!videoElement) {
      return
    }
    const qrScanner = new QrScanner(
      videoElement,
      async (result) => {
        const config = await getVerificationConfigFromURL(result.data)
        if (!config) {
          return
        }
        setMembershipVerificationConfig(config)
        qrScanner.stop()
      },
      {
        preferredCamera: 'environment',
        highlightScanRegion: true,
        calculateScanRegion: (v) => {
          const smallestDimension = Math.min(v.videoWidth, v.videoHeight)
          const scanRegionSize = Math.round((1 / 1.5) * smallestDimension)

          const region: QrScanner.ScanRegion = {
            x: Math.round((v.videoWidth - scanRegionSize) / 2),
            y: Math.round((v.videoHeight - scanRegionSize) / 2),
            width: scanRegionSize,
            height: scanRegionSize,
          }
          return region
        },
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
        <div className="grid gap-6">
          <div className="space-y-2 text-center ">
            <h3 className="font-medium">Scan to check in ticket</h3>
            {!membershipVerificationConfig && (
              <video
                ref={videoRef}
                className="object-cover shadow-lg rounded-xl w-80 h-80"
                muted
                id="scanner"
              />
            )}
          </div>
          <div className="grid">
            <input disabled={isProcessing} {...getInputProps()} />
            <Button
              size="small"
              variant="outlined-primary"
              loading={isProcessing}
              {...getRootProps()}
            >
              <span>Select Ticket QR code image</span>
            </Button>
          </div>
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
