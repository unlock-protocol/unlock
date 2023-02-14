import type { InferAttributes, InferCreationAttributes } from 'sequelize'
import { Model, DataTypes, CreationOptional } from 'sequelize'
import { sequelize } from './sequelize'

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
      type: DataTypes.INTEGER,
    },
    lock: {
      type: DataTypes.STRING,
    },
    userAddress: {
      type: DataTypes.STRING,
    },
    stripeCharge: {
      type: DataTypes.STRING,
    },
    stripeCustomerId: {
      type: DataTypes.STRING,
    },
    connectedCustomer: {
      type: DataTypes.STRING,
    },
    totalPriceInCents: {
      type: DataTypes.INTEGER,
    },
    unlockServiceFee: {
      type: DataTypes.INTEGER,
    },
    chain: {
      type: DataTypes.INTEGER,
    },
    transactionHash: {
      type: DataTypes.STRING,
    },
    recurring: {
      type: DataTypes.INTEGER,
    },
    createdAt: {
      allowNull: false,
      type: DataTypes.DATE,
    },
    updatedAt: {
      allowNull: false,
      type: DataTypes.DATE,
    },
  },
  {
    sequelize,
    tableName: 'Charges',
  }
)
