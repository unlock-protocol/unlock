import type {
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
} from 'sequelize'
import { Model } from 'sequelize'
import { sequelize, LocksmithDataTypes } from './sequelize'

export class StripeCustomer extends Model<
  InferAttributes<StripeCustomer>,
  InferCreationAttributes<StripeCustomer>
> {
  declare publicKey: string
  declare StripeCustomerId: string
  declare stripeConnectedAccountId?: CreationOptional<string>
  declare createdAt: CreationOptional<Date>
  declare updatedAt: CreationOptional<Date>
}

StripeCustomer.init(
  {
    publicKey: {
      type: LocksmithDataTypes.STRING,
      primaryKey: true,
      allowNull: false,
      unique: 'stripe_customers_pkey',
    },
    StripeCustomerId: {
      type: LocksmithDataTypes.STRING,
      allowNull: false,
    },
    stripeConnectedAccountId: {
      type: LocksmithDataTypes.STRING,
      allowNull: true,
      unique: 'stripe_customers_pkey',
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
    modelName: 'StripeCustomers',
  }
)
