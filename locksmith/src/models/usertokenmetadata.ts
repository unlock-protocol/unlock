import type {
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
} from 'sequelize'
import { Model, DataTypes } from 'sequelize'
import { LocksmithDataTypes, sequelize } from './index'

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
      type: DataTypes.INTEGER,
    },
    tokenAddress: {
      allowNull: false,
      type: DataTypes.STRING,
    },
    userAddress: {
      allowNull: false,
      type: DataTypes.STRING,
    },
    data: {
      allowNull: false,
      type: DataTypes.JSONB,
    },
    chain: {
      allowNull: false,
      type: LocksmithDataTypes.NETWORK_ID,
    },
    createdAt: {
      allowNull: false,
      type: DataTypes.DATE,
    },
    updatedAt: {
      allowNull: false,
      type: DataTypes.DATE,
    },
    updatedBy: {
      allowNull: true,
      type: DataTypes.STRING,
    },
  },
  {
    sequelize,
  }
)
