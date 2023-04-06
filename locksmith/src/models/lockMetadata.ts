import type {
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
} from 'sequelize'
import { Model } from 'sequelize'
import { sequelize, LocksmithDataTypes } from './sequelize'

export class LockMetadata extends Model<
  InferAttributes<LockMetadata>,
  InferCreationAttributes<LockMetadata>
> {
  declare data: any
  declare address: string
  declare chain: number
  declare createdAt: CreationOptional<Date>
  declare updatedAt: CreationOptional<Date>
}

LockMetadata.init(
  {
    address: {
      allowNull: false,
      primaryKey: true,
      type: LocksmithDataTypes.STRING,
    },
    data: {
      allowNull: false,
      type: LocksmithDataTypes.JSON,
    },
    chain: {
      allowNull: false,
      type: LocksmithDataTypes.NETWORK_ID,
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
    modelName: 'LockMetadata',
  }
)
