import { Sequelize } from 'sequelize-typescript'
import { Verifier } from './verifier'
import { User } from './user'
import { UserReference } from './userReference'
import { LockMetadata } from './lockMetadata'
import { KeyMetadata } from './keyMetadata'
import { KeyRenewal } from './keyRenewal'
import { UserTokenMetadata } from './usertokenmetadata'
import { StripeCustomer } from './stripeCustomer'
import { PaymentIntent } from './paymentIntent'
import { StripeConnectLock } from './stripeConnectLock'
import { LockIcons } from './lockIcons'
import { Charge } from './charge'
import logger from '../logger'
import { Hook } from './hook'
import { HookEvent } from './hookEvent'
import { ProcessedHookItem } from './processedHookItem'
import { RefreshToken } from './refreshToken'
import { Application } from './application'
import { KeySubscription } from './keySubscriptions'

const config = require('../../config/sequelize.config')

logger.info(`Connecting to database, ${JSON.stringify(config)}`)

// We assume config from an object of {username, password, database, host, dialect}
export const sequelize = new Sequelize(config)

sequelize.addModels([
  Charge,
  Hook,
  HookEvent,
  KeyMetadata,
  KeyRenewal,
  LockIcons,
  LockMetadata,
  PaymentIntent,
  ProcessedHookItem,
  RefreshToken,
  StripeConnectLock,
  StripeCustomer,
  User,
  UserReference,
  UserTokenMetadata,
  Application,
  Verifier,
  KeySubscription,
])

User.removeAttribute('id')
LockMetadata.removeAttribute('id')
StripeCustomer.removeAttribute('id')

export * from './user'
export * from './userReference'
export * from './usertokenmetadata'
export * from './stripeCustomer'
export * from './stripeConnectLock'
export * from './charge'
export * from './lockIcons'
export * from './hook'
export * from './hookEvent'
export * from './processedHookItem'
export * from './keyRenewal'
export * from './paymentIntent'
export * from './keySubscriptions'
