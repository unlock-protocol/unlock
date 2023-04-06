import type {
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
} from 'sequelize'
import { Model } from 'sequelize'
import { sequelize, LocksmithDataTypes } from './sequelize'

export class ReceiptBase extends Model<
  InferAttributes<ReceiptBase>,
  InferCreationAttributes<ReceiptBase>
> {
  declare id: CreationOptional<number>
  declare network: number
  declare lockAddress: string

  // receipts details
  declare supplierName?: string
  declare vat?: string
  declare servicePerformed?: string
  declare addressLine1?: string
  declare addressLine2?: string
  declare city?: string
  declare zip?: string
  declare state?: string
  declare country?: string

  declare createdAt: CreationOptional<Date>
  declare updatedAt: CreationOptional<Date>
}

ReceiptBase.init(
  {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: LocksmithDataTypes.INTEGER,
    },
    lockAddress: {
      type: LocksmithDataTypes.STRING,
      allowNull: true,
    },
    network: {
      type: LocksmithDataTypes.NETWORK_ID,
      allowNull: true,
    },
    supplierName: {
      type: LocksmithDataTypes.STRING,
      allowNull: true,
    },
    vat: {
      type: LocksmithDataTypes.STRING,
      allowNull: true,
    },
    servicePerformed: {
      type: LocksmithDataTypes.STRING,
      allowNull: true,
    },
    addressLine1: {
      type: LocksmithDataTypes.STRING,
      allowNull: true,
    },
    addressLine2: {
      type: LocksmithDataTypes.STRING,
      allowNull: true,
    },
    city: {
      type: LocksmithDataTypes.STRING,
      allowNull: true,
    },
    zip: {
      type: LocksmithDataTypes.STRING,
      allowNull: true,
    },
    state: {
      type: LocksmithDataTypes.STRING,
      allowNull: true,
    },
    country: {
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
    modelName: 'ReceiptBases',
  }
)
