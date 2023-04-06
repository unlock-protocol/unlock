import type {
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
} from 'sequelize'
import { Model } from 'sequelize'
import { sequelize, LocksmithDataTypes } from './sequelize'

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
      type: LocksmithDataTypes.INTEGER,
    },
    lockAddress: {
      type: LocksmithDataTypes.STRING,
    },
    chain: {
      type: LocksmithDataTypes.NETWORK_ID,
    },
    userAddress: {
      type: LocksmithDataTypes.STRING,
    },
    intentId: {
      type: LocksmithDataTypes.STRING,
    },
    stripeCustomerId: {
      type: LocksmithDataTypes.STRING,
    },
    connectedStripeId: {
      type: LocksmithDataTypes.STRING,
    },
    connectedCustomerId: {
      type: LocksmithDataTypes.STRING,
    },
    recipients: {
      type: LocksmithDataTypes.JSONB,
      allowNull: true,
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
    modelName: 'PaymentIntent',
    sequelize,
  }
)
