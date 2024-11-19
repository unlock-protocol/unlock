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
  declare creditCardCurrency?: string
  declare replyTo?: string | null
  declare creditCardPrice?: number | null
  declare emailSender?: string | null
  declare slug?: string
  declare checkoutConfigId?: string | null
  declare crossmintClientId?: string | null
  declare hookGuildId?: number | null
  declare unlockFeeChargedToUser?: boolean
  declare requiredGitcoinPassportScore?: number | null
  declare createdAt: CreationOptional<Date>
  declare updatedAt: CreationOptional<Date>
  declare promoCodes?: string[] | null
  declare passwords?: string[] | null
  declare allowList?: string[] | null
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
    hookGuildId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null,
    },
    unlockFeeChargedToUser: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    crossmintClientId: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null,
    },
    creditCardCurrency: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'usd', // let's use 'usd' as default currency for all the locks that does not have the value set
    },
    promoCodes: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true,
      defaultValue: [],
    },
    requiredGitcoinPassportScore: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null,
    },
    passwords: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true,
      defaultValue: [],
    },
    allowList: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true,
      defaultValue: [],
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
