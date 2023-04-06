import type { InferAttributes, InferCreationAttributes } from 'sequelize'
import { Model, CreationOptional } from 'sequelize'
import { sequelize, LocksmithDataTypes } from './sequelize'

export class KeySubscription extends Model<
  InferAttributes<KeySubscription>,
  InferCreationAttributes<KeySubscription>
> {
  declare id: CreationOptional<number>
  declare keyId: number
  declare lockAddress: string
  declare network: number
  declare userAddress: string
  declare amount: number
  declare unlockServiceFee: number
  declare stripeCustomerId: string
  declare connectedCustomer: string
  declare recurring: number
  declare createdAt: CreationOptional<Date>
  declare updatedAt: CreationOptional<Date>
}

KeySubscription.init(
  {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: LocksmithDataTypes.INTEGER,
    },
    keyId: {
      type: LocksmithDataTypes.INTEGER,
      allowNull: false,
    },
    lockAddress: {
      type: LocksmithDataTypes.STRING,
      allowNull: false,
    },
    userAddress: {
      type: LocksmithDataTypes.STRING,
      allowNull: false,
    },
    network: {
      type: LocksmithDataTypes.NETWORK_ID,
      allowNull: false,
    },
    stripeCustomerId: {
      type: LocksmithDataTypes.STRING,
      allowNull: false,
    },
    connectedCustomer: {
      type: LocksmithDataTypes.STRING,
      allowNull: false,
    },
    amount: {
      type: LocksmithDataTypes.INTEGER,
      allowNull: false,
    },
    unlockServiceFee: {
      type: LocksmithDataTypes.INTEGER,
      allowNull: false,
    },
    recurring: {
      type: LocksmithDataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
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
    modelName: 'KeySubscriptions',
  }
)
