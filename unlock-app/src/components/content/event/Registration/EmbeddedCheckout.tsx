import { Button, Modal } from '@unlock-protocol/ui'
import { Checkout } from '~/components/interface/checkout/main'
import { useState } from 'react'
import { selectProvider } from '~/hooks/useAuthenticate'
import { useConfig } from '~/utils/withConfig'

export const EmbeddedCheckout = ({ checkoutConfig, refresh }: any) => {
  const [isCheckoutOpen, setCheckoutOpen] = useState(false)
  const config = useConfig()
  const injectedProvider = selectProvider(config)

  return (
    <>
      <Modal isOpen={isCheckoutOpen} setIsOpen={setCheckoutOpen} empty={true}>
        <Checkout
          injectedProvider={injectedProvider as any}
          paywallConfig={checkoutConfig.config}
          handleClose={() => {
            refresh()
            setCheckoutOpen(false)
          }}
        />
      </Modal>
      <Button
        variant="primary"
        size="medium"
        onClick={() => {
          setCheckoutOpen(true)
        }}
      >
        Register
      </Button>
    </>
  )
}
