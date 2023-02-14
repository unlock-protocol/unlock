import type { InferAttributes, InferCreationAttributes } from 'sequelize'
import { Model, DataTypes, CreationOptional } from 'sequelize'
import { sequelize } from './sequelize'

export class CustomEmailContent extends Model<
  InferAttributes<CustomEmailContent>,
  InferCreationAttributes<CustomEmailContent>
> {
  declare id: CreationOptional<number>
  declare lockAddress: string
  declare network: number
  declare template: string
  declare content?: string
  declare createdAt: CreationOptional<Date>
  declare updatedAt: CreationOptional<Date>
}

CustomEmailContent.init(
  {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER,
    },
    lockAddress: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    network: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    template: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: '',
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
    tableName: 'CustomEmailContents',
  }
)
