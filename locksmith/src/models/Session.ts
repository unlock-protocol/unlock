import type {
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
} from 'sequelize'
import { Model } from 'sequelize'
import { sequelize, LocksmithDataTypes } from './sequelize'

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
      type: LocksmithDataTypes.TEXT,
    },
    nonce: {
      allowNull: false,
      type: LocksmithDataTypes.TEXT,
    },
    walletAddress: {
      allowNull: false,
      type: LocksmithDataTypes.TEXT,
    },
    expireAt: {
      allowNull: false,
      type: LocksmithDataTypes.DATE,
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
    tableName: 'Sessions',
  }
)
