import { Button, Modal } from '@unlock-protocol/ui'
import { Checkout } from '~/components/interface/checkout/main'
import { useMemo, useState } from 'react'
import { useRouter } from 'next/router'

export const EmbeddedCheckout = ({ checkoutConfig, refresh }: any) => {
  const [isCheckoutOpen, setCheckoutOpen] = useState(false)
  const { query } = useRouter()
  const paywallConfig = useMemo(() => {
    if (query.referrer) {
      return {
        ...checkoutConfig.config,
        referrer: query.referrer,
      }
    }
    return checkoutConfig.config
  }, [checkoutConfig, query])

  return (
    <>
      <Modal isOpen={isCheckoutOpen} setIsOpen={setCheckoutOpen} empty={true}>
        <Checkout
          paywallConfig={paywallConfig}
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
