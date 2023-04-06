import type { InferAttributes, InferCreationAttributes } from 'sequelize'
import { Model, CreationOptional } from 'sequelize'
import { sequelize, LocksmithDataTypes } from './sequelize'

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
      type: LocksmithDataTypes.INTEGER,
    },
    network: {
      allowNull: false,
      type: LocksmithDataTypes.NETWORK_ID,
    },
    topic: {
      allowNull: false,
      type: LocksmithDataTypes.STRING,
    },
    lock: {
      type: LocksmithDataTypes.STRING,
    },
    expiration: {
      type: LocksmithDataTypes.DATE,
    },
    mode: {
      type: LocksmithDataTypes.STRING,
      validate: {
        isIn: [['subscribe', 'unsubscribe']],
      },
    },
    callback: {
      allowNull: false,
      type: LocksmithDataTypes.STRING,
    },
    secret: {
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
    sequelize,
    modelName: 'Hooks',
  }
)
