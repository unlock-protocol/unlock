/* eslint-disable jsx-a11y/media-has-caption */
import React from 'react'
import Scanner from 'qr-scanner'

Scanner.WORKER_PATH = 'static/qr-scanner-worker.min.js'

export interface Props {
  onDecode: (result: string) => void
}

export class QRScanner extends React.Component<Props> {
  private videoRef = React.createRef<HTMLVideoElement>()
  private scanner: Scanner | null = null

  constructor(props: Props) {
    super(props)
  }

  componentDidMount = () => {
    this.setupScanner()
  }

  componentWillUnmount = () => {
    this.tearDownScanner()
  }

  setupScanner = () => {
    const { onDecode } = this.props
    const videoElement = this.videoRef.current!
    this.scanner = new Scanner(videoElement, onDecode)
    this.scanner.start()
  }

  // See: https://github.com/nimiq/qr-scanner#clean-up
  // "This will stop the camera stream and web worker and cleans up
  // event listeners."
  tearDownScanner = () => {
    if (this.scanner) {
      this.scanner.destroy()
      this.scanner = null
    }
  }

  render = () => {
    return <video ref={this.videoRef} />
  }
}

export default QRScanner
