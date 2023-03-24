import type { InferAttributes, InferCreationAttributes } from 'sequelize'
import { Model, DataTypes, CreationOptional } from 'sequelize'
import { sequelize } from './sequelize'

export class LockSetting extends Model<
  InferAttributes<LockSetting>,
  InferCreationAttributes<LockSetting>
> {
  declare lockAddress: string
  declare network: number
  declare sendEmail: boolean
  declare createdAt: CreationOptional<Date>
  declare updatedAt: CreationOptional<Date>
}

LockSetting.init(
  {
    lockAddress: {
      allowNull: false,
      type: DataTypes.STRING,
      primaryKey: true,
    },
    network: {
      allowNull: false,
      type: DataTypes.INTEGER,
    },
    sendEmail: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
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
    modelName: 'LockSettings',
  }
)
