import type { InferAttributes, InferCreationAttributes } from 'sequelize'
import { Model, DataTypes, CreationOptional } from 'sequelize'
import { sequelize } from './sequelize'

export class KeyRenewal extends Model<
  InferAttributes<KeyRenewal>,
  InferCreationAttributes<KeyRenewal>
> {
  declare id: CreationOptional<number>
  declare lockAddress: string
  declare keyId: string
  declare initiatedBy?: string
  declare tx: string
  declare network: number
  declare createdAt: CreationOptional<Date>
  declare updatedAt: CreationOptional<Date>
}

KeyRenewal.init(
  {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER,
    },
    network: {
      allowNull: false,
      type: DataTypes.INTEGER,
    },
    lockAddress: {
      type: DataTypes.STRING,
    },
    keyId: {
      allowNull: false,
      type: DataTypes.STRING,
    },
    initiatedBy: {
      allowNull: true,
      type: DataTypes.STRING,
    },
    tx: {
      allowNull: true,
      type: DataTypes.STRING,
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
    modelName: 'KeyRenewals',
    sequelize,
  }
)
