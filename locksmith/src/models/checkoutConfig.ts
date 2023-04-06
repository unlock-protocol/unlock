import type { InferAttributes, InferCreationAttributes } from 'sequelize'
import { Model, CreationOptional } from 'sequelize'
import { sequelize, LocksmithDataTypes } from './sequelize'
import { PaywallConfigType } from '@unlock-protocol/core'

export class CheckoutConfig extends Model<
  InferAttributes<CheckoutConfig>,
  InferCreationAttributes<CheckoutConfig>
> {
  declare id: string
  declare name: string
  declare config: PaywallConfigType
  declare createdBy: string
  declare createdAt: CreationOptional<Date>
  declare updatedAt: CreationOptional<Date>
}

CheckoutConfig.init(
  {
    id: {
      allowNull: false,
      type: LocksmithDataTypes.STRING,
      primaryKey: true,
    },
    name: {
      type: LocksmithDataTypes.STRING,
      allowNull: false,
    },
    config: {
      type: LocksmithDataTypes.JSONB,
      allowNull: false,
      defaultValue: {},
    },
    createdBy: {
      type: LocksmithDataTypes.STRING,
      allowNull: false,
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
    modelName: 'CheckoutConfigs',
    sequelize,
    indexes: [
      {
        fields: ['name', 'createdBy'],
        type: 'UNIQUE',
        name: 'checkout_configs_by_user_and_name',
      },
    ],
  }
)
