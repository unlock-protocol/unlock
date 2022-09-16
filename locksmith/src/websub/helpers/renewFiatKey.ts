import { getStripeConnectForLock } from '../../operations/stripeOperations'
import Dispatcher from '../../fulfillment/dispatcher'
import { logger } from '../../logger'
import { Charge, KeyRenewal } from '../../models'
import Stripe from 'stripe'
import config from '../../../config/config'
import { Op } from 'sequelize'
import { Web3Service } from '@unlock-protocol/unlock-js'
import networks from '@unlock-protocol/networks'

interface RenewKeyReturned {
  keyId?: number
  lockAddress: string
  network: number
  tx?: string
  error?: string
}

interface Options {
  lockAddress: string
  userAddress: string
  keyId: number
  network: number
}

export async function renewFiatKey({
  lockAddress,
  userAddress,
  keyId,
  network,
}: Options): Promise<RenewKeyReturned> {
  try {
    const renewalInfo = {
      network,
      lockAddress,
    }

    const stripe = new Stripe(config.stripeSecret!, {
      apiVersion: '2020-08-27',
    })

    const stripeAccount = await getStripeConnectForLock(lockAddress, network)

    if (stripeAccount === 0 || stripeAccount === -1) {
      throw new Error('No stripe connect account associated with the lock')
    }

    const charge = await Charge.findOne({
      where: {
        lock: lockAddress,
        chain: network,
        recurring: {
          [Op.gt]: 0,
        },
        recipients: {
          [Op.in]: [userAddress],
        },
      },
    })

    if (!charge) {
      throw new Error('Fiat purchase not found!')
    }

    const customer = await stripe.customers.retrieve(charge.connectedCustomer, {
      stripeAccount,
    })

    if (!customer) {
      throw new Error('Customer does not exist anymore')
    }

    const web3Service = new Web3Service(networks)
    const provider = await web3Service.providerForNetwork(charge.chain)
    const lockContract = await web3Service.getLockContract(
      charge.lock,
      provider
    )
    // Get the transaction reciept from the chain for the original grant keys function
    const receipt = await provider.waitForTransaction(charge.transactionHash)
    const parser = lockContract.interface

    // Parse the logs
    const logs = receipt.logs.map((log) => {
      const item = parser.parseLog(log)
      return item
    })

    // Filter the transfer events to find the token ID and whom they were transfered to.
    const users = logs
      .filter((event) => {
        return event && event.name === 'Transfer'
      })
      .map((item) => {
        return {
          keyId: item.args.tokenId.toNumber(),
          to: item.args.to,
        } as const
      })

    // Find the user from transfer which matches the user address on the expired key
    const user = users.find((item) => item.to === userAddress)

    if (!user) {
      throw new Error('User address does not match the charge')
    }

    const fulfillmentDispatcher = new Dispatcher()

    const tx = await fulfillmentDispatcher.grantKeyExtension(
      charge.lock,
      user.keyId,
      charge.chain
    )

    const paymentMethod = await stripe.paymentMethods.list(
      {
        customer: customer.id,
        type: 'card',
      },
      {
        stripeAccount,
      }
    )

    const paymentMethodId = paymentMethod.data[0].id
    const split = charge.recipients?.length || 1
    const amount = Number(charge.totalPriceInCents / split)
    const applicationFee = Number(charge.unlockServiceFee / split)
    const paymentIntent = await stripe.paymentIntents.create(
      {
        amount: amount,
        currency: 'USD',
        confirm: true,
        application_fee_amount: applicationFee,
        off_session: true,
        customer: customer.id,
        payment_method: paymentMethodId,
      },
      {
        stripeAccount,
      }
    )

    switch (paymentIntent.status) {
      case 'succeeded': {
        // record renewal in db
        const recordedrenewalInfo = {
          ...renewalInfo,
          tx: tx,
        }
        await KeyRenewal.create(recordedrenewalInfo)
        return recordedrenewalInfo
      }

      case 'requires_action': {
        throw new Error('Customer need to go through payment method approval.')
      }

      case 'canceled': {
        throw new Error('Payment was cancelled on the stripe side')
      }

      default:
        throw new Error('Payment did not suceed')
    }
  } catch (error) {
    logger.error(error.message)
    return {
      network,
      keyId,
      lockAddress,
      error: error.message,
    }
  }
}
