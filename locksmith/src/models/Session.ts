import type {
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
} from 'sequelize'
import { Model, DataTypes } from 'sequelize'
import { sequelize } from './sequelize'

export class Session extends Model<
  InferAttributes<Session>,
  InferCreationAttributes<Session>
> {
  declare id: string
  declare nonce: string
  declare walletAddress: string
  declare expireAt: CreationOptional<Date>
  declare createdAt?: CreationOptional<Date>
  declare updatedAt?: CreationOptional<Date>
}

Session.init(
  {
    id: {
      allowNull: false,
      primaryKey: true,
      type: DataTypes.TEXT,
    },
    nonce: {
      allowNull: false,
      type: DataTypes.TEXT,
    },
    walletAddress: {
      allowNull: false,
      type: DataTypes.TEXT,
    },
    expireAt: {
      allowNull: false,
      type: DataTypes.DATE,
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
    tableName: 'Sessions',
  }
)
