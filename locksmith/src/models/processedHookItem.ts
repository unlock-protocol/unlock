import type {
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
} from 'sequelize'
import { Model, DataTypes } from 'sequelize'
import { sequelize } from './sequelize'

export class ProcessedHookItem extends Model<
  InferAttributes<ProcessedHookItem>,
  InferCreationAttributes<ProcessedHookItem>
> {
  declare id: CreationOptional<number>
  declare network: number
  declare type: string
  declare objectId: string
  declare createdAt: CreationOptional<Date>
  declare updatedAt: CreationOptional<Date>
}

ProcessedHookItem.init(
  {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER,
    },
    network: {
      allowNull: false,
      type: DataTypes.INTEGER,
    },
    type: {
      allowNull: false,
      type: DataTypes.STRING,
    },
    objectId: {
      allowNull: false,
      type: DataTypes.STRING,
      validate: {
        isIn: [['lock', 'key']],
      },
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
    modelName: 'ProcessedHookItems',
  }
)
