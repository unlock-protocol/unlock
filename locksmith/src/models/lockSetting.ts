import type { InferAttributes, InferCreationAttributes } from 'sequelize'
import { Model, CreationOptional, DataTypes } from 'sequelize'
import { LocksmithDataTypes, sequelize } from './sequelize'

export class LockSetting extends Model<
  InferAttributes<LockSetting>,
  InferCreationAttributes<LockSetting>
> {
  declare lockAddress: string
  declare network: number
  declare sendEmail: boolean
  declare replyTo?: string
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
      type: LocksmithDataTypes.NETWORK_ID,
    },
    sendEmail: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    replyTo: {
      type: DataTypes.STRING,
      allowNull: true,
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
