import type {
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from 'sequelize'
import { Model } from 'sequelize'
import { sequelize, LocksmithDataTypes } from './sequelize'

export class StripeConnectLock extends Model<
  InferAttributes<StripeConnectLock>,
  InferCreationAttributes<StripeConnectLock>
> {
  declare id: CreationOptional<number>
  declare lock: string
  declare chain: number
  declare manager: string
  declare stripeAccount: string
  declare createdAt: CreationOptional<Date>
  declare updatedAt: CreationOptional<Date>
}

StripeConnectLock.init(
  {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: LocksmithDataTypes.INTEGER,
    },
    lock: {
      type: LocksmithDataTypes.STRING,
    },
    manager: {
      type: LocksmithDataTypes.STRING,
    },
    chain: {
      type: LocksmithDataTypes.NETWORK_ID,
    },
    stripeAccount: {
      type: LocksmithDataTypes.STRING,
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
    modelName: 'StripeConnectLocks',
  }
)
