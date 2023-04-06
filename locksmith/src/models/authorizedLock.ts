import type { InferAttributes, InferCreationAttributes } from 'sequelize'
import { Model, CreationOptional } from 'sequelize'
import { sequelize, LocksmithDataTypes } from './sequelize'

export class AuthorizedLock extends Model<
  InferAttributes<AuthorizedLock>,
  InferCreationAttributes<AuthorizedLock>
> {
  declare id: CreationOptional<number>
  declare address: string
  declare authorizedAt: Date
  declare stripe_account_id: string
  declare chain: number
  declare createdAt: CreationOptional<Date>
  declare updatedAt: CreationOptional<Date>
}

AuthorizedLock.init(
  {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: LocksmithDataTypes.INTEGER,
    },
    address: {
      type: LocksmithDataTypes.STRING,
    },
    authorizedAt: {
      type: LocksmithDataTypes.DATE,
    },
    stripe_account_id: {
      type: LocksmithDataTypes.STRING,
    },
    chain: {
      type: LocksmithDataTypes.NETWORK_ID,
    },
    createdAt: {
      allowNull: false,
      type: LocksmithDataTypes.DATE,
    },
    updatedAt: {
      allowNull: false,
      type: LocksmithDataTypes.DATE,
    },
  },
  {
    sequelize,
    modelName: 'AuthorizedLock',
  }
)
