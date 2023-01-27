import type { InferAttributes, InferCreationAttributes } from 'sequelize'
import { Model, DataTypes, CreationOptional } from 'sequelize'
import { sequelize } from './sequelize'

export class HookEvent extends Model<
  InferAttributes<HookEvent>,
  InferCreationAttributes<HookEvent>
> {
  declare id: CreationOptional<number>
  declare network: number
  declare lock?: string
  declare key?: string
  declare hookId: number
  declare topic: string
  declare body: any
  declare state: string
  declare lastError?: string
  declare attempts: number
  declare createdAt?: CreationOptional<Date>
  declare updatedAt?: CreationOptional<Date>
}

HookEvent.init(
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
    topic: {
      allowNull: false,
      type: DataTypes.STRING,
    },
    lock: {
      type: DataTypes.STRING,
    },
    state: {
      type: DataTypes.STRING,
    },
    body: {
      type: DataTypes.JSON,
    },
    hookId: {
      allowNull: false,
      type: DataTypes.INTEGER,
    },
    attempts: {
      type: DataTypes.INTEGER,
    },
    key: {
      type: DataTypes.STRING,
    },
    createdAt: {
      allowNull: false,
      type: DataTypes.DATE,
    },
    lastError: {
      type: DataTypes.STRING,
    },
    updatedAt: {
      allowNull: false,
      type: DataTypes.DATE,
    },
  },
  {
    sequelize,
    modelName: 'HookEvents',
  }
)
