import { Button, Modal } from '@unlock-protocol/ui'
import { Checkout } from '~/components/interface/checkout/main'
import { useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'

export const EmbeddedCheckout = ({ checkoutConfig, refresh }: any) => {
  const [isCheckoutOpen, setCheckoutOpen] = useState(false)
  const searchParams = useSearchParams()
  const paywallConfig = useMemo(() => {
    const referrer = searchParams.get('referrer')
    if (referrer) {
      return {
        ...checkoutConfig.config,
        referrer,
      }
    }
    return checkoutConfig.config
  }, [checkoutConfig, searchParams])

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
