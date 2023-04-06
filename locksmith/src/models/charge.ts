import type { InferAttributes, InferCreationAttributes } from 'sequelize'
import { Model, CreationOptional } from 'sequelize'
import { sequelize, LocksmithDataTypes } from './sequelize'

export class Charge extends Model<
  InferAttributes<Charge>,
  InferCreationAttributes<Charge>
> {
  declare id: CreationOptional<number>
  declare lock: string
  declare chain: number
  declare userAddress: string
  declare recipients?: string[]
  declare stripeCharge: string
  declare stripeCustomerId?: string
  declare connectedCustomer?: string
  declare totalPriceInCents: number
  declare unlockServiceFee: number | null
  declare transactionHash?: string
  declare recurring?: number
  declare createdAt: CreationOptional<Date>
  declare updatedAt: CreationOptional<Date>
}

Charge.init(
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
    userAddress: {
      type: LocksmithDataTypes.STRING,
    },
    stripeCharge: {
      type: LocksmithDataTypes.STRING,
    },
    stripeCustomerId: {
      type: LocksmithDataTypes.STRING,
    },
    connectedCustomer: {
      type: LocksmithDataTypes.STRING,
    },
    totalPriceInCents: {
      type: LocksmithDataTypes.INTEGER,
    },
    unlockServiceFee: {
      type: LocksmithDataTypes.INTEGER,
    },
    chain: {
      type: LocksmithDataTypes.NETWORK_ID,
    },
    transactionHash: {
      type: LocksmithDataTypes.STRING,
    },
    recurring: {
      type: LocksmithDataTypes.INTEGER,
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
    tableName: 'Charges',
  }
)
