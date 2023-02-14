import type { InferAttributes, InferCreationAttributes } from 'sequelize'
import { Model, DataTypes, CreationOptional } from 'sequelize'
import { sequelize } from './sequelize'

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
      type: DataTypes.STRING,
      unique: 'id_unique',
      primaryKey: true,
    },
    address: {
      allowNull: false,
      type: DataTypes.STRING,
      unique: 'id_unique',
    },
    data: {
      type: DataTypes.JSON,
    },
    chain: {
      allowNull: false,
      type: DataTypes.INTEGER,
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
    modelName: 'KeyMetadata',
  }
)
