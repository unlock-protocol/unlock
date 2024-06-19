import Stripe from 'stripe'

import config from '../config/config'

const stripe = new Stripe(config.stripeSecret!, {
  apiVersion: '2024-04-10',
})

export default stripe
