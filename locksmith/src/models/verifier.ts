import type {
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
} from 'sequelize'
import { Model } from 'sequelize'
import { LocksmithDataTypes, sequelize } from './sequelize'

export class Verifier extends Model<
  InferAttributes<Verifier>,
  InferCreationAttributes<Verifier>
> {
  declare id: CreationOptional<number>
  declare address: string
  declare lockAddress: string
  declare lockManager: string
  declare network: number
  declare createdAt: CreationOptional<Date>
  declare updatedAt: CreationOptional<Date>
}

Verifier.init(
  {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: LocksmithDataTypes.INTEGER,
    },
    address: {
      type: LocksmithDataTypes.STRING,
      allowNull: false,
    },
    lockAddress: {
      type: LocksmithDataTypes.STRING,
      allowNull: false,
    },
    network: {
      type: LocksmithDataTypes.INTEGER,
      allowNull: false,
    },
    lockManager: {
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
    modelName: 'Verifiers',
  }
)
