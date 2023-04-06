import type {
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
} from 'sequelize'
import { Model } from 'sequelize'
import { sequelize, LocksmithDataTypes } from './sequelize'

export class LockIcons extends Model<
  InferAttributes<LockIcons>,
  InferCreationAttributes<LockIcons>
> {
  declare id: CreationOptional<number>
  declare lock: string
  declare chain: number
  declare icon: string
  declare createdAt: CreationOptional<Date>
  declare updatedAt: CreationOptional<Date>
}

LockIcons.init(
  {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: LocksmithDataTypes.INTEGER,
    },
    lock: {
      type: LocksmithDataTypes.STRING,
      unique: 'lock_chain_index',
    },
    chain: {
      type: LocksmithDataTypes.NETWORK_ID,
      unique: 'lock_chain_index',
    },
    icon: {
      type: LocksmithDataTypes.TEXT,
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
    modelName: 'LockIcons',
  }
)
