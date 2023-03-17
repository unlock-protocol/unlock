import { IFrameEthereumProvider } from '@ledgerhq/iframe-provider'

/**
 * Return true if the current window context appears to be embedded within an iframe element.
 */
export function isEmbeddedInIFrame(): boolean {
  return (
    typeof window !== 'undefined' &&
    window &&
    window.parent &&
    window.self &&
    window.parent !== window.self
  )
}

if (isEmbeddedInIFrame()) {
  console.log('in iframe')
  const target = window as any
  target.ethereum = new IFrameEthereumProvider()
}

if (typeof window !== 'undefined') {
  console.log(window.ethereum)
}
