import type { InferAttributes, InferCreationAttributes } from 'sequelize'
import { Model, CreationOptional } from 'sequelize'
import { sequelize, LocksmithDataTypes } from './sequelize'

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
      type: LocksmithDataTypes.INTEGER,
    },
    lockAddress: {
      type: LocksmithDataTypes.STRING,
      allowNull: false,
    },
    network: {
      type: LocksmithDataTypes.NETWORK_ID,
      allowNull: false,
    },
    template: {
      type: LocksmithDataTypes.STRING,
      allowNull: false,
    },
    content: {
      type: LocksmithDataTypes.TEXT,
      allowNull: false,
      defaultValue: '',
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
    tableName: 'CustomEmailContents',
  }
)
