import type {
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
} from 'sequelize'
import { Model } from 'sequelize'
import { sequelize, LocksmithDataTypes } from './sequelize'

export class ProcessedHookItem extends Model<
  InferAttributes<ProcessedHookItem>,
  InferCreationAttributes<ProcessedHookItem>
> {
  declare id: CreationOptional<number>
  declare network: number
  declare type: string
  declare objectId: string
  declare createdAt: CreationOptional<Date>
  declare updatedAt: CreationOptional<Date>
}

ProcessedHookItem.init(
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
    type: {
      allowNull: false,
      type: LocksmithDataTypes.STRING,
    },
    objectId: {
      allowNull: false,
      type: LocksmithDataTypes.STRING,
      validate: {
        isIn: [['lock', 'key']],
      },
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
    modelName: 'ProcessedHookItems',
  }
)
