import type {
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
} from 'sequelize'
import { Model } from 'sequelize'
import { sequelize, LocksmithDataTypes } from './sequelize'

export class Receipt extends Model<
  InferAttributes<Receipt>,
  InferCreationAttributes<Receipt>
> {
  declare id: CreationOptional<number>

  declare network: number
  declare lockAddress: string
  declare hash: string

  // receipts details
  declare fullname?: string
  declare businessName?: string
  declare addressLine1?: string
  declare addressLine2?: string
  declare city?: string
  declare zip?: string
  declare state?: string
  declare country?: string

  declare createdAt: CreationOptional<Date>
  declare updatedAt: CreationOptional<Date>
}

Receipt.init(
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
    hash: {
      allowNull: true,
      unique: true,
      primaryKey: true,
      type: LocksmithDataTypes.STRING,
    },
    fullname: {
      type: LocksmithDataTypes.STRING,
      allowNull: false,
    },
    businessName: {
      type: LocksmithDataTypes.STRING,
      allowNull: false,
    },
    addressLine1: {
      type: LocksmithDataTypes.STRING,
      allowNull: false,
    },
    addressLine2: {
      type: LocksmithDataTypes.STRING,
      allowNull: true,
    },
    city: {
      type: LocksmithDataTypes.STRING,
      allowNull: false,
    },
    zip: {
      type: LocksmithDataTypes.STRING,
      allowNull: false,
    },
    state: {
      type: LocksmithDataTypes.STRING,
      allowNull: false,
    },
    country: {
      type: LocksmithDataTypes.STRING,
      allowNull: false,
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
    modelName: 'Receipt',
    freezeTableName: true,
  }
)
