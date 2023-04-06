import type { InferAttributes, InferCreationAttributes } from 'sequelize'
import { Model, CreationOptional } from 'sequelize'
import { sequelize, LocksmithDataTypes } from './sequelize'

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
      type: LocksmithDataTypes.STRING,
      primaryKey: true,
    },
    network: {
      allowNull: false,
      type: LocksmithDataTypes.NETWORK_ID,
    },
    sendEmail: {
      type: LocksmithDataTypes.BOOLEAN,
      defaultValue: true,
    },
    replyTo: {
      type: LocksmithDataTypes.STRING,
      allowNull: true,
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
    modelName: 'LockSettings',
  }
)
