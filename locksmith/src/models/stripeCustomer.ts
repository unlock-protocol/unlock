import type {
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
} from 'sequelize'
import { Model, DataTypes } from 'sequelize'
import { sequelize } from './sequelize'

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
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false,
      unique: 'stripe_customers_pkey',
    },
    StripeCustomerId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    stripeConnectedAccountId: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: 'stripe_customers_pkey',
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
    modelName: 'StripeCustomers',
  }
)
