import type { InferAttributes, InferCreationAttributes } from 'sequelize'
import { Model, DataTypes, CreationOptional } from 'sequelize'
import { LocksmithDataTypes, sequelize } from './sequelize'

export class LockSetting extends Model<
  InferAttributes<LockSetting>,
  InferCreationAttributes<LockSetting>
> {
  declare lockAddress: string
  declare network: number
  declare sendEmail: boolean
  declare replyTo?: string | null
  declare creditCardPrice?: number | null
  declare emailSender?: string | null
  declare slug?: string
  declare checkoutConfigId?: string | null
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
    creditCardPrice: {
      type: DataTypes.FLOAT,
      allowNull: true,
      defaultValue: null,
    },
    emailSender: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null,
    },
    replyTo: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    slug: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
      defaultValue: null,
    },
    checkoutConfigId: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null,
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
