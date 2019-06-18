import 'react-stripe-elements'

type PaymentMethodType = 'card' | 'card_present'

// vastly simplified from the real types, but this is all we should need
interface PaymentMethodIncomplete {
  billing_details?: {
    address?: {
      city?: string
      country?: string
      line1?: string
      line2?: string
      postal_code?: string
      state?: string
    }
    name?: string
    email?: string
    phone?: string
  }
}

interface PaymentMethodResponse {
  paymentMethod?: any
  error?: Error
}
interface PaymentMethod extends PaymentMethodIncomplete {
  id: string
  type: PaymentMethodType
}
// TODO: Remove this when
// https://github.com/DefinitelyTyped/DefinitelyTyped/pull/36246 is released
declare module 'react-stripe-elements' {
  // eslint-disable-next-line no-unused-vars
  namespace ReactStripeElements {
    interface StripeProps {
      createPaymentMethod: (
        type: PaymentMethodType,
        data?: PaymentMethodIncomplete
      ) => Promise<PaymentMethodResponse>
    }
  }
}
