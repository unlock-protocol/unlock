import type { InferAttributes, InferCreationAttributes } from 'sequelize'
import { Model, DataTypes, CreationOptional } from 'sequelize'
import { sequelize } from './sequelize'

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
      type: DataTypes.INTEGER,
    },
    keyId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    lockAddress: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    userAddress: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    network: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    stripeCustomerId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    connectedCustomer: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    amount: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    unlockServiceFee: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    recurring: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
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
    modelName: 'KeySubscriptions',
  }
)
