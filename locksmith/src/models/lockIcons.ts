import type {
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
} from 'sequelize'
import { Model, DataTypes } from 'sequelize'
import { sequelize } from './sequelize'

export class LockIcons extends Model<
  InferAttributes<LockIcons>,
  InferCreationAttributes<LockIcons>
> {
  declare id: CreationOptional<number>
  declare lock: string
  declare chain: number
  declare icon: string
  declare createdAt: CreationOptional<Date>
  declare updatedAt: CreationOptional<Date>
}

LockIcons.init(
  {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER,
    },
    lock: {
      type: DataTypes.STRING,
      unique: 'lock_chain_index',
    },
    chain: {
      type: DataTypes.INTEGER,
      unique: 'lock_chain_index',
    },
    icon: {
      type: DataTypes.TEXT,
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
    modelName: 'LockIcons',
  }
)
