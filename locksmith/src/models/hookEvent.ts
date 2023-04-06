import type { InferAttributes, InferCreationAttributes } from 'sequelize'
import { Model, CreationOptional } from 'sequelize'
import { sequelize, LocksmithDataTypes } from './sequelize'

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
    state: {
      type: LocksmithDataTypes.STRING,
    },
    body: {
      type: LocksmithDataTypes.JSON,
    },
    hookId: {
      allowNull: false,
      type: LocksmithDataTypes.INTEGER,
    },
    attempts: {
      type: LocksmithDataTypes.INTEGER,
    },
    key: {
      type: LocksmithDataTypes.STRING,
    },
    createdAt: {
      allowNull: false,
      type: LocksmithDataTypes.DATE,
    },
    lastError: {
      type: LocksmithDataTypes.STRING,
    },
    updatedAt: {
      allowNull: false,
      type: LocksmithDataTypes.DATE,
    },
  },
  {
    sequelize,
    modelName: 'HookEvents',
  }
)
