import type {
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
} from 'sequelize'
import { Model, DataTypes } from 'sequelize'
import { sequelize } from './index'

export class UserTokenMetadata extends Model<
  InferAttributes<UserTokenMetadata>,
  InferCreationAttributes<UserTokenMetadata>
> {
  declare id: CreationOptional<number>
  declare tokenAddress: string
  declare userAddress: string
  declare data: any
  declare chain: number
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
  }
)
