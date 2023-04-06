import type { InferAttributes, InferCreationAttributes } from 'sequelize'
import { Model, CreationOptional } from 'sequelize'
import { sequelize, LocksmithDataTypes } from './sequelize'

export class KeyMetadata extends Model<
  InferAttributes<KeyMetadata>,
  InferCreationAttributes<KeyMetadata>
> {
  declare id: string
  declare data: any
  declare address: string
  declare chain: number
  declare createdAt: CreationOptional<Date>
  declare updatedAt: CreationOptional<Date>
}

KeyMetadata.init(
  {
    id: {
      allowNull: false,
      type: LocksmithDataTypes.STRING,
      unique: 'id_unique',
      primaryKey: true,
    },
    address: {
      allowNull: false,
      type: LocksmithDataTypes.STRING,
      unique: 'id_unique',
    },
    data: {
      type: LocksmithDataTypes.JSON,
    },
    chain: {
      allowNull: false,
      type: LocksmithDataTypes.INTEGER,
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
    modelName: 'KeyMetadata',
  }
)
