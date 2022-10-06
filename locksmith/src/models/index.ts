import { Sequelize } from 'sequelize-typescript'
import { Verifier } from './verifier'
import { User } from './user'
import { UserReference } from './userReference'
import { Lock } from './lock'
import { Transaction } from './transaction'
import { AuthorizedLock } from './authorizedLock'
import { LockMetadata } from './lockMetadata'
import { KeyMetadata } from './keyMetadata'
import { KeyRenewal } from './keyRenewal'
import { ParsedBlockForLockCreation } from './parsedBlockForLockCreation'
import { UserTokenMetadata } from './usertokenmetadata'
import { StripeCustomer } from './stripeCustomer'
import { PaymentIntent } from './paymentIntent'
import { StripeConnectLock } from './stripeConnectLock'
import { LockIcons } from './lockIcons'
import { LockMigrations } from './lockMigrations'
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
  AuthorizedLock,
  Charge,
  Hook,
  HookEvent,
  KeyMetadata,
  KeyRenewal,
  Lock,
  LockIcons,
  LockMetadata,
  LockMigrations,
  ParsedBlockForLockCreation,
  PaymentIntent,
  ProcessedHookItem,
  RefreshToken,
  StripeConnectLock,
  StripeCustomer,
  Transaction,
  User,
  UserReference,
  UserTokenMetadata,
  Application,
  Verifier,
  KeySubscription,
])

User.removeAttribute('id')
Lock.removeAttribute('id')
Transaction.removeAttribute('id')
LockMetadata.removeAttribute('id')
StripeCustomer.removeAttribute('id')

export * from './user'
export * from './userReference'
export * from './lock'
export * from './transaction'
export * from './authorizedLock'
export * from './usertokenmetadata'
export * from './stripeCustomer'
export * from './stripeConnectLock'
export * from './charge'
export * from './lockIcons'
export * from './lockMigrations'
export * from './hook'
export * from './hookEvent'
export * from './processedHookItem'
export * from './keyRenewal'
export * from './paymentIntent'
export * from './keySubscriptions'
