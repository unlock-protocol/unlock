import type { InferAttributes, InferCreationAttributes } from 'sequelize'
import { Model, DataTypes, CreationOptional } from 'sequelize'
import { sequelize } from './sequelize'
import { PaywallConfigType } from '@unlock-protocol/core'

export class CheckoutConfig extends Model<
  InferAttributes<CheckoutConfig>,
  InferCreationAttributes<CheckoutConfig>
> {
  declare id: string
  declare config: PaywallConfigType
  declare createdBy: string
  declare createdAt?: CreationOptional<Date>
  declare updatedAt?: CreationOptional<Date>
}

CheckoutConfig.init(
  {
    id: {
      allowNull: false,
      type: DataTypes.STRING,
      primaryKey: true,
    },
    config: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: {},
    },
    createdBy: {
      type: DataTypes.STRING,
      allowNull: false,
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
    modelName: 'CheckoutConfigs',
    sequelize,
  }
)
