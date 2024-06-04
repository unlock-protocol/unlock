import ConnectingWaas from '../interface/connect/ConnectingWaas'
import { AppLayout } from '../interface/layouts/AppLayout'

export const ConnectingContent = () => {
  return (
    <div>
      <AppLayout
        title="Connecting"
        authRequired={false}
        showLinks={false}
        showConnectButton={false}
      >
        <span className="w-full max-w-lg text-base text-gray-700">
          We are connecting to the Unlock Protocol, please be patient and do not
          refresh the page.
        </span>
        <ConnectingWaas />
      </AppLayout>
    </div>
  )
}

export default ConnectingContent
