import type { InferAttributes, InferCreationAttributes } from 'sequelize'
import { Model, CreationOptional } from 'sequelize'
import { sequelize, LocksmithDataTypes } from './sequelize'

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
      type: LocksmithDataTypes.INTEGER,
    },
    network: {
      allowNull: false,
      type: LocksmithDataTypes.NETWORK_ID,
    },
    lockAddress: {
      type: LocksmithDataTypes.STRING,
    },
    keyId: {
      allowNull: false,
      type: LocksmithDataTypes.STRING,
    },
    initiatedBy: {
      allowNull: true,
      type: LocksmithDataTypes.STRING,
    },
    tx: {
      allowNull: true,
      type: LocksmithDataTypes.STRING,
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
    modelName: 'KeyRenewals',
    sequelize,
  }
)
