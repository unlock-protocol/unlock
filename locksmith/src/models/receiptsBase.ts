import type {
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
} from 'sequelize'
import { Model, DataTypes } from 'sequelize'
import { sequelize } from './sequelize'

export class ReceiptsBase extends Model<
  InferAttributes<ReceiptsBase>,
  InferCreationAttributes<ReceiptsBase>
> {
  // receipts details
  declare hash: string
  declare supplier: string
  declare vat: string
  declare servicePerformed: string
  declare addressLine1: string
  declare addressLine2?: string | null
  declare city: string
  declare zip: string
  declare state: string
  declare country: string

  declare network: number
  declare lockAddress: string

  declare createdAt: CreationOptional<Date>
  declare updatedAt: CreationOptional<Date>
}

ReceiptsBase.init(
  {
    hash: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      primaryKey: true,
    },
    supplier: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    vat: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    servicePerformed: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    addressLine1: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    addressLine2: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    city: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    zip: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    state: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    country: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    network: {
      type: DataTypes.NUMBER,
      allowNull: false,
    },
    lockAddress: {
      type: DataTypes.STRING,
      allowNull: false,
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
    modelName: 'ReceiptsBase',
  }
)
