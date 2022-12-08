import type { InferAttributes, InferCreationAttributes } from 'sequelize'
import { Model, DataTypes, CreationOptional } from 'sequelize'
import { sequelize } from './sequelize'

export class Hook extends Model<
  InferAttributes<Hook>,
  InferCreationAttributes<Hook>
> {
  declare id: CreationOptional<number>
  declare network: number
  declare topic: string
  declare lock?: string
  declare expiration: Date
  declare mode: 'subscribe' | 'unsubscribe'
  declare callback: string
  declare secret?: string
  declare createdAt?: CreationOptional<Date>
  declare updatedAt?: CreationOptional<Date>
}

Hook.init(
  {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER,
    },
    network: {
      allowNull: false,
      type: DataTypes.STRING,
    },
    topic: {
      allowNull: false,
      type: DataTypes.STRING,
    },
    lock: {
      type: DataTypes.STRING,
    },
    expiration: {
      type: DataTypes.DATE,
    },
    mode: {
      type: DataTypes.STRING,
      validate: {
        isIn: [['subscribe', 'unsubscribe']],
      },
    },
    callback: {
      allowNull: false,
      type: DataTypes.STRING,
    },
    secret: {
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
    sequelize,
    modelName: 'Hooks',
  }
)
