import type {
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
} from 'sequelize'
import { Model, DataTypes } from 'sequelize'
import { sequelize } from './sequelize'

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
      type: DataTypes.INTEGER,
    },
    lockAddress: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    network: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    hash: {
      allowNull: true,
      unique: true,
      primaryKey: true,
      type: DataTypes.STRING,
    },
    fullname: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    businessName: {
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
    modelName: 'Receipt',
    freezeTableName: true,
  }
)
