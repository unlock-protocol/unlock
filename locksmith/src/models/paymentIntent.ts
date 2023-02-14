import type {
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
} from 'sequelize'
import { Model, DataTypes } from 'sequelize'
import { sequelize } from './sequelize'

export class PaymentIntent extends Model<
  InferAttributes<PaymentIntent>,
  InferCreationAttributes<PaymentIntent>
> {
  declare id: CreationOptional<number>
  declare lockAddress: string
  declare chain: number
  declare userAddress: string
  declare stripeCustomerId: string // Overall customer id
  declare recipients?: string[]
  declare intentId: string
  declare connectedStripeId: string // Account connected to the lock
  declare connectedCustomerId: string // connected account specific customer id
  declare createdAt: CreationOptional<Date>
  declare updatedAt: CreationOptional<Date>
}

PaymentIntent.init(
  {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER,
    },
    lockAddress: {
      type: DataTypes.STRING,
    },
    chain: {
      type: DataTypes.INTEGER,
    },
    userAddress: {
      type: DataTypes.STRING,
    },
    intentId: {
      type: DataTypes.STRING,
    },
    stripeCustomerId: {
      type: DataTypes.STRING,
    },
    connectedStripeId: {
      type: DataTypes.STRING,
    },
    connectedCustomerId: {
      type: DataTypes.STRING,
    },
    recipients: {
      type: DataTypes.JSONB,
      allowNull: true,
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
    modelName: 'PaymentIntent',
    sequelize,
  }
)
