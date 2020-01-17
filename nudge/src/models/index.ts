import { Sequelize } from 'sequelize-typescript'
import { LockMetadata } from './lockMetadata'
import { KeyMetadata } from './keyMetadata'
import { UserTokenMetadata } from './usertokenmetadata'
import { EmailDispatch } from './emailDispatch'

const config = require('../../config/config')

const sequelize = new Sequelize(config)

sequelize.addModels([
  LockMetadata,
  KeyMetadata,
  UserTokenMetadata,
  EmailDispatch,
])
LockMetadata.removeAttribute('id')

export * from './usertokenmetadata'
export * from './emailDispatch'
