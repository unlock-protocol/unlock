import type { InferAttributes, InferCreationAttributes } from 'sequelize'
import { Model, DataTypes, CreationOptional } from 'sequelize'
import { sequelize } from './sequelize'

export class AuthorizedLock extends Model<
  InferAttributes<AuthorizedLock>,
  InferCreationAttributes<AuthorizedLock>
> {
  declare id: CreationOptional<number>
  declare address: string
  declare authorizedAt: Date
  declare stripe_account_id: string
  declare chain: number
  declare createdAt: CreationOptional<Date>
  declare updatedAt: CreationOptional<Date>
}

AuthorizedLock.init(
  {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER,
    },
    address: {
      type: DataTypes.STRING,
    },
    authorizedAt: {
      type: DataTypes.DATE,
    },
    stripe_account_id: {
      type: DataTypes.STRING,
    },
    chain: {
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
    modelName: 'AuthorizedLock',
  }
)
