import type {
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
} from 'sequelize'
import { Model, DataTypes } from 'sequelize'
import { sequelize } from './sequelize'

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
      type: DataTypes.INTEGER,
    },
    lockAddress: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    network: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    supplierName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    vat: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    servicePerformed: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    addressLine1: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    addressLine2: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    city: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    zip: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    state: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    country: {
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
    modelName: 'ReceiptBases',
  }
)
