import type {
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
} from 'sequelize'
import { Model } from 'sequelize'
import { sequelize, LocksmithDataTypes } from './index'

export class UserTokenMetadata extends Model<
  InferAttributes<UserTokenMetadata>,
  InferCreationAttributes<UserTokenMetadata>
> {
  declare id: CreationOptional<number>
  declare tokenAddress: string
  declare userAddress: string
  declare data: any
  declare chain: number
  declare updatedBy: null | string
  declare createdAt: CreationOptional<Date>
  declare updatedAt: CreationOptional<Date>
}

UserTokenMetadata.init(
  {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: LocksmithDataTypes.INTEGER,
    },
    tokenAddress: {
      allowNull: false,
      type: LocksmithDataTypes.STRING,
    },
    userAddress: {
      allowNull: false,
      type: LocksmithDataTypes.STRING,
    },
    data: {
      allowNull: false,
      type: LocksmithDataTypes.JSONB,
    },
    chain: {
      allowNull: false,
      type: LocksmithDataTypes.NETWORK_ID,
    },
    createdAt: {
      allowNull: false,
      type: LocksmithDataTypes.DATE,
    },
    updatedAt: {
      allowNull: false,
      type: LocksmithDataTypes.DATE,
    },
    updatedBy: {
      allowNull: true,
      type: LocksmithDataTypes.STRING,
    },
  },
  {
    sequelize,
  }
)
