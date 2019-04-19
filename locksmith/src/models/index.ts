import { Sequelize } from 'sequelize-typescript'
import { User } from './user'
import { UserReference } from './userReference'
import { Block } from './block'
import { Event } from './event'
import { Lock } from './lock'
import { Transaction } from './transaction'
import { AuthorizedLock } from './authorizedLock'

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
])

User.removeAttribute('id')
Lock.removeAttribute('id')
Block.removeAttribute('id')
Transaction.removeAttribute('id')

export * from './user'
export * from './userReference'
export * from './block'
export * from './event'
export * from './lock'
export * from './transaction'
export * from './authorizedLock'
