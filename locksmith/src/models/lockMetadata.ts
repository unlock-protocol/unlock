import type {
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
} from 'sequelize'
import { Model, DataTypes } from 'sequelize'
import { sequelize } from './sequelize'

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
      type: DataTypes.STRING,
    },
    data: {
      allowNull: false,
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
    modelName: 'LockMetadata',
  }
)
