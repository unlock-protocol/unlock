import type {
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
} from 'sequelize'
import { Model, DataTypes } from 'sequelize'
import { sequelize } from './sequelize'

export class Payload extends Model<
  InferAttributes<Payload>,
  InferCreationAttributes<Payload>
> {
  declare id: CreationOptional<string>
  declare payload: CreationOptional<any>
  declare createdAt: CreationOptional<Date>
  declare updatedAt: CreationOptional<Date>
}

Payload.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false,
      defaultValue: sequelize.literal('gen_random_uuid()'),
    },
    payload: {
      type: DataTypes.JSONB,
      allowNull: true,
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
    modelName: 'Payload',
    tableName: 'Payload',
    sequelize,
  }
)
