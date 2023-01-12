import type {
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from 'sequelize'
import { Model, DataTypes } from 'sequelize'
import { sequelize } from './sequelize'

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
      type: DataTypes.INTEGER,
    },
    lock: {
      type: DataTypes.STRING,
    },
    manager: {
      type: DataTypes.STRING,
    },
    chain: {
      type: DataTypes.INTEGER,
    },
    stripeAccount: {
      type: DataTypes.STRING,
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
    modelName: 'StripeConnectLocks',
  }
)
