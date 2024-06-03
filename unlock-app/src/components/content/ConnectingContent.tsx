import ConnectingWaas from '../interface/connect/ConnectingWaas'
import { AppLayout } from '../interface/layouts/AppLayout'

export const ConnectingContent = () => {
  return (
    <div>
      <AppLayout
        authRequired={false}
        showLinks={false}
        showConnectButton={false}
      >
        <ConnectingWaas />
      </AppLayout>
    </div>
  )
}

export default ConnectingContent
