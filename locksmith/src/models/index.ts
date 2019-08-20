import { Sequelize } from 'sequelize-typescript'
import { User } from './user'
import { UserReference } from './userReference'
import { Block } from './block'
import { Event } from './event'
import { Lock } from './lock'
import { Transaction } from './transaction'
import { AuthorizedLock } from './authorizedLock'
import { EventLink } from './eventLink'
import { LockMetadata } from './lockmetadata'

const env = process.env.NODE_ENV || 'development'
const config = require('../../config/config')[env]

const sequelize = new Sequelize(config)

sequelize.addModels([
  User,
  UserReference,
  Event,
  Lock,
  Block,
  Transaction,
  AuthorizedLock,
  EventLink,
  LockMetadata,
])

User.removeAttribute('id')
Lock.removeAttribute('id')
Block.removeAttribute('id')
Transaction.removeAttribute('id')
LockMetadata.removeAttribute('id')

export * from './user'
export * from './userReference'
export * from './block'
export * from './event'
export * from './lock'
export * from './transaction'
export * from './authorizedLock'
export * from './eventLink'
